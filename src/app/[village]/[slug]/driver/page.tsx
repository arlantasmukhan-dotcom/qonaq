import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LangSwitcher } from "@/components/LangSwitcher";
import { getLang } from "@/i18n/server";
import { formatPhone, TOURIST } from "@/i18n/tourist";
import { hostNameIn } from "@/lib/names";
import { getListingBySlug, publicListing } from "@/lib/repo";

type Props = { params: Promise<{ village: string; slug: string }> };

export const metadata: Metadata = { title: "Driver · Жүргізушіге · Водителю" };

export default async function DriverPage({ params }: Props) {
  const { village, slug } = await params;
  const row = await getListingBySlug(village, slug);
  if (!row || row.status !== "published") notFound();
  const listing = publicListing(row);
  const lang = await getLang();
  const t = TOURIST[lang];
  const hostKk = hostNameIn(listing, "kk");
  const hostRu = hostNameIn(listing, "ru");
  const phone = formatPhone(listing.whatsapp);
  const rules = listing.content[lang].rules;
  const hasMap = listing.lat !== null && listing.lng !== null;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[34rem] bg-white px-4 pb-10 pt-3 text-black">
      <div className="flex items-center justify-between gap-3 py-1">
        <Link href={`/${village}/${slug}`} className="inline-flex min-h-12 items-center pr-3 text-sm font-bold text-teal">
          ‹ {t.back}
        </Link>
        <LangSwitcher current={lang} />
      </div>

      <p className="mt-2 rounded-2xl bg-saffron-soft px-4 py-3 text-sm font-semibold leading-snug">{t.driverExplain}</p>

      <section className="mt-5 space-y-5" lang="kk">
        <p className="text-[2.1rem] font-extrabold leading-tight tracking-tight">
          {listing.villageName.kk} ауылы, {hostKk} үйі.
        </p>
        <p className="text-2xl font-bold leading-tight" lang="ru">
          Село {listing.villageName.ru}, гостевой дом {hostRu}.
        </p>
        <p className="text-3xl font-extrabold leading-tight text-teal-dark" lang="ru">
          Тел.: <a href={`tel:+${listing.whatsapp}`}>{phone}</a>
        </p>
        <div className="rounded-2xl border-2 border-black p-4">
          <p className="text-2xl font-extrabold leading-tight" lang="ru">
            Пожалуйста, отвезите меня сюда.
          </p>
          <p className="mt-2 text-xl font-bold leading-tight text-black/80" lang="kk">
            Мені осы жерге апарыңызшы.
          </p>
        </div>
      </section>

      <div className="mt-6 space-y-3">
        <a href={`tel:+${listing.whatsapp}`} className="btn btn-primary btn-xl w-full">
          📞 {t.callHost} · {phone}
        </a>
        {hasMap && (
          <>
            <a
              href={`https://2gis.kz/geo/${listing.lng},${listing.lat}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent btn-xl w-full"
            >
              📍 {t.open2gis}
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost w-full !text-black"
            >
              🗺 {t.openGoogle}
            </a>
          </>
        )}
      </div>

      {rules && (
        <section className="mt-8 border-t-2 border-line pt-4">
          <h2 className="text-base font-extrabold">{t.driverRules}</h2>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-black/75">{rules}</p>
        </section>
      )}
    </main>
  );
}
