import Link from "next/link";
import { EXTRA_ICON, TOURIST } from "@/i18n/tourist";
import type { Lang, Listing } from "@/lib/types";
import { priceParts } from "./price";

export function HouseCard({ listing, lang, index }: { listing: Listing; lang: Lang; index: number }) {
  const t = TOURIST[lang];
  const c = listing.content[lang];
  const price = listing.priceKzt ? priceParts(listing.priceKzt, lang) : null;
  const photo = listing.photoIds[0];
  const kinds = [...new Set(listing.extras.map((e) => e.kind))];

  return (
    <Link
      href={`/${listing.village}/${listing.slug}`}
      className="card animate-rise block overflow-hidden active:scale-[0.99]"
      style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
    >
      <div className="relative aspect-[16/10] w-full bg-patina-soft">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/photo/${photo}`}
            alt={c.title}
            width={800}
            height={500}
            loading={index === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">🏡</div>
        )}
        {listing.isDemo && (
          <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 text-xs font-bold text-muted shadow">
            {t.example}
          </span>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-extrabold leading-snug">{c.title}</h2>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {price && (
              <p>
                <span className="text-xl font-extrabold text-patina">{price.big}</span>{" "}
                <span className="text-sm text-muted">{t.perNight}</span>
                {price.small && <span className="block text-xs text-muted">{price.small}</span>}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted">
            {listing.rooms ? <span className="chip">{t.rooms(listing.rooms)}</span> : null}
            <span aria-hidden className="text-base tracking-wide">
              {kinds.map((k) => EXTRA_ICON[k] ?? "✨").join(" ")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
