import type { NextRequest } from "next/server";
import { z } from "zod";
import { draftListing } from "@/lib/ai";
import { editToken, newId, slugify } from "@/lib/codes";
import { aiFail, fail, json, readJson, setEditCookie } from "@/lib/http";
import { attachPhotos, insertListing, slugTaken } from "@/lib/repo";
import { EXTRA_KINDS, type Extra, type ListingWithSecret } from "@/lib/types";

const Body = z.object({
  text: z.string().trim().min(10).max(4000),
  lang: z.enum(["kk", "ru"]),
  whatsapp: z.string().min(5).max(30),
  village: z.string().trim().max(60).optional(),
  photoIds: z.array(z.string().uuid()).max(6).default([]),
});

/**
 * Host's spoken/typed description → draft listing (status "draft").
 * Response: { id, editToken, listing } and an httpOnly edit cookie for this listing.
 */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) return fail("bad_request", parsed.error.issues[0]?.message ?? "Invalid body", 400);
  const body = parsed.data;

  const whatsapp = body.whatsapp.replace(/\D/g, "").replace(/^8(?=7\d{9}$)/, "7");
  if (whatsapp.length < 10 || whatsapp.length > 15) return fail("bad_request", "Invalid WhatsApp number", 400);

  let draft;
  try {
    draft = await draftListing({ text: body.text, lang: body.lang, villageHint: body.village });
  } catch (err) {
    return aiFail(err);
  }

  const village = slugify(draft.villageSlug || body.village || "kazakhstan") || "kazakhstan";
  const hostName = draft.hostName?.trim() || (body.lang === "kk" ? "Қожайын" : "Хозяин");
  let slug = slugify(hostName) || "dom";
  for (let i = 2; await slugTaken(village, slug); i++) slug = `${slugify(hostName) || "dom"}-${i}`;

  const extras: Extra[] = draft.extras.map((e) => ({
    id: newId(),
    kind: (EXTRA_KINDS as readonly string[]).includes(e.kind) ? e.kind : "other",
    priceKzt: e.priceKzt,
    name: e.name,
  }));

  const villageTitle = body.village || village;
  const listing: ListingWithSecret = {
    id: newId(),
    slug,
    village,
    villageName: draft.villageName ?? { kk: villageTitle, ru: villageTitle, en: villageTitle, zh: villageTitle },
    hostName,
    whatsapp,
    sourceLang: body.lang,
    status: "draft",
    rooms: draft.rooms,
    priceKzt: draft.priceKzt,
    priceGuests: draft.priceGuests,
    breakfastIncluded: draft.breakfastIncluded,
    checkIn: draft.checkIn,
    extras,
    lat: null,
    lng: null,
    content: draft.content,
    photoIds: body.photoIds,
    editToken: editToken(),
    isDemo: false,
    createdAt: Date.now(),
  };

  await insertListing(listing);
  await attachPhotos(body.photoIds, listing.id);

  const res = json({ id: listing.id, editToken: listing.editToken, listing, missing: draft.missing });
  setEditCookie(res, listing.id, listing.editToken);
  return res;
}
