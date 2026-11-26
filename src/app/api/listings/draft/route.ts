import type { NextRequest } from "next/server";
import { z } from "zod";
import { draftListing } from "@/lib/ai";
import { editToken, newId, slugify } from "@/lib/codes";
import { aiFail, clientIp, fail, json, readJson, setEditCookie } from "@/lib/http";
import { allow } from "@/lib/ratelimit";
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
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!allow(`draft:${clientIp(req) ?? "?"}`, 10, 10 * 60_000)) {
    return fail("rate_limited", "Too many pages created, try again in a few minutes", 429);
  }
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

  // Slug from the Russian village name (deterministic: "Саты" → saty), not the model's own slug guess.
  const village =
    slugify(draft.villageName?.ru || body.village || draft.villageSlug || "") || slugify(body.village ?? "") || "kazakhstan";
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
    hostNames: draft.hostName ? draft.hostNames : null,
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

  // Two hosts with the same name at the same moment: take the next free slug.
  for (let i = 2; ; i++) {
    try {
      await insertListing(listing);
      break;
    } catch (err) {
      if (i > 20 || !String(err).includes("UNIQUE")) throw err;
      listing.slug = `${slugify(hostName) || "dom"}-${i}`;
    }
  }
  await attachPhotos(body.photoIds, listing.id);

  const res = json({ id: listing.id, editToken: listing.editToken, listing, missing: draft.missing });
  setEditCookie(res, listing.id, listing.editToken);
  return res;
}
