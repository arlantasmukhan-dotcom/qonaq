import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import type { Extra, Lang, ListingText, Localized, MessageAction, RequestStatus } from "@/lib/types";

export const listings = sqliteTable(
  "listings",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    village: text("village").notNull(),
    villageName: text("village_name", { mode: "json" }).$type<Localized>().notNull(),
    hostName: text("host_name").notNull(),
    hostNames: text("host_names", { mode: "json" }).$type<Localized>(),
    whatsapp: text("whatsapp").notNull(),
    sourceLang: text("source_lang").$type<Lang>().notNull(),
    status: text("status").$type<"draft" | "published">().notNull(),
    rooms: integer("rooms"),
    priceKzt: integer("price_kzt"),
    priceGuests: integer("price_guests"),
    breakfastIncluded: integer("breakfast_included", { mode: "boolean" }),
    checkIn: text("check_in"),
    extras: text("extras", { mode: "json" }).$type<Extra[]>().notNull(),
    lat: real("lat"),
    lng: real("lng"),
    content: text("content", { mode: "json" }).$type<Localized<ListingText>>().notNull(),
    photoIds: text("photo_ids", { mode: "json" }).$type<string[]>().notNull(),
    editToken: text("edit_token").notNull(),
    isDemo: integer("is_demo", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [uniqueIndex("listings_village_slug").on(t.village, t.slug)],
);

export const requests = sqliteTable(
  "requests",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    hostKey: text("host_key").notNull(),
    listingId: text("listing_id").notNull(),
    guestName: text("guest_name").notNull(),
    guestLang: text("guest_lang").$type<Lang>().notNull(),
    guests: integer("guests").notNull(),
    dateFrom: text("date_from").notNull(),
    dateTo: text("date_to").notNull(),
    nights: integer("nights").notNull(),
    totalKzt: integer("total_kzt"),
    wantsCar: integer("wants_car", { mode: "boolean" }).notNull(),
    status: text("status").$type<RequestStatus>().notNull(),
    ip: text("ip"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [uniqueIndex("requests_code").on(t.code), index("requests_listing").on(t.listingId)],
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id").notNull(),
    author: text("author").$type<"guest" | "host">().notNull(),
    lang: text("lang").$type<Lang>().notNull(),
    original: text("original").notNull(),
    translations: text("translations", { mode: "json" }).$type<Localized>().notNull(),
    action: text("action").$type<MessageAction>(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("messages_request").on(t.requestId)],
);

export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  listingId: text("listing_id"),
  mime: text("mime").notNull(),
  data: text("data").notNull(), // base64
  createdAt: integer("created_at").notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: integer("created_at").notNull(),
});

/** Plain SQL so a fresh database (local file or Turso) is ready without a migration step. */
/** Columns added after the first release; each is applied once and ignored if present. */
export const ALTER_SQL = [`ALTER TABLE listings ADD COLUMN host_names TEXT`];

export const CREATE_SQL = [
  `CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY, slug TEXT NOT NULL, village TEXT NOT NULL, village_name TEXT NOT NULL,
    host_name TEXT NOT NULL, host_names TEXT, whatsapp TEXT NOT NULL, source_lang TEXT NOT NULL, status TEXT NOT NULL,
    rooms INTEGER, price_kzt INTEGER, price_guests INTEGER, breakfast_included INTEGER, check_in TEXT,
    extras TEXT NOT NULL, lat REAL, lng REAL, content TEXT NOT NULL, photo_ids TEXT NOT NULL,
    edit_token TEXT NOT NULL, is_demo INTEGER NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS listings_village_slug ON listings(village, slug)`,
  `CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY, code TEXT NOT NULL, host_key TEXT NOT NULL, listing_id TEXT NOT NULL,
    guest_name TEXT NOT NULL, guest_lang TEXT NOT NULL, guests INTEGER NOT NULL, date_from TEXT NOT NULL,
    date_to TEXT NOT NULL, nights INTEGER NOT NULL, total_kzt INTEGER, wants_car INTEGER NOT NULL,
    status TEXT NOT NULL, ip TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS requests_code ON requests(code)`,
  `CREATE INDEX IF NOT EXISTS requests_listing ON requests(listing_id)`,
  `CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, request_id TEXT NOT NULL, author TEXT NOT NULL, lang TEXT NOT NULL,
    original TEXT NOT NULL, translations TEXT NOT NULL, action TEXT, created_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS messages_request ON messages(request_id)`,
  `CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY, listing_id TEXT, mime TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, payload TEXT NOT NULL, created_at INTEGER NOT NULL)`,
];
