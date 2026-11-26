export const LANGS = ["kk", "ru", "en", "zh"] as const;
export type Lang = (typeof LANGS)[number];

export type Localized<T = string> = Record<Lang, T>;

export const EXTRA_KINDS = ["sauna", "car", "meal", "horse", "guide", "other"] as const;
export type ExtraKind = (typeof EXTRA_KINDS)[number];

export interface Extra {
  id: string;
  kind: ExtraKind;
  priceKzt: number | null;
  name: Localized;
}

export interface ListingText {
  title: string;
  description: string;
  rules: string;
}

export interface Listing {
  id: string;
  slug: string;
  village: string; // url slug, e.g. "saty"
  villageName: Localized;
  hostName: string;
  whatsapp: string; // digits only, international, e.g. "77011234567"
  sourceLang: Lang;
  status: "draft" | "published";
  rooms: number | null;
  priceKzt: number | null;
  priceGuests: number | null;
  breakfastIncluded: boolean | null;
  checkIn: string | null; // "14:00"
  extras: Extra[];
  lat: number | null;
  lng: number | null;
  content: Localized<ListingText>;
  photoIds: string[];
  isDemo: boolean;
  createdAt: number;
}

/** Listing as stored, including the host's secret. Never send to the browser except to the host. */
export interface ListingWithSecret extends Listing {
  editToken: string;
}

export type RequestStatus = "new" | "available" | "busy";

export interface BookingRequest {
  id: string;
  code: string;
  listingId: string;
  guestName: string;
  guestLang: Lang;
  guests: number;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  nights: number;
  totalKzt: number | null;
  wantsCar: boolean;
  status: RequestStatus;
  createdAt: number;
  updatedAt: number;
}

export interface BookingRequestWithSecret extends BookingRequest {
  hostKey: string;
}

export type MessageAction = "available" | "busy" | "car" | null;

export interface Message {
  id: string;
  requestId: string;
  author: "guest" | "host";
  lang: Lang;
  original: string;
  translations: Localized;
  action: MessageAction;
  createdAt: number;
}

export type LiveEventType = "listing_created" | "request_created" | "host_replied";

export interface LiveEvent {
  id: number;
  type: LiveEventType;
  payload: Record<string, unknown>;
  createdAt: number;
}
