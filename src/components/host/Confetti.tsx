"use client";

import { useMemo } from "react";

const COLORS = ["#e8a33d", "#0f5e63", "#2f8f5b", "#fbecd2", "#e3efee"];

/** Tasteful one-shot confetti. Pure CSS, disabled for reduced-motion users. */
export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 53) % 60) / 100,
        dur: 1.8 + ((i * 29) % 12) / 10,
        color: COLORS[i % COLORS.length],
        rot: (i * 47) % 360,
        w: 6 + (i % 3) * 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-screen overflow-hidden" aria-hidden>
      <style>{`
        @keyframes qonaq-fall { 0% { transform: translateY(-20px) rotate(0); opacity: 1 } 85% { opacity: 1 } 100% { transform: translateY(100vh) rotate(var(--r)); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .qonaq-confetti { display: none } }
      `}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="qonaq-confetti absolute top-0 block rounded-[2px]"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.w * 1.6,
            background: p.color,
            ["--r" as string]: `${p.rot + 540}deg`,
            animation: `qonaq-fall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
