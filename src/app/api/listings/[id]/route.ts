import type { NextRequest } from "next/server";
import { z } from "zod";
import { translateMessage } from "@/lib/ai";
import { newId } from "@/lib/codes";
import { aiFail, baseUrl, fail, hostToken, json, readJson, safeEqual, setEditCookie } from "@/lib/http";
import {
  getListingById,
  listMessages,
  listRequestsForListing,
  publicListing,
  publicRequest,
  pushEvent,
  updateListing,
} from "@/lib/repo";
import { EXTRA_KINDS, LANGS, type Lang, type ListingText, type Localized } from "@/lib/types";

// AI translation can take several seconds; give serverless hosts room before they cut the request.
export const maxDuration = 30;

type Ctx = { params: Promise<{ id: string }> };

/** Host view of a listing: full card + its requests. Needs the edit token. */
export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return fail("not_found", "Listing not found", 404);
  const token = hostToken(req, id);
  if (!safeEqual(token, listing.editToken)) return fail("forbidden", "Not the host of this listing", 403);

  const reqs = await listRequestsForListing(id);
  const requests = await Promise.all(
    reqs.map(async (r) => ({ ...publicRequest(r), hostKey: r.hostKey, messages: await listMessages(r.id) })),
  );
  const origin = baseUrl(req);
  const res = json({
    listing: publicListing(listing),
    publicUrl: `${origin}/${listing.village}/${listing.slug}`,
    requests,
  });
  // Opening the host link once (with ?t=) remembers the phone.
  if (req.nextUrl.searchParams.get("t")) setEditCookie(res, id, listing.editToken);
  return res;
}

const localized = z.object({ kk: z.string(), ru: z.string(), en: z.string(), zh: z.string() });
const text = z.object({ title: z.string().max(200), description: z.string().max(2000), rules: z.string().max(1000) });

const Patch = z.object({
  hostName: z.string().trim().min(1).max(80).optional(),
  whatsapp: z.string().min(5).max(30).optional(),
  rooms: z.number().int().min(0).max(200).nullable().optional(),
  priceKzt: z.number().int().min(0).max(10_000_000).nullable().optional(),
  priceGuests: z.number().int().min(1).max(50).nullable().optional(),
  breakfastIncluded: z.boolean().nullable().optional(),
  checkIn: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  extras: z
    .array(
      z.object({
        id: z.string().optional(),
        kind: z.enum(EXTRA_KINDS),
        priceKzt: z.number().int().min(0).nullable(),
        name: localized,
      }),
    )
    .max(12)
    .optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  photoIds: z.array(z.string().uuid()).max(6).optional(),
  content: z.object({ kk: text, ru: text, en: text, zh: text }).optional(),
  /** Host edited the text in this language: re-translate it into the other three. */
  retranslateFrom: z.enum(LANGS).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

/** Host edits fields of the card and/or publishes it. Needs the edit token. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return fail("not_found", "Listing not found", 404);
  if (!safeEqual(hostToken(req, id), listing.editToken)) return fail("forbidden", "Not the host of this listing", 403);

  const parsed = Patch.safeParse(await readJson(req));
  if (!parsed.success) return fail("bad_request", parsed.error.issues[0]?.message ?? "Invalid body", 400);
  const { retranslateFrom, extras, whatsapp, ...rest } = parsed.data;

  const patch: Parameters<typeof updateListing>[1] = { ...rest };
  if (extras) patch.extras = extras.map((e) => ({ ...e, id: e.id ?? newId() }));
  if (whatsapp) {
    const digits = whatsapp.replace(/\D/g, "").replace(/^8(?=7\d{9}$)/, "7");
    if (digits.length < 10 || digits.length > 15) return fail("bad_request", "Invalid WhatsApp number", 400);
    patch.whatsapp = digits;
  }

  if (retranslateFrom) {
    const source = (rest.content ?? listing.content)[retranslateFrom];
    try {
      patch.content = await retranslate(source, retranslateFrom, rest.content ?? listing.content);
    } catch (err) {
      return aiFail(err);
    }
  }

  const publishing = rest.status === "published" && listing.status !== "published";
  await updateListing(id, patch);
  const updated = (await getListingById(id))!;

  if (publishing) {
    await pushEvent("listing_created", {
      listingId: id,
      title: updated.content,
      village: updated.villageName,
      priceKzt: updated.priceKzt,
      photoId: updated.photoIds[0] ?? null,
      url: `/${updated.village}/${updated.slug}`,
    });
  }
  return json({ listing: publicListing(updated), publicUrl: `${baseUrl(req)}/${updated.village}/${updated.slug}` });
}

async function retranslate(
  source: ListingText,
  from: Lang,
  current: Localized<ListingText>,
): Promise<Localized<ListingText>> {
  const fields = ["title", "description", "rules"] as const;
  const results = await Promise.all(
    fields.map((f) => (source[f].trim() ? translateMessage(source[f], `Guesthouse listing ${f}`) : null)),
  );
  const out = structuredClone(current);
  for (const lang of LANGS) {
    fields.forEach((f, i) => {
      out[lang][f] = lang === from ? source[f] : (results[i]?.translations[lang] ?? "");
    });
  }
  return out;
}
