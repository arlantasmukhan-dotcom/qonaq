import type { Metadata } from "next";
import Link from "next/link";
import { hostAccess } from "@/components/host/access";
import { NoAccess } from "@/components/host/NoAccess";
import { ReviewCard } from "@/components/host/ReviewCard";
import { LangSwitcher } from "@/components/LangSwitcher";
import { hostDict } from "@/i18n/host";
import { getHostLang } from "@/i18n/server";
import { publicListing } from "@/lib/repo";

export const metadata: Metadata = { title: "Проверьте карточку" };
export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t: qt } = await searchParams;
  const lang = await getHostLang();
  const t = hostDict[lang];
  const access = await hostAccess(id, qt);
  if (!access) return <NoAccess t={t} />;

  return (
    <main className="page">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold text-patina">
          Qonaq
        </Link>
        <LangSwitcher current={lang} langs={["kk", "ru"]} />
      </header>
      <h1 className="text-3xl font-extrabold leading-tight">{t.reviewTitle}</h1>
      <p className="mb-5 mt-1 text-muted">{t.reviewSub}</p>
      <ReviewCard t={t} initial={publicListing(access.listing)} hostLang={lang} token={access.token} />
    </main>
  );
}
