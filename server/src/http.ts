// Tiny CORS JSON/multipart HTTP helpers. Never log request bodies (images / text / keys).

import type { IncomingMessage, ServerResponse } from "node:http";

export const MAX_BODY = 8 * 1024 * 1024;
export const LIVE_UNAVAILABLE = "live service unavailable";

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(json),
    ...corsHeaders(),
  });
  res.end(json);
}

export function sendUnavailable(res: ServerResponse): void {
  sendJson(res, 503, { error: LIVE_UNAVAILABLE });
}

export function sendInvalid(res: ServerResponse): void {
  sendJson(res, 400, { error: "invalid request" });
}

export async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BODY) {
      const err = new Error("too large");
      (err as Error & { code?: string }).code = "TOO_LARGE";
      throw err;
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function splitBuffer(buf: Buffer, sep: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;
  while (start <= buf.length) {
    const idx = buf.indexOf(sep, start);
    if (idx === -1) {
      parts.push(buf.subarray(start));
      break;
    }
    parts.push(buf.subarray(start, idx));
    start = idx + sep.length;
  }
  return parts;
}

export interface MultipartFile {
  field: string;
  filename: string;
  mime: string;
  data: Buffer;
}

export function parseMultipart(
  buffer: Buffer,
  contentType: string,
): { fields: Record<string, string>; files: MultipartFile[] } {
  const bm = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!bm) return { fields: {}, files: [] };
  const rawBoundary = (bm[1] ?? bm[2] ?? "").trim();
  if (!rawBoundary) return { fields: {}, files: [] };
  const delim = Buffer.from(`--${rawBoundary}`);
  const parts = splitBuffer(buffer, delim);
  const fields: Record<string, string> = {};
  const files: MultipartFile[] = [];

  for (const part of parts) {
    if (part.length < 4) continue;
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;
    const header = part.subarray(0, headerEnd).toString("utf8");
    let data = part.subarray(headerEnd + 4);
    if (data.subarray(-2).toString() === "\r\n") data = data.subarray(0, -2);
    const nameM = /name="([^"]+)"/i.exec(header);
    if (!nameM) continue;
    const filenameM = /filename="([^"]*)"/i.exec(header);
    if (filenameM) {
      const mimeM = /Content-Type:\s*([^\r\n]+)/i.exec(header);
      files.push({
        field: nameM[1],
        filename: filenameM[1],
        mime: (mimeM?.[1] ?? "application/octet-stream").trim(),
        data,
      });
    } else {
      fields[nameM[1]] = data.toString("utf8");
    }
  }
  return { fields, files };
}
