import type { LandingCopy } from "@/i18n/landing";

const ICONS = [
  // microphone
  <svg key="mic" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>,
  // qr
  <svg key="qr" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v1M14 20h3M20 18v3" />
  </svg>,
  // chat with check
  <svg key="chat" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z" />
    <path d="m8.5 12 2.5 2.5L15.5 10" />
  </svg>,
];

export function HowItWorks({ t }: { t: LandingCopy }) {
  return (
    <section aria-labelledby="how-title" className="mt-14">
      <h2 id="how-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {t.howTitle}
      </h2>
      <ol className="mt-5 grid list-none gap-3 p-0 md:grid-cols-3">
        {t.steps.map((step, i) => (
          <li key={step.title} className="card flex gap-4 p-4 md:flex-col md:p-5">
            <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-soft text-teal">
              {ICONS[i]}
              <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-saffron text-xs font-extrabold text-ink">{i + 1}</span>
            </span>
            <div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
