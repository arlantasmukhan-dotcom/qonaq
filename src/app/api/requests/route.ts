import type { NextRequest } from "next/server";
import { z } from "zod";
import { translateMessage } from "@/lib/ai";
import { hostKey, newId, requestCode } from "@/lib/codes";
import { aiFail, baseUrl, clientIp, fail, json, readJson } from "@/lib/http";
import { countRecentRequestsFromIp, getListingById, insertMessage, insertRequest, pushEvent } from "@/lib/repo";
import { nightsBetween, waLink, whatsappMessage } from "@/lib/templates";
import { LANGS, type Lang } from "@/lib/types";

const Body = z.object({
  listingId: z.string().uuid(),
  guestName: z.string().trim().min(1).max(60),
  guestLang: z.enum(LANGS),
  guests: z.number().int().min(1).max(30),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  wantsCar: z.boolean().default(false),
  question: z.string().trim().max(1000).default(""),
});

/**
 * Guest sends a booking request.
 * Response: { code, requestUrl, waUrl, message } — the client opens waUrl (WhatsApp to the host,
 * pre-filled in Russian) and keeps requestUrl to watch for the host's answer.
 */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return fail("bad_request", parsed.error.issues[0]?.message ?? "Invalid body", 400);
  const b = parsed.data;

  // Judges on one venue Wi-Fi share an IP, so the limit is generous; it only stops scripts.
  const ip = clientIp(req);
  const perMinute = Number(process.env.QONAQ_REQUESTS_PER_MINUTE ?? 30);
  if (ip && perMinute > 0 && (await countRecentRequestsFromIp(ip, Date.now() - 60_000)) >= perMinute) {
    return fail("rate_limited", "Too many requests, try again in a minute", 429);
  }

  const listing = await getListingById(b.listingId);
  if (!listing || listing.status !== "published") return fail("not_found", "Listing not found", 404);

  const nights = nightsBetween(b.dateFrom, b.dateTo);
  if (!Number.isInteger(nights) || nights < 1 || nights > 60) return fail("bad_request", "Check the dates", 400);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (b.dateFrom < yesterday) return fail("bad_request", "Dates are in the past", 400);

  const rooms = listing.priceGuests ? Math.ceil(b.guests / listing.priceGuests) : 1;
  const totalKzt = listing.priceKzt ? listing.priceKzt * nights * rooms : null;

  // "Car to the lake" with no question uses the ready-made text in all four languages: no AI needed.
  let questionText = b.question;
  let translations: Record<Lang, string> | null = null;
  let questionLang: Lang = b.guestLang;
  if (b.wantsCar && !questionText) {
    questionText = CAR_QUESTION[b.guestLang];
    translations = CAR_QUESTION;
  } else if (questionText) {
    try {
      const t = await translateMessage(questionText, "A tourist asks a guesthouse host before booking.");
      translations = t.translations;
      if (t.detectedLang !== "other") questionLang = t.detectedLang;
    } catch (err) {
      return aiFail(err);
    }
  }

  const now = Date.now();
  const request = {
    id: newId(),
    code: requestCode(),
    hostKey: hostKey(),
    listingId: listing.id,
    guestName: b.guestName,
    guestLang: b.guestLang,
    guests: b.guests,
    dateFrom: b.dateFrom,
    dateTo: b.dateTo,
    nights,
    totalKzt,
    wantsCar: b.wantsCar,
    status: "new" as const,
    ip,
    createdAt: now,
    updatedAt: now,
  };
  await insertRequest(request);

  if (questionText && translations) {
    await insertMessage({
      id: newId(),
      requestId: request.id,
      author: "guest",
      lang: questionLang,
      original: questionText,
      translations,
      action: null,
      createdAt: now,
    });
  }

  const origin = baseUrl(req);
  const hostReplyUrl = `${origin}/r/${request.code}?k=${request.hostKey}`;
  const message = whatsappMessage({
    hostName: listing.hostName,
    guestName: b.guestName,
    guestLang: b.guestLang,
    guests: b.guests,
    dateFrom: b.dateFrom,
    dateTo: b.dateTo,
    nights,
    totalKzt,
    questionRu: translations?.ru ?? null,
    replyUrl: hostReplyUrl,
  });

  // No request code in live events: the feed is public and the code opens the request page.
  await pushEvent("request_created", {
    guestName: b.guestName,
    guestLang: b.guestLang,
    listingTitle: listing.content,
    question: questionText || null,
    questionRu: translations?.ru ?? null,
    nights,
    guests: b.guests,
  });

  return json({
    code: request.code,
    requestUrl: `${origin}/r/${request.code}`,
    waUrl: waLink(listing.whatsapp, message),
    message,
  });
}

const CAR_QUESTION: Record<Lang, string> = {
  kk: "Қолсай көліне көлік ұйымдастыра аласыз ба?",
  ru: "Можете организовать машину до озера Кольсай?",
  en: "Can you arrange a car to Kolsai Lakes?",
  zh: "可以帮我们安排去科尔赛湖的车吗？",
};
