import type { NextRequest } from "next/server";
import { z } from "zod";
import { translateMessage } from "@/lib/ai";
import { newId } from "@/lib/codes";
import { aiFail, baseUrl, clientIp, fail, json, readJson } from "@/lib/http";
import { allow } from "@/lib/ratelimit";
import { getListingById, getRequestByCode, insertMessage, touchRequest } from "@/lib/repo";
import { followUpMessage, waLink } from "@/lib/templates";
import type { Message } from "@/lib/types";

// AI translation can take several seconds; give serverless hosts room before they cut the request.
export const maxDuration = 30;

const Body = z.object({ text: z.string().trim().min(1).max(1000) });

/**
 * Guest adds a follow-up message on the request page. Response: { message, waUrl }.
 * The host gets no push for it, so waUrl lets the guest forward it (in Russian, with the reply link)
 * to the host's WhatsApp. It carries no host key: the host answers from their dashboard or the first message.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!allow(`msg:${code}:${clientIp(req) ?? "?"}`, 10, 10 * 60_000)) {
    return fail("rate_limited", "Too many messages, try again later", 429);
  }
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

  // The note links to the host's own dashboard, never to /r/CODE?k=…: anyone who knows the public
  // request code can post here, so the reply key must not come back in this response.
  const listing = await getListingById(request.listingId);
  const waUrl = listing
    ? waLink(
        listing.whatsapp,
        followUpMessage({
          guestName: request.guestName,
          code: request.code,
          textRu: message.translations.ru || message.original,
          dashboardUrl: `${baseUrl(req)}/host/${listing.id}`,
        }),
      )
    : null;
  return json({ message, waUrl });
}
