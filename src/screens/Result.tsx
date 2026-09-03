// S3 — Result. Three groups (continue / new / notOnList) + unmatched, a LOUD duplicate
// reveal, strength-changed labels, 「聽晒」 read-aloud, and a free-text 「有嘢想問？」 box
// that triggers the refusal flow. It NEVER tells anyone to start or stop anything.

import React, { useMemo, useState } from "react";
import { TextInput, View } from "react-native";
import {
  Body,
  Card,
  DisclaimerFooter,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Small,
  SpeakButton,
  Title,
  TopBar,
} from "../components/UIKit";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { bucketColor, colors, radius, spacing } from "../modules/ui";
import { groupsByBucket } from "../modules/reconcile";
import type { Bucket, ReconcileGroup } from "../modules/types";
import { classifyQuery, buildRefusal } from "../modules/compliance";

function groupLabel(g: ReconcileGroup, lang: "zh-HK" | "en"): string {
  if (!g.entry) return "";
  const brand = g.entry.brands[0];
  if (!brand) return "";
  if (lang === "en") return brand.en;
  return brand.zh ?? brand.en;
}

function groupTitle(g: ReconcileGroup): string {
  if (!g.entry) return g.displayName;
  return `${g.entry.inn_zh}（${g.entry.inn}）`;
}

function GroupCard({ g }: { g: ReconcileGroup }) {
  const { lang } = useApp();
  const s = L(lang);
  const strength =
    g.sheetItems.find((i) => i.strength)?.strength ?? g.boxItems.find((i) => i.strength)?.strength;
  return (
    <Card style={{ borderLeftWidth: 6, borderLeftColor: bucketColor(g.bucket) }}>
      <Heading>{groupTitle(g)}</Heading>
      {strength ? <Small>{strength}</Small> : null}
      {groupLabel(g, lang) ? <Body color={colors.inkSoft}>{groupLabel(g, lang)}</Body> : null}
      {g.flags.includes("strengthChanged") && g.strengthDetail ? (
        <View style={{ backgroundColor: "#FBEFE1", padding: spacing.sm, borderRadius: radius.sm }}>
          <Body color={colors.notOnList}>
            {s.s3.strengthChanged(g.strengthDetail.sheet ?? "?", g.strengthDetail.box ?? "?")}
          </Body>
        </View>
      ) : null}
    </Card>
  );
}

function GroupSection({ bucket, title }: { bucket: Bucket; title: string }) {
  const { result, lang } = useApp();
  const s = L(lang);
  const groups = groupsByBucket(result, bucket);
  return (
    <View style={{ gap: spacing.sm }}>
      <Heading color={bucketColor(bucket)}>{title}</Heading>
      {groups.length === 0 ? (
        <Small>{s.s3.empty}</Small>
      ) : (
        groups.map((g) => <GroupCard key={g.key} g={g} />)
      )}
    </View>
  );
}

export function Result() {
  const { lang, goTo, result, speak, openRefusal } = useApp();
  const s = L(lang);
  const [ask, setAsk] = useState("");
  const [asked, setAsked] = useState<string | null>(null);

  const duplicates = useMemo(
    () => result.groups.filter((g) => g.flags.includes("duplicateInDrawer")),
    [result],
  );

  const spokenSummary = useMemo(() => {
    const line = (b: Bucket, label: string) => {
      const names = groupsByBucket(result, b).map((g) => g.displayName).join("、");
      return names ? `${label}：${names}。` : "";
    };
    const dup = duplicates.map((g) => s.s3.revealBody(g.displayName)).join(" ");
    return [
      line("continue", s.s3.continue),
      line("new", s.s3.new),
      line("notOnList", s.s3.notOnList),
      line("unmatched", s.s3.unmatched),
      dup,
    ]
      .filter(Boolean)
      .join(" ");
  }, [result, duplicates, s]);

  const submitAsk = () => {
    const text = ask.trim();
    if (!text) return;
    const { refuse } = classifyQuery(text);
    if (refuse) {
      openRefusal(buildRefusal(lang));
    } else {
      setAsked(text);
    }
    setAsk("");
  };

  return (
    <Screen>
      <TopBar onBack={() => goTo("S2")} />
      <Title>{s.s3.title}</Title>
      <SpeakButton text={spokenSummary} />
      <PrimaryButton label={`🔊 ${s.s3.listenAll}`} color={colors.ink} onPress={() => speak(spokenSummary)} />

      {duplicates.map((g) => (
        <Card key={`reveal-${g.key}`} style={{ backgroundColor: "#FBE7E4", borderColor: colors.reveal, borderWidth: 3 }}>
          <Heading color={colors.reveal}>⚠︎ {s.s3.revealTitle}</Heading>
          <Body color={colors.reveal}>{s.s3.revealBody(g.displayName)}</Body>
          <SpeakButton text={`${s.s3.revealTitle} ${s.s3.revealBody(g.displayName)}`} small />
        </Card>
      ))}

      <GroupSection bucket="continue" title={s.s3.continue} />
      <GroupSection bucket="new" title={s.s3.new} />
      <GroupSection bucket="notOnList" title={s.s3.notOnList} />
      <GroupSection bucket="unmatched" title={s.s3.unmatched} />

      <Card>
        <Heading>{s.s3.askLabel}</Heading>
        <TextInput
          value={ask}
          onChangeText={setAsk}
          placeholder={s.s3.askPlaceholder}
          placeholderTextColor={colors.inkSoft}
          style={{
            borderWidth: 1.5,
            borderColor: colors.line,
            borderRadius: radius.sm,
            padding: spacing.md,
            fontSize: 18,
            color: colors.ink,
            minHeight: 56,
          }}
          multiline
        />
        <PrimaryButton label={s.s3.askSend} onPress={submitAsk} color={colors.new} />
        {asked ? (
          <Small color={colors.inkSoft}>
            「{asked}」— {lang === "en" ? "noted for your pharmacist card." : "我會加落藥劑師問題卡度。"}
          </Small>
        ) : null}
      </Card>

      <PrimaryButton label={s.s3.pharmacistCta} color={colors.continue} onPress={() => goTo("S4")} />
      <SecondaryButton label={s.s5.title} onPress={() => goTo("S5")} />

      <DisclaimerFooter />
    </Screen>
  );
}
