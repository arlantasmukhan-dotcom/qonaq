import type { NextRequest } from "next/server";
import { z } from "zod";
import { translateMessage } from "@/lib/ai";
import { newId } from "@/lib/codes";
import { aiFail, fail, json, readJson, safeEqual } from "@/lib/http";
import { getListingById, getRequestByCode, insertMessage, pushEvent, setRequestStatus, touchRequest } from "@/lib/repo";
import { quickReply } from "@/lib/templates";
import { LANGS, type Lang, type Message } from "@/lib/types";

const Body = z
  .object({
    k: z.string().min(4),
    action: z.enum(["available", "busy", "car"]).optional(),
    text: z.string().trim().min(1).max(1000).optional(),
    lang: z.enum(LANGS).default("ru"),
  })
  .refine((b) => b.action || b.text, { message: "action or text is required" });

/**
 * Host answers a request: a quick action (instant, fixed translations) or free text/voice (translated by AI).
 * Response: { message, status }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return fail("bad_request", parsed.error.issues[0]?.message ?? "Invalid body", 400);
  const b = parsed.data;

  const request = await getRequestByCode(code.toUpperCase());
  if (!request) return fail("not_found", "Request not found", 404);
  if (!safeEqual(b.k, request.hostKey)) return fail("forbidden", "Only the host can reply", 403);
  const listing = await getListingById(request.listingId);
  if (!listing) return fail("not_found", "Listing not found", 404);

  let message: Message;
  if (b.action) {
    const car = listing.extras.find((e) => e.kind === "car");
    const translations = quickReply(b.action, {
      dateFrom: request.dateFrom,
      dateTo: request.dateTo,
      carPriceKzt: car?.priceKzt ?? null,
    });
    message = {
      id: newId(),
      requestId: request.id,
      author: "host",
      lang: b.lang,
      original: translations[b.lang],
      translations,
      action: b.action,
      createdAt: Date.now(),
    };
    if (b.action !== "car") await setRequestStatus(request.id, b.action);
    else await touchRequest(request.id);
  } else {
    let t;
    try {
      t = await translateMessage(b.text!, "A guesthouse host replies to a tourist's booking request.");
    } catch (err) {
      return aiFail(err);
    }
    const lang: Lang = t.detectedLang === "other" ? b.lang : t.detectedLang;
    message = {
      id: newId(),
      requestId: request.id,
      author: "host",
      lang,
      original: b.text!,
      translations: t.translations,
      action: null,
      createdAt: Date.now(),
    };
    await touchRequest(request.id);
  }

  await insertMessage(message);
  await pushEvent("host_replied", {
    code: request.code,
    hostName: listing.hostName,
    action: message.action,
    original: message.original,
    originalLang: message.lang,
    translated: message.translations[request.guestLang],
    guestLang: request.guestLang,
  });

  const status = b.action && b.action !== "car" ? b.action : request.status;
  return json({ message, status });
}
