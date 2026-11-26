import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { RequestView } from "@/components/request/RequestView";
import { safeEqual } from "@/lib/http";
import { isLang, LANG_COOKIE } from "@/lib/lang";
import { getListingById, getRequestByCode, listMessages, publicListing, publicRequest } from "@/lib/repo";
import type { Lang } from "@/lib/types";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ k?: string | string[]; lang?: string | string[] }>;
};

export const metadata: Metadata = { title: "Qonaq", robots: { index: false } };

export default async function RequestPage({ params, searchParams }: Props) {
  const { code } = await params;
  const sp = await searchParams;
  const request = await getRequestByCode(code.toUpperCase());
  if (!request) notFound();
  const listing = await getListingById(request.listingId);
  if (!listing) notFound();

  const k = Array.isArray(sp.k) ? sp.k[0] : sp.k;
  const isHost = safeEqual(k, request.hostKey);

  // Guests read in the request's language unless they picked another one on this page (?lang=);
  // hosts get Russian or Kazakh from their own cookie.
  const cookieLang = (await cookies()).get(LANG_COOKIE)?.value;
  const queryLang = Array.isArray(sp.lang) ? sp.lang[0] : sp.lang;
  const lang: Lang = isHost
    ? cookieLang === "kk"
      ? "kk"
      : "ru"
    : isLang(queryLang)
      ? queryLang
      : request.guestLang;

  const messages = await listMessages(request.id);
  return (
    <RequestView
      code={request.code}
      hostKey={isHost && k ? k : null}
      lang={lang}
      initial={{ request: publicRequest(request), listing: publicListing(listing), messages }}
    />
  );
}
