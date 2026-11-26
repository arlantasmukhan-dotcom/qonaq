"use client";

import { useRef, useState } from "react";

/** Swipeable photo strip using native scroll-snap, with dots. */
export function PhotoCarousel({ photoIds, alt }: { photoIds: string[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  if (photoIds.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[var(--radius-card)] bg-teal-soft text-5xl">
        🏡
      </div>
    );
  }

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[var(--radius-card)] bg-teal-soft [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photoIds.map((id, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            src={`/api/photo/${id}`}
            alt={i === 0 ? alt : `${alt} ${i + 1}`}
            width={800}
            height={600}
            fetchPriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>
      {photoIds.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {photoIds.map((id, i) => (
            <button
              key={id}
              type="button"
              aria-label={`${i + 1} / ${photoIds.length}`}
              onClick={() => go(i)}
              className="flex h-6 w-5 items-center justify-center"
            >
              <span
                className={`h-2 rounded-full bg-white shadow transition-all ${i === idx ? "w-5 opacity-100" : "w-2 opacity-60"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
