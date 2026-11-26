import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HouseCard } from "@/components/tourist/HouseCard";
import { TouristHeader } from "@/components/tourist/TouristHeader";
import { getLang } from "@/i18n/server";
import { TOURIST, VILLAGE_INTRO } from "@/i18n/tourist";
import { listVillage, publicListing } from "@/lib/repo";

type Props = { params: Promise<{ village: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { village } = await params;
  const listings = await listVillage(village);
  const lang = await getLang();
  return { title: listings[0]?.villageName[lang] ?? "Qonaq" };
}

export default async function VillagePage({ params }: Props) {
  const { village } = await params;
  const rows = await listVillage(village);
  if (rows.length === 0) notFound();
  const lang = await getLang();
  const t = TOURIST[lang];
  const listings = rows.map(publicListing);
  const name = listings[0].villageName[lang];
  const intro = VILLAGE_INTRO[village]?.[lang];

  return (
    <main className="page">
      <TouristHeader lang={lang} />
      <section className="animate-rise relative mt-1 overflow-hidden rounded-[var(--radius-card)] bg-teal px-5 pb-6 pt-8 text-white">
        <div aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-saffron/25" />
        <h1 className="relative text-4xl font-extrabold tracking-tight">{name}</h1>
        {intro && <p className="relative mt-2 text-lg font-semibold text-saffron-soft">{intro}</p>}
        <p className="relative mt-1 text-sm text-white/80">{t.housesCount(listings.length)}</p>
      </section>

      <div className="mt-4 space-y-4">
        {listings.map((l, i) => (
          <HouseCard key={l.id} listing={l} lang={lang} index={i} />
        ))}
      </div>
    </main>
  );
}
