import type { LandingCopy } from "@/i18n/landing";

/** Three steps in order, with a rock-carved rider faintly in the corner. */
export function HowItWorks({ t }: { t: LandingCopy }) {
  return (
    <section aria-labelledby="how-title" className="relative overflow-hidden">
      <span aria-hidden className="orn orn-rider-flag absolute right-4 top-8 h-24 text-stone/50 sm:right-10 sm:top-12 sm:h-36" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 id="how-title" className="text-4xl leading-[1.05] sm:text-5xl">
          {t.howTitle}
        </h2>
        <ol className="mt-10 grid list-none gap-8 p-0 md:grid-cols-3 md:gap-10">
          {t.steps.map((step, i) => (
            <li key={step.title} className="border-t border-stone pt-5">
              <span aria-hidden className="block font-serif text-5xl font-medium leading-none text-clay">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
