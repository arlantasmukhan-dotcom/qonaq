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
  searchParams: Promise<{ k?: string | string[] }>;
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

  // Guests read in their own language unless they picked another one; hosts get Russian or Kazakh.
  const cookieLang = (await cookies()).get(LANG_COOKIE)?.value;
  const chosen: Lang | null = isLang(cookieLang) ? cookieLang : null;
  const lang: Lang = isHost ? (chosen === "kk" ? "kk" : "ru") : (chosen ?? request.guestLang);

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
