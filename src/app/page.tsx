import Image from "next/image";
import { CatalogTeaser, type VillageTeaser } from "@/components/landing/CatalogTeaser";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LangSwitcher } from "@/components/LangSwitcher";
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

export default async function Home() {
  const lang = await getLang("ru");
  const t = LANDING[lang];
  const villages = await safeVillages();

  return (
    <div className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pb-10 pt-4 sm:px-6">
      <header className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Image src="/icon.svg" alt="" width={40} height={40} priority unoptimized />
          <span className="text-2xl font-extrabold tracking-tight text-teal-dark">Qonaq</span>
        </div>
        <LangSwitcher current={lang} />
      </header>

      <main>
        <Hero lang={lang} t={t} />
        <HowItWorks t={t} />
        <CatalogTeaser villages={villages} lang={lang} t={t} />
      </main>

      <footer className="mt-14 border-t border-line pt-5">
        <ul className="m-0 flex list-none flex-wrap justify-center gap-x-2 gap-y-1 p-0 text-sm font-bold text-teal-dark">
          {t.footer.map((item, i) => (
            <li key={item} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden className="text-saffron">·</span> : null}
              {item}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
