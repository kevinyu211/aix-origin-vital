// reconcile module — PURE deterministic reconciliation.
//
// Rules (locked spec):
//  - match: exact brand/alias -> normalised -> Levenshtein<=2 -> none
//  - group by activeIngredient
//  - sheet+box = continue ; sheet only = new ; boxes only = notOnList
//  - >=2 boxes for same ingredient = duplicateInDrawer
//  - strength mismatch between sheet and box = strengthChanged
//  - unmatched items are NEVER bucketed; they always go on the pharmacist card
//  - NO model here. Same input -> identical output.

import type {
  AttentionItem,
  Bucket,
  MedItem,
  ReconcileFlag,
  ReconcileGroup,
  ReconcileResult,
} from "./types";
import { matchName, strengthsDiffer } from "./match";

interface WorkingGroup {
  key: string;
  activeIngredient: string | null;
  displayName: string;
  entry: ReconcileGroup["entry"];
  matchMethod: ReconcileGroup["matchMethod"];
  sheetItems: MedItem[];
  boxItems: MedItem[];
  order: number; // first-seen order, for stable output
}

function firstStrength(items: MedItem[]): string | undefined {
  for (const it of items) if (it.strength) return it.strength;
  return undefined;
}

export function reconcile(sheetItems: MedItem[], boxItems: MedItem[]): ReconcileResult {
  const groups = new Map<string, WorkingGroup>();
  let orderCounter = 0;

  const ingest = (item: MedItem) => {
    const { entry, method } = matchName(item.name);
    const key = entry ? entry.activeIngredient : `unmatched:${item.name.trim().toLowerCase()}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        activeIngredient: entry ? entry.activeIngredient : null,
        displayName: entry ? entry.activeIngredient : item.name.trim(),
        entry: entry ?? null,
        matchMethod: method,
        sheetItems: [],
        boxItems: [],
        order: orderCounter++,
      };
      groups.set(key, g);
    }
    if (item.source === "sheet") g.sheetItems.push(item);
    else g.boxItems.push(item);
  };

  // Deterministic ingest order: all sheet items first, then all box items.
  for (const it of sheetItems) ingest(it);
  for (const it of boxItems) ingest(it);

  const outGroups: ReconcileGroup[] = [];
  const attention: AttentionItem[] = [];

  for (const g of [...groups.values()].sort((a, b) => a.order - b.order)) {
    const hasSheet = g.sheetItems.length > 0;
    const hasBox = g.boxItems.length > 0;
    const flags: ReconcileFlag[] = [];

    let bucket: Bucket;
    if (g.entry === null) {
      bucket = "unmatched";
    } else if (hasSheet && hasBox) {
      bucket = "continue";
    } else if (hasSheet) {
      bucket = "new";
    } else {
      bucket = "notOnList";
    }

    // duplicate: >=2 boxes of the same ingredient (only meaningful when matched)
    if (g.entry !== null && g.boxItems.length >= 2) flags.push("duplicateInDrawer");

    // strengthChanged: sheet vs box strength mismatch (only meaningful when matched & both present)
    const sheetStrength = firstStrength(g.sheetItems);
    const boxStrength = firstStrength(g.boxItems);
    let strengthDetail: ReconcileGroup["strengthDetail"];
    if (g.entry !== null && hasSheet && hasBox && strengthsDiffer(sheetStrength, boxStrength)) {
      flags.push("strengthChanged");
      strengthDetail = { sheet: sheetStrength, box: boxStrength };
    }

    outGroups.push({
      key: g.key,
      activeIngredient: g.activeIngredient,
      displayName: g.displayName,
      entry: g.entry,
      matchMethod: g.matchMethod,
      bucket,
      flags,
      sheetItems: g.sheetItems,
      boxItems: g.boxItems,
      strengthDetail,
    });

    // Attention list feeds the pharmacist hand-off card.
    if (bucket === "unmatched") {
      attention.push({ key: g.key, displayName: g.displayName, reason: "unmatched" });
    }
    if (flags.includes("duplicateInDrawer")) {
      attention.push({ key: g.key, displayName: g.displayName, reason: "duplicateInDrawer" });
    }
    if (flags.includes("strengthChanged")) {
      attention.push({
        key: g.key,
        displayName: g.displayName,
        reason: "strengthChanged",
        detail: strengthDetail,
      });
    }
  }

  return { groups: outGroups, attention };
}

/** Convenience selectors for the UI (still pure). */
export function groupsByBucket(result: ReconcileResult, bucket: Bucket): ReconcileGroup[] {
  return result.groups.filter((g) => g.bucket === bucket);
}
