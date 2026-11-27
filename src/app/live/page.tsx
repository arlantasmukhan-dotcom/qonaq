import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { LiveScreen } from "@/components/live/LiveScreen";
import "@/components/live/live.css";
import { listVillages } from "@/lib/repo";

export const metadata: Metadata = { title: "Live", robots: { index: false } };
export const dynamic = "force-dynamic";

async function originOf(): Promise<string> {
  const env = process.env.PUBLIC_BASE_URL?.trim();
  if (env) return env.replace(/\/+$/, "");
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000").split(",")[0]!.trim();
  const proto = (h.get("x-forwarded-proto") ?? "").split(",")[0]!.trim();
  const isLocal = /^(localhost|127\.|\[::1\]|192\.168\.|10\.)/.test(host);
  return `${proto === "https" || proto === "http" ? proto : isLocal ? "http" : "https"}://${host}`;
}

function Qr({ url, className }: { url: string; className: string }) {
  return (
    <div className={`${className} shrink-0 rounded-[1.2rem] bg-white p-[3%] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/qr?text=${encodeURIComponent(url)}`} alt={url} className="h-full w-full" />
    </div>
  );
}

export default async function LivePage() {
  const origin = await originOf();
  // One village: straight to its catalog. Several (a host from Burabay joined): the home page lists them all.
  const villages = await listVillages().catch(() => []);
  const catalogUrl = villages.length === 1 ? `${origin}/${villages[0]!.village}` : `${origin}/#catalog-title`;
  const newUrl = `${origin}/new`;

  return (
    <main className={`lv-screen fixed inset-0 z-50 overflow-hidden text-white`}>
      <div className="grid h-full grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(1rem,3vw,4rem)] p-[clamp(1rem,2.4vw,3.5rem)]">
        <aside className="flex min-h-0 flex-col justify-between">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="" width={56} height={56} unoptimized className="h-[clamp(2.5rem,4vw,4.5rem)] w-[clamp(2.5rem,4vw,4.5rem)]" />
            <span className="text-[clamp(2rem,3.6vw,4.5rem)] font-extrabold tracking-tight">Qonaq</span>
          </div>

          <div>
            <p className="text-[clamp(1.8rem,3.6vw,4.5rem)] font-extrabold leading-[1.05]">
              Scan me <span className="text-dune">/</span> 扫码 <span className="text-dune">/</span> Сканируйте
            </p>
            <div className="mt-[clamp(0.6rem,1.4vw,1.6rem)] flex items-center gap-[clamp(1rem,2vw,2.5rem)]">
              <Qr url={catalogUrl} className="aspect-square w-[min(44vh,26vw)]" />
              <div className="min-w-0 text-[clamp(0.9rem,1.5vw,1.9rem)] font-bold leading-snug text-white/85">
                <p>Каталог домов</p>
                <p>Guesthouses</p>
                <p lang="zh-CN">民宿目录</p>
                <p className="mt-2 break-all text-[0.7em] font-semibold text-dune">{catalogUrl.replace(/^https?:\/\//, "")}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[clamp(0.8rem,1.6vw,2rem)] rounded-[1.4rem] border border-white/15 bg-white/[0.06] p-[clamp(0.6rem,1vw,1.2rem)]">
            <Qr url={newUrl} className="aspect-square w-[min(15vh,9vw)]" />
            <div className="min-w-0 text-[clamp(0.85rem,1.4vw,1.8rem)] font-bold leading-snug">
              <p className="text-dune">Создать страницу дома за 60 секунд</p>
              <p className="text-white/80">Create a house page · 创建房源</p>
              <p className="mt-1 break-all text-[0.7em] font-semibold text-white/55">{newUrl.replace(/^https?:\/\//, "")}</p>
            </div>
          </div>
        </aside>

        <LiveScreen />
      </div>
    </main>
  );
}
