import type { Metadata } from "next";
import Link from "next/link";
import { NewForm } from "@/components/host/NewForm";
import { LangSwitcher } from "@/components/LangSwitcher";
import { hostDict } from "@/i18n/host";
import { getHostLang } from "@/i18n/server";

export const metadata: Metadata = { title: "Создать страницу" };
export const dynamic = "force-dynamic";

export default async function NewPage() {
  const lang = await getHostLang();
  const t = hostDict[lang];
  return (
    <main className="page">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold text-teal">
          Qonaq
        </Link>
        <LangSwitcher current={lang} langs={["kk", "ru"]} />
      </header>
      <h1 className="text-3xl font-extrabold leading-tight">{t.newTitle}</h1>
      <p className="mb-5 mt-1 text-muted">{t.newSub}</p>
      <NewForm t={t} initialLang={lang} />
    </main>
  );
}
