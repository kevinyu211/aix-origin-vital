// ocrMap — turns model / server JSON into MedItem[] matching the mock vision shape.
// Pure and UI-free so the live client, the tiny server, and unit tests share one mapper.

import type { MedItem, MedSource } from "./types";

export interface OcrMedicineRow {
  raw?: unknown;
  name?: unknown;
  strength?: unknown;
}

const STRENGTH_RE = /^(\d+(?:\.\d+)?)(mg|mcg|µg|ug|g|ml|iu|%)$/i;

/** Collapse "80 mg" / "80MG" → "80mg". Unknown units are trimmed, not invented. */
export function normalizeStrength(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const compact = input.trim().replace(/\s+/g, "");
  if (!compact) return undefined;
  const m = compact.match(STRENGTH_RE);
  if (!m) return compact;
  const unit = m[2].toLowerCase() === "ug" || m[2].toLowerCase() === "µg" ? "mcg" : m[2].toLowerCase();
  return `${m[1]}${unit}`;
}

export function mapOcrRowsToMedItems(rows: unknown, source: MedSource): MedItem[] {
  if (!Array.isArray(rows)) return [];
  const items: MedItem[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as OcrMedicineRow;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    const raw = typeof r.raw === "string" && r.raw.trim() ? r.raw.trim() : name;
    if (!name && !raw) continue;
    const strength =
      typeof r.strength === "string" ? normalizeStrength(r.strength) : undefined;
    items.push({
      raw: raw || name,
      name: name || raw,
      strength,
      source,
    });
  }
  return items;
}

/**
 * Parse a model text reply (raw JSON, `{ items }`, or fenced ```json) into MedItem[].
 * Invalid / empty input → [] so the UI can steer back to 示範.
 */
export function parseOcrModelText(text: string, source: MedSource): MedItem[] {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (!stripped) return [];
  try {
    const parsed: unknown = JSON.parse(stripped);
    if (Array.isArray(parsed)) return mapOcrRowsToMedItems(parsed, source);
    if (parsed && typeof parsed === "object") {
      const obj = parsed as { items?: unknown; medicines?: unknown };
      if (Array.isArray(obj.items)) return mapOcrRowsToMedItems(obj.items, source);
      if (Array.isArray(obj.medicines)) return mapOcrRowsToMedItems(obj.medicines, source);
    }
    return [];
  } catch {
    return [];
  }
}
