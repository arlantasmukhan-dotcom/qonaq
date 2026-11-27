import type { LandingCopy } from "@/i18n/landing";
import { TranslationDemo } from "./TranslationDemo";

/** The product in one sentence, framed by a felt-pattern band on the left. */
export function DemoSection({ t }: { t: LandingCopy }) {
  return (
    <section aria-labelledby="demo-title" className="relative overflow-hidden">
      <span aria-hidden className="orn orn-sun-man absolute -right-6 top-6 hidden h-[22rem] text-stone/25 lg:block" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="relative pl-9 sm:pl-12">
          <span aria-hidden className="orn orn-strip-vine absolute inset-y-0 left-0 w-5 text-clay/70 sm:w-6" />
          <h2 id="demo-title" className="text-4xl leading-[1.05] sm:text-5xl">
            {t.demoLabel}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">{t.demoText}</p>
        </div>
        <TranslationDemo label={t.demoLabel} mic={t.demoMic} />
      </div>
    </section>
  );
}
