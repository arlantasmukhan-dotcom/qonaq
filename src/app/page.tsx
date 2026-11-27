import { CatalogTeaser, type VillageTeaser } from "@/components/landing/CatalogTeaser";
import { DemoSection } from "@/components/landing/DemoSection";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Places } from "@/components/landing/Places";
import { Wordmark } from "@/components/landing/Wordmark";
import { LANDING } from "@/i18n/landing";
import { getLang } from "@/i18n/server";
import { listVillages } from "@/lib/repo";

async function safeVillages(): Promise<VillageTeaser[]> {
  try {
    return await listVillages();
  } catch {
    return []; // the landing must render even if the database is unavailable
  }
}

/** Rock-art frieze for the footer, in the order a Tamgaly panel might read. */
const FRIEZE = ["orn-sun", "orn-rider-flag", "orn-deer", "orn-rider-spear", "orn-ibex", "orn-elk", "orn-rider-sun"];

export default async function Home() {
  const lang = await getLang("ru");
  const t = LANDING[lang];
  const villages = await safeVillages();

  return (
    <div className="w-full overflow-x-clip">
      <Hero lang={lang} t={t} />

      <main>
        <DemoSection t={t} />
        <Places t={t} />
        <HowItWorks t={t} />
        <CatalogTeaser villages={villages} lang={lang} t={t} />
      </main>

      <footer className="bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6">
          <div aria-hidden className="flex items-end justify-between gap-4 text-dune/70">
            {FRIEZE.map((cls, i) => (
              <span key={cls} className={`orn ${cls} h-9 sm:h-12 ${i > 4 ? "hidden sm:block" : ""}`} />
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-6 border-t border-paper/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Wordmark tone="light" />
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm text-paper/75">
              {t.footer.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
