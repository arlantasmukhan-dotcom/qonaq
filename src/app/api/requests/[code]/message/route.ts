import type { NextRequest } from "next/server";
import { z } from "zod";
import { translateMessage } from "@/lib/ai";
import { newId } from "@/lib/codes";
import { aiFail, fail, json, readJson } from "@/lib/http";
import { getRequestByCode, insertMessage, touchRequest } from "@/lib/repo";
import type { Message } from "@/lib/types";

const Body = z.object({ text: z.string().trim().min(1).max(1000) });

/** Guest adds a follow-up message on the request page. Response: { message } */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return fail("bad_request", "Message text is required", 400);

  const request = await getRequestByCode(code.toUpperCase());
  if (!request) return fail("not_found", "Request not found", 404);

  let t;
  try {
    t = await translateMessage(parsed.data.text, "A tourist writes to a guesthouse host about a booking.");
  } catch (err) {
    return aiFail(err);
  }
  const message: Message = {
    id: newId(),
    requestId: request.id,
    author: "guest",
    lang: t.detectedLang === "other" ? request.guestLang : t.detectedLang,
    original: parsed.data.text,
    translations: t.translations,
    action: null,
    createdAt: Date.now(),
  };
  await insertMessage(message);
  await touchRequest(request.id);
  return json({ message });
}
