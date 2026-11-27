import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import * as schema from "./schema";
import { SEED_LISTINGS, SEED_VILLAGE, seedPhotoSvg } from "./seed";

type Db = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { qonaqDb?: { db: Db; client: Client; ready: Promise<void> } };

function init() {
  const url = process.env.DATABASE_URL ?? "file:./data/qonaq.db";
  // Serverless hosts have a read-only, per-request disk: a file database would lose every write.
  // Serverless hosts keep no disk between instances. Only an explicit /tmp file is allowed there, as a
  // demo-only database that resets on every cold start (the demo houses are re-seeded); use Turso for real.
  if (process.env.VERCEL && url.startsWith("file:") && !url.startsWith("file:/tmp/")) {
    throw new Error("DATABASE_URL must point to Turso (libsql://…) on Vercel; a local file database cannot persist there.");
  }
  if (url.startsWith("file:./")) mkdirSync("./data", { recursive: true });
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  const db = drizzle(client, { schema });
  const ready = (async () => {
    for (const sql of schema.CREATE_SQL) await client.execute(sql);
    for (const sql of schema.ALTER_SQL) await client.execute(sql).catch(() => undefined);
    if (process.env.QONAQ_SEED !== "0") await seedIfEmpty(db);
  })();
  return { db, client, ready };
}

async function seedIfEmpty(db: Db) {
  const existing = await db.select({ id: schema.listings.id }).from(schema.listings).limit(1);
  if (existing.length) return;
  const now = Date.now();
  for (const [i, l] of SEED_LISTINGS.entries()) {
    const photoIds = [0, 1, 2].map((v) => `${l.id.slice(0, -2)}${String(10 + v).padStart(2, "0")}`);
    for (const [v, pid] of photoIds.entries()) {
      await db.insert(schema.photos).values({
        id: pid,
        listingId: l.id,
        mime: "image/svg+xml",
        data: Buffer.from(seedPhotoSvg(l, v)).toString("base64"),
        createdAt: now,
      });
    }
    await db.insert(schema.listings).values({
      id: l.id,
      slug: l.slug,
      village: SEED_VILLAGE.slug,
      villageName: SEED_VILLAGE.name,
      hostName: l.hostName,
      hostNames: l.hostNames,
      whatsapp: l.whatsapp,
      sourceLang: "kk",
      status: "published",
      rooms: l.rooms,
      priceKzt: l.priceKzt,
      priceGuests: l.priceGuests,
      breakfastIncluded: l.breakfastIncluded,
      checkIn: l.checkIn,
      extras: l.extras,
      lat: l.lat,
      lng: l.lng,
      content: l.content,
      photoIds,
      editToken: randomBytes(18).toString("base64url"),
      isDemo: true,
      createdAt: now - i * 60_000,
    });
  }
}

/** Returns the database once its tables exist. Safe to call from any server code. */
export async function getDb(): Promise<Db> {
  if (!globalForDb.qonaqDb) globalForDb.qonaqDb = init();
  const current = globalForDb.qonaqDb;
  try {
    await current.ready;
  } catch (err) {
    // A failed start (e.g. Turso briefly unreachable) must not stick: the next request tries again.
    if (globalForDb.qonaqDb === current) globalForDb.qonaqDb = undefined;
    current.client.close();
    throw err;
  }
  return current.db;
}

export { schema };
