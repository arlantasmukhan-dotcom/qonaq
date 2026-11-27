import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/host/PrintButton";
import { hostDict } from "@/i18n/host";
import { getHostLang } from "@/i18n/server";
import { formatKzt } from "@/lib/currency";
import { getListingById } from "@/lib/repo";
import { LANGS } from "@/lib/types";

export const metadata: Metadata = { title: "Плакат" };
export const dynamic = "force-dynamic";

const PER_NIGHT = { kk: "бір түнге", ru: "за ночь", en: "per night", zh: "每晚" } as const;

export default async function PosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const listing = await getListingById(id);
  if (!listing) notFound();
  const t = hostDict[await getHostLang()];

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = (process.env.PUBLIC_BASE_URL ?? `${proto}://${host}`).replace(/\/$/, "");
  const url = `${origin}/${listing.village}/${listing.slug}`;
  const cover = listing.photoIds[0];
  const village = listing.villageName.ru || listing.village;

  return (
    <div className="poster-root">
      <style>{`
        @page { size: A4; margin: 0 }
        .poster-root { background: #e7e1d7; min-height: 100vh; padding: 12px 0 40px }
        .poster-sheet { width: 210mm; max-width: 100%; min-height: 297mm; margin: 0 auto; background: #f2eee7; display: flex; flex-direction: column; box-shadow: 0 8px 40px rgb(0 0 0 / .15); overflow: hidden }
        .poster-photo { height: 100mm; width: 100%; object-fit: cover; display: block }
        .poster-photo-empty { height: 100mm; background: linear-gradient(135deg, #56695f, #a0603f) }
        @media (max-width: 800px) { .poster-sheet { font-size: 0.8em } .poster-photo, .poster-photo-empty { height: 55vw } }
        @media print {
          .poster-root { background: #fff; padding: 0; min-height: 0 }
          .poster-sheet { box-shadow: none; width: 210mm; height: 297mm; min-height: 0; max-width: none; font-size: 1em }
          .poster-photo, .poster-photo-empty { height: 100mm }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact }
        }
      `}</style>

      <div className="no-print mx-auto flex max-w-xl items-center justify-between gap-3 px-4 pb-3">
        <Link href={`/host/${listing.id}`} className="btn btn-ghost bg-paper">
          ← {t.back}
        </Link>
        <PrintButton label={t.print} />
      </div>

      <article className="poster-sheet">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photo/${cover}`} alt="" className="poster-photo" />
        ) : (
          <div className="poster-photo-empty" />
        )}

        <div className="flex flex-1 flex-col px-[12mm] pb-[10mm] pt-[8mm]">
          <div className="flex items-center gap-2 text-patina">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={36} height={36} />
            <span className="text-2xl font-extrabold">Qonaq</span>
            <span className="ml-auto text-lg font-bold text-muted">{village}</span>
          </div>

          <div className="mt-4 space-y-1.5">
            {LANGS.map((l) => {
              const title = listing.content[l].title;
              if (!title) return null;
              return (
                <h1
                  key={l}
                  lang={l === "zh" ? "zh-CN" : l}
                  className={l === "ru" ? "text-[1.9em] font-extrabold leading-tight text-ink" : "text-[1.15em] font-bold leading-tight text-ink/75"}
                >
                  {title}
                </h1>
              );
            })}
          </div>

          <div className="mt-auto flex items-end justify-between gap-6 pt-6">
            <div>
              {listing.priceKzt !== null && (
                <>
                  <p className="text-[2.4em] font-extrabold leading-none text-patina">{formatKzt(listing.priceKzt)}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">
                    {LANGS.map((l) => PER_NIGHT[l]).join(" · ")}
                    {listing.priceGuests ? ` · ${listing.priceGuests} ` : ""}
                    {listing.priceGuests ? "👤" : ""}
                  </p>
                </>
              )}
              <p className="mt-5 max-w-[85mm] rounded-2xl bg-clay px-4 py-3 text-lg font-extrabold leading-snug text-paper">
                {t.posterScan}
              </p>
            </div>
            <div className="shrink-0 rounded-3xl border-2 border-line bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr?text=${encodeURIComponent(url)}`} alt="QR" style={{ width: "62mm", height: "62mm" }} />
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-muted">{url.replace(/^https?:\/\//, "")}</p>
        </div>
      </article>
    </div>
  );
}
