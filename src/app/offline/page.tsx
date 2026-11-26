import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline" };

const ROWS = [
  { lang: "ru", title: "Нет сети", text: "Эта страница ещё не сохранена на телефоне. Откройте её один раз с интернетом — потом она будет работать без сети.", back: "На главную" },
  { lang: "kk", title: "Желі жоқ", text: "Бұл бет әлі телефонда сақталмаған. Интернет бар кезде бір рет ашыңыз — кейін желісіз жұмыс істейді.", back: "Басты бет" },
  { lang: "en", title: "You are offline", text: "This page is not saved on your phone yet. Open it once with internet and it will work without a connection.", back: "Home" },
  { lang: "zh-CN", title: "当前离线", text: "此页面尚未保存到您的手机。联网时打开一次，之后即可离线查看。", back: "返回首页" },
] as const;

export default function OfflinePage() {
  return (
    <main className="page">
      <div className="mt-6 flex items-center gap-2.5">
        <Image src="/icon.svg" alt="" width={40} height={40} unoptimized />
        <span className="text-2xl font-extrabold tracking-tight text-teal-dark">Qonaq</span>
      </div>
      <ul className="mt-6 grid list-none gap-3 p-0">
        {ROWS.map((r) => (
          <li key={r.lang} lang={r.lang} className="card p-4">
            <h2 className="text-lg font-extrabold">{r.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{r.text}</p>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn btn-primary btn-xl mt-6 w-full">
        Главная · Home · 首页
      </Link>
    </main>
  );
}
