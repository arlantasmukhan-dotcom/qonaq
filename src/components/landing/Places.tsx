import Image from "next/image";
import type { LandingCopy, PlaceId } from "@/i18n/landing";

const PLACES: { id: PlaceId; src: string; cls: string }[] = [
  { id: "kolsai", src: "/art/photo/kolsai.jpg", cls: "row-span-2" },
  { id: "charyn", src: "/art/photo/charyn.jpg", cls: "col-span-2" },
  { id: "kaindy", src: "/art/photo/kaindy.jpg", cls: "row-span-2" },
  { id: "dune", src: "/art/photo/dune.jpg", cls: "" },
  { id: "torysh", src: "/art/photo/torysh.jpg", cls: "" },
];

/** Photo mosaic of the places guests travel for, set between two felt-pattern bands. */
export function Places({ t }: { t: LandingCopy }) {
  return (
    <section aria-labelledby="places-title" className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 id="places-title" className="text-4xl leading-[1.05] sm:text-5xl">
              {t.placesTitle}
            </h2>
            <p className="mt-3 max-w-lg text-muted">{t.placesSub}</p>
          </div>
          <span aria-hidden className="orn orn-rosette hidden h-16 shrink-0 text-clay sm:block" />
        </div>

        <div className="relative mt-10 lg:px-12">
          <span aria-hidden className="orn orn-strip-horn absolute inset-y-0 left-0 hidden w-7 text-stone lg:block" />
          <span aria-hidden className="orn orn-strip-horn absolute inset-y-0 right-0 hidden w-7 text-stone lg:block" />
          <ul className="m-0 grid list-none auto-rows-[9.5rem] grid-cols-2 gap-2 p-0 [grid-auto-flow:dense] sm:auto-rows-[13rem] md:grid-cols-4 md:gap-3">
            {PLACES.map(({ id, src, cls }) => (
              <li key={id} className={`relative overflow-hidden rounded-[var(--radius-card)] bg-stone ${cls}`}>
                <Image src={src} alt={t.places[id]} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                <div aria-hidden className="place-shade absolute inset-0" />
                <p className="absolute inset-x-0 bottom-0 p-3 font-serif text-lg font-semibold leading-tight text-paper sm:p-4 sm:text-xl">
                  {t.places[id]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
