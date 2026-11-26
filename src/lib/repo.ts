import "server-only";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type {
  BookingRequest,
  BookingRequestWithSecret,
  LiveEvent,
  LiveEventType,
  Listing,
  ListingWithSecret,
  Message,
} from "./types";

type ListingRow = typeof schema.listings.$inferSelect;
type RequestRow = typeof schema.requests.$inferSelect;

function toListing(row: ListingRow): ListingWithSecret {
  return {
    ...row,
    breakfastIncluded: row.breakfastIncluded ?? null,
  };
}

/** Strips secrets before a listing leaves the server. */
export function publicListing(l: ListingWithSecret): Listing {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { editToken, ...rest } = l;
  return rest;
}

function toRequest(row: RequestRow): BookingRequestWithSecret {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ip, ...rest } = row;
  return rest;
}

export function publicRequest(r: BookingRequestWithSecret): BookingRequest {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hostKey, ...rest } = r;
  return rest;
}

// ---------- listings ----------

export async function insertListing(l: ListingWithSecret): Promise<void> {
  const db = await getDb();
  await db.insert(schema.listings).values(l);
}

export async function updateListing(id: string, patch: Partial<Omit<ListingWithSecret, "id">>): Promise<void> {
  const db = await getDb();
  await db.update(schema.listings).set(patch).where(eq(schema.listings.id, id));
}

export async function getListingById(id: string): Promise<ListingWithSecret | null> {
  const db = await getDb();
  const rows = await db.select().from(schema.listings).where(eq(schema.listings.id, id)).limit(1);
  return rows[0] ? toListing(rows[0]) : null;
}

export async function getListingBySlug(village: string, slug: string): Promise<ListingWithSecret | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.listings)
    .where(and(eq(schema.listings.village, village), eq(schema.listings.slug, slug)))
    .limit(1);
  return rows[0] ? toListing(rows[0]) : null;
}

export async function slugTaken(village: string, slug: string): Promise<boolean> {
  return (await getListingBySlug(village, slug)) !== null;
}

export async function listVillage(village: string): Promise<ListingWithSecret[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.listings)
    .where(and(eq(schema.listings.village, village), eq(schema.listings.status, "published")))
    .orderBy(desc(schema.listings.createdAt));
  return rows.map(toListing);
}

export async function listVillages(): Promise<{ village: string; count: number; listing: ListingWithSecret }[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.listings).where(eq(schema.listings.status, "published"));
  const by = new Map<string, { village: string; count: number; listing: ListingWithSecret }>();
  for (const r of rows) {
    const cur = by.get(r.village);
    if (cur) cur.count++;
    else by.set(r.village, { village: r.village, count: 1, listing: toListing(r) });
  }
  return [...by.values()].sort((a, b) => b.count - a.count);
}

// ---------- photos ----------

export async function insertPhoto(p: { id: string; mime: string; data: string; listingId?: string | null }) {
  const db = await getDb();
  await db.insert(schema.photos).values({ ...p, listingId: p.listingId ?? null, createdAt: Date.now() });
}

export async function getPhoto(id: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.photos).where(eq(schema.photos.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function attachPhotos(ids: string[], listingId: string) {
  if (!ids.length) return;
  const db = await getDb();
  await db.update(schema.photos).set({ listingId }).where(inArray(schema.photos.id, ids));
}

// ---------- requests ----------

export async function insertRequest(r: BookingRequestWithSecret & { ip: string | null }) {
  const db = await getDb();
  await db.insert(schema.requests).values(r);
}

export async function getRequestByCode(code: string): Promise<BookingRequestWithSecret | null> {
  const db = await getDb();
  const rows = await db.select().from(schema.requests).where(eq(schema.requests.code, code)).limit(1);
  return rows[0] ? toRequest(rows[0]) : null;
}

export async function setRequestStatus(id: string, status: BookingRequest["status"]) {
  const db = await getDb();
  await db.update(schema.requests).set({ status, updatedAt: Date.now() }).where(eq(schema.requests.id, id));
}

export async function touchRequest(id: string) {
  const db = await getDb();
  await db.update(schema.requests).set({ updatedAt: Date.now() }).where(eq(schema.requests.id, id));
}

export async function listRequestsForListing(listingId: string): Promise<BookingRequestWithSecret[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.requests)
    .where(eq(schema.requests.listingId, listingId))
    .orderBy(desc(schema.requests.createdAt));
  return rows.map(toRequest);
}

export async function countRecentRequestsFromIp(ip: string, sinceMs: number): Promise<number> {
  const db = await getDb();
  const rows = await db
    .select({ id: schema.requests.id })
    .from(schema.requests)
    .where(and(eq(schema.requests.ip, ip), gt(schema.requests.createdAt, sinceMs)));
  return rows.length;
}

// ---------- messages ----------

export async function insertMessage(m: Message) {
  const db = await getDb();
  await db.insert(schema.messages).values(m);
}

export async function listMessages(requestId: string): Promise<Message[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.requestId, requestId))
    .orderBy(schema.messages.createdAt);
  return rows.map((r) => ({ ...r, action: r.action ?? null }));
}

// ---------- live events ----------

export async function pushEvent(type: LiveEventType, payload: Record<string, unknown>) {
  const db = await getDb();
  await db.insert(schema.events).values({ type, payload, createdAt: Date.now() });
}

export async function eventsAfter(afterId: number, limit = 50): Promise<LiveEvent[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.events)
    .where(gt(schema.events.id, afterId))
    .orderBy(desc(schema.events.id))
    .limit(limit);
  return rows.reverse().map((r) => ({ ...r, type: r.type as LiveEventType }));
}
