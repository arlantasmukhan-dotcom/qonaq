import type { NextRequest } from "next/server";
import { z } from "zod";
import { newId } from "@/lib/codes";
import { clientIp, fail, json, readJson } from "@/lib/http";
import { allow } from "@/lib/ratelimit";
import { insertPhoto } from "@/lib/repo";

const MAX_BYTES = 700 * 1024;

const Body = z.object({
  // data URL produced by the browser after resizing: "data:image/jpeg;base64,...."
  dataUrl: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
});

/** Upload one already-compressed photo. Returns its id for /api/photo/[id]. */
export async function POST(req: NextRequest) {
  if (!allow(`photo:${clientIp(req) ?? "?"}`, 40, 10 * 60_000)) {
    return fail("rate_limited", "Too many photos, try again later", 429);
  }
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return fail("bad_request", "Expected a JPEG/PNG/WebP data URL", 400);
  const [head, data] = parsed.data.dataUrl.split(",");
  const mime = head.slice(5, head.indexOf(";"));
  if ((data.length * 3) / 4 > MAX_BYTES) return fail("bad_request", "Photo is too large; resize to ~1280px", 413);
  const id = newId();
  await insertPhoto({ id, mime, data });
  return json({ id, url: `/api/photo/${id}` });
}
