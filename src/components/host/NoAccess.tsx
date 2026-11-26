import Link from "next/link";
import type { HostDict } from "@/i18n/host";

export function NoAccess({ t }: { t: HostDict }) {
  return (
    <main className="page">
      <div className="card mt-10 p-6 text-center">
        <div className="mb-3 text-4xl" aria-hidden>
          🔒
        </div>
        <h1 className="text-2xl font-extrabold">{t.noAccess}</h1>
        <p className="mt-2 text-muted">{t.noAccessText}</p>
        <Link href="/new" className="btn btn-primary mt-5">
          {t.createNew}
        </Link>
      </div>
    </main>
  );
}
