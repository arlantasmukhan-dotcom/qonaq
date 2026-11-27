import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { hostAccess } from "@/components/host/access";
import { HostDashboard } from "@/components/host/HostDashboard";
import { NoAccess } from "@/components/host/NoAccess";
import { LangSwitcher } from "@/components/LangSwitcher";
import { hostDict } from "@/i18n/host";
import { getHostLang } from "@/i18n/server";
import { publicListing } from "@/lib/repo";

export const metadata: Metadata = { title: "Ваша страница готова", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function HostPage({
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

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = (process.env.PUBLIC_BASE_URL ?? `${proto}://${host}`).replace(/\/$/, "");

  return (
    <main className="page">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold text-patina">
          Qonaq
        </Link>
        <LangSwitcher current={lang} langs={["kk", "ru"]} />
      </header>
      <HostDashboard t={t} hostLang={lang} initial={publicListing(access.listing)} origin={origin} token={access.token} />
    </main>
  );
}
