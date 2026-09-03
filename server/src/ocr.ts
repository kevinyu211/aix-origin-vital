// Anthropic Messages API + image → MedItem[] via the shared OCR mapper.
// Never logs the image bytes or the API key.

import { parseOcrModelText } from "../../src/modules/ocrMap";
import type { MedItem, MedSource } from "../../src/modules/types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
// Current Claude vision-capable model (Messages API + image source).
const ANTHROPIC_MODEL = "claude-sonnet-4-5";

const OCR_PROMPT = [
  "Extract medicine names from this photo of a Hong Kong hospital discharge sheet or a medicine box.",
  'Return ONLY a JSON array of objects: {"raw":"exact text seen","name":"medicine name","strength":"500mg"}.',
  "strength is optional. Use compact strengths like 500mg, 10mg, 80mg.",
  "No diagnosis, no advice, no extra keys, no markdown.",
  "If nothing readable, return [].",
].join(" ");

const ALLOWED_MEDIA = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function stripDataUrl(imageBase64: string): { data: string; mediaType: string | undefined } {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(imageBase64);
  if (m) return { mediaType: m[1], data: m[2] };
  return { data: imageBase64, mediaType: undefined };
}

export async function runAnthropicOcr(args: {
  imageBase64: string;
  source: MedSource;
  mediaType?: string;
}): Promise<MedItem[]> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    const err = new Error("unavailable");
    (err as Error & { code?: string }).code = "NO_KEY";
    throw err;
  }
  const stripped = stripDataUrl(args.imageBase64);
  const mediaType = stripped.mediaType ?? args.mediaType ?? "image/jpeg";
  if (!ALLOWED_MEDIA.has(mediaType) || !stripped.data) {
    return [];
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: stripped.data },
            },
            { type: "text", text: OCR_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = new Error("unavailable");
    (err as Error & { code?: string }).code = "UPSTREAM";
    throw err;
  }

  const payload = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = (payload.content ?? [])
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text)
    .join("\n");
  return parseOcrModelText(text, args.source);
}
