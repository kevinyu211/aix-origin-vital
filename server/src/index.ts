// Tiny in-repo live overlay HTTP server.
// POST /ocr  — camera image → structured MedItem[] (Anthropic vision)
// POST /tts  — text + locale → MiniMax T2A audio (zh-HK/粤, zh-CN, en)
// Keys: ANTHROPIC_API_KEY, MINIMAX_API_KEY, optional MINIMAX_GROUP_ID
// Missing keys → HTTP 503 generic message so the Expo 示範 path still works.

import http from "node:http";
import type { MedSource } from "../../src/modules/types";
import { hasAnthropicKey, runAnthropicOcr } from "./ocr";
import { hasMiniMaxKey, runMiniMaxTts } from "./tts";
import {
  corsHeaders,
  parseMultipart,
  readBody,
  sendInvalid,
  sendJson,
  sendUnavailable,
} from "./http";

const PORT = Number(process.env.PORT) || 8787;

function isSource(v: unknown): v is MedSource {
  return v === "sheet" || v === "box";
}

async function handleOcr(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (!hasAnthropicKey()) {
    sendUnavailable(res);
    return;
  }
  let imageBase64 = "";
  let mediaType = "image/jpeg";
  let source: MedSource = "sheet";
  const contentType = req.headers["content-type"] ?? "";

  try {
    const raw = await readBody(req);
    if (contentType.includes("multipart/form-data")) {
      const parsed = parseMultipart(raw, contentType);
      const file = parsed.files.find((f) => f.field === "image") ?? parsed.files[0];
      if (!file || file.data.length === 0) {
        sendInvalid(res);
        return;
      }
      imageBase64 = file.data.toString("base64");
      if (file.mime.startsWith("image/")) mediaType = file.mime;
      if (isSource(parsed.fields.source)) source = parsed.fields.source;
    } else {
      const body = JSON.parse(raw.toString("utf8")) as {
        imageBase64?: unknown;
        mediaType?: unknown;
        source?: unknown;
      };
      if (typeof body.imageBase64 !== "string" || !body.imageBase64) {
        sendInvalid(res);
        return;
      }
      imageBase64 = body.imageBase64;
      if (typeof body.mediaType === "string" && body.mediaType.startsWith("image/")) {
        mediaType = body.mediaType;
      }
      if (isSource(body.source)) source = body.source;
    }
  } catch {
    sendInvalid(res);
    return;
  }

  try {
    const items = await runAnthropicOcr({ imageBase64, mediaType, source });
    sendJson(res, 200, { items });
  } catch {
    sendUnavailable(res);
  }
}

async function handleTts(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  if (!hasMiniMaxKey()) {
    sendUnavailable(res);
    return;
  }
  let text = "";
  let locale = "zh-HK";
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString("utf8")) as { text?: unknown; locale?: unknown };
    if (typeof body.text !== "string" || !body.text.trim()) {
      sendInvalid(res);
      return;
    }
    text = body.text.trim();
    if (typeof body.locale === "string" && body.locale) locale = body.locale;
  } catch {
    sendInvalid(res);
    return;
  }

  try {
    const audio = await runMiniMaxTts({ text, locale });
    sendJson(res, 200, audio);
  } catch {
    sendUnavailable(res);
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const method = req.method ?? "GET";

  if (method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (method === "POST" && url.pathname === "/ocr") {
    void handleOcr(req, res).then(
      () => {
        // method + status only — never the image
      },
      () => sendUnavailable(res),
    );
    return;
  }

  if (method === "POST" && url.pathname === "/tts") {
    void handleTts(req, res).then(
      () => {
        // method + status only — never the text payload or key
      },
      () => sendUnavailable(res),
    );
    return;
  }

  sendJson(res, 404, { error: "not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  // Do not print whether keys are present or any secret names/values.
  process.stdout.write(`live overlay server listening on :${PORT}\n`);
});
