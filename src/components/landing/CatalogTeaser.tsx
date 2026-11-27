import Link from "next/link";
import type { LandingCopy } from "@/i18n/landing";
import type { Lang, ListingWithSecret } from "@/lib/types";

export interface VillageTeaser {
  village: string;
  count: number;
  listing: ListingWithSecret;
}

export function CatalogTeaser({ villages, lang, t }: { villages: VillageTeaser[]; lang: Lang; t: LandingCopy }) {
  if (villages.length === 0) return null;
  return (
    <section aria-labelledby="catalog-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <h2 id="catalog-title" className="text-4xl leading-[1.05] sm:text-5xl">
        {t.catalogTitle}
      </h2>
      <p className="mt-3 text-muted">{t.catalogSub}</p>
      <ul className="mt-8 grid list-none gap-3 p-0 sm:grid-cols-2">
        {villages.map(({ village, count, listing }) => {
          const photo = listing.photoIds[0];
          return (
            <li key={village}>
              <Link href={`/${village}`} className="card group flex items-stretch overflow-hidden transition-transform active:scale-[0.99]">
                <div className="relative h-28 w-28 shrink-0 bg-stone sm:h-32 sm:w-36">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/photo/${photo}`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
                  <p className="truncate font-serif text-2xl font-semibold">{listing.villageName[lang] || village}</p>
                  <p className="text-sm text-muted">{t.houses(count)}</p>
                  <p className="mt-1 text-sm font-semibold text-clay underline decoration-clay/40 underline-offset-4">{t.openCatalog}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
