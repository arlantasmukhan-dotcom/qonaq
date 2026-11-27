import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/tourist/BookingForm";
import { PhotoCarousel } from "@/components/tourist/PhotoCarousel";
import { TouristHeader } from "@/components/tourist/TouristHeader";
import { priceParts } from "@/components/tourist/price";
import { getLang } from "@/i18n/server";
import { EXTRA_ICON, TOURIST } from "@/i18n/tourist";
import { hostNameIn } from "@/lib/names";
import { DEFAULT_CURRENCY, formatIn, formatKzt, RATES_AS_OF } from "@/lib/currency";
import { getListingBySlug, publicListing } from "@/lib/repo";

type Props = { params: Promise<{ village: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { village, slug } = await params;
  const row = await getListingBySlug(village, slug);
  if (!row) return {};
  const lang = await getLang();
  return { title: row.content[lang].title, description: row.content[lang].description };
}

/** Upcoming Friday (at least tomorrow) to Sunday, as YYYY-MM-DD. */
function nextWeekend(): { today: string; from: string; to: string } {
  const now = new Date();
  const base = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const add = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
  let fri = add(base, 1);
  while (fri.getUTCDay() !== 5) fri = add(fri, 1);
  return { today: iso(base), from: iso(fri), to: iso(add(fri, 2)) };
}

export default async function HousePage({ params }: Props) {
  const { village, slug } = await params;
  const row = await getListingBySlug(village, slug);
  if (!row || row.status !== "published") notFound();
  const listing = publicListing(row);
  const lang = await getLang();
  const t = TOURIST[lang];
  const c = listing.content[lang];
  const price = listing.priceKzt ? priceParts(listing.priceKzt, lang) : null;
  const cur = DEFAULT_CURRENCY[lang];
  const dates = nextWeekend();
  const host = hostNameIn(listing, lang);

  return (
    <main className="page">
      <TouristHeader lang={lang} backHref={`/${village}`} backLabel={listing.villageName[lang]} />

      <div className="animate-rise space-y-4">
        <PhotoCarousel photoIds={listing.photoIds} alt={c.title} />

        <div className="flex flex-wrap items-center gap-2">
          <span id="offline-badge" data-offline-badge hidden className="chip bg-ok-soft text-ok">
            ✓ {t.offlineBadge}
          </span>
          {listing.isDemo && <span className="chip bg-clay-soft text-ink">{t.example}</span>}
        </div>

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{c.title}</h1>

        {price && listing.priceKzt && (
          <section className="card p-4" aria-label={t.priceTitle}>
            <p className="text-sm font-bold text-muted">{t.priceTitle}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
              <span className="text-4xl font-extrabold text-patina">{price.big}</span>
              <span className="text-base font-semibold text-muted">{t.perNight}</span>
            </p>
            {price.small && <p className="text-sm text-muted">{price.small}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.rooms ? <span className="chip">🛏 {t.rooms(listing.rooms)}</span> : null}
              {listing.priceGuests ? <span className="chip">👥 {t.forGuests(listing.priceGuests)}</span> : null}
              {listing.breakfastIncluded ? <span className="chip">🍳 {t.breakfast}</span> : null}
            </div>
            {cur !== "KZT" && <p className="mt-3 text-xs text-muted">{t.rateAsOf(RATES_AS_OF)}</p>}
          </section>
        )}

        <section className="card divide-y divide-line">
          {listing.checkIn && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-bold text-muted">{t.checkIn}</span>
              <span className="font-extrabold">{listing.checkIn}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-bold text-muted">{t.host}</span>
            <span className="font-extrabold">{host}</span>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-lg font-extrabold">{t.about}</h2>
          <p className="whitespace-pre-line leading-relaxed">{c.description}</p>
        </section>

        {listing.extras.length > 0 && (
          <section>
            <h2 className="mb-2 text-lg font-extrabold">{t.extras}</h2>
            <ul className="card divide-y divide-line">
              {listing.extras.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="flex items-center gap-3 font-semibold">
                    <span aria-hidden className="text-xl">
                      {EXTRA_ICON[e.kind] ?? "✨"}
                    </span>
                    {e.name[lang]}
                  </span>
                  {e.priceKzt ? (
                    <span className="shrink-0 text-right">
                      <span className="block font-extrabold">{formatKzt(e.priceKzt)}</span>
                      {cur !== "KZT" && <span className="block text-xs text-muted">{formatIn(e.priceKzt, cur)}</span>}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {c.rules && (
          <section>
            <h2 className="mb-1 text-lg font-extrabold">{t.rules}</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted">{c.rules}</p>
          </section>
        )}

        <Link
          href={`/${village}/${slug}/driver`}
          className="card flex min-h-16 items-center gap-3 bg-clay-soft px-4 py-3 active:scale-[0.99]"
        >
          <span aria-hidden className="text-3xl">
            🚕
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold">{t.showDriver}</span>
            <span className="block text-xs text-muted">{t.showDriverSub}</span>
          </span>
          <span aria-hidden className="text-2xl text-patina">
            ›
          </span>
        </Link>

        <BookingForm listing={listing} lang={lang} today={dates.today} defaultFrom={dates.from} defaultTo={dates.to} />
      </div>
    </main>
  );
}
