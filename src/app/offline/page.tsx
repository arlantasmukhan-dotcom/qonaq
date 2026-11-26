import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline" };

const ROWS = [
  { lang: "ru", title: "Нет интернета", text: "Эта страница ещё не сохранена на телефоне. Откройте её один раз с интернетом — потом она будет открываться и без него.", back: "На главную" },
  { lang: "kk", title: "Интернет жоқ", text: "Бұл бет телефоныңызда әлі сақталмаған. Интернет бар кезде оны бір рет ашыңыз — кейін интернетсіз де ашылады.", back: "Басты бетке" },
  { lang: "en", title: "You're offline", text: "This page isn't saved on your phone yet. Open it once while online, and after that it will work without a connection.", back: "Home" },
  { lang: "zh-CN", title: "网络未连接", text: "此页面尚未保存到您的手机。请在联网时打开一次，之后即可离线查看。", back: "返回首页" },
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
        Басты бет · Главная · Home · 首页
      </Link>
    </main>
  );
}
