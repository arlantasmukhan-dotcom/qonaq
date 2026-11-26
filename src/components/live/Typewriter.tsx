"use client";

import { useEffect, useState } from "react";
import "./live.css";

/** Reveals text character by character after a delay. `instant` (old events, reduced motion) renders it whole. */
export function Typewriter({
  text,
  delay = 900,
  speed = 28,
  instant = false,
  className = "",
}: {
  text: string;
  delay?: number;
  speed?: number;
  instant?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const skip = instant || reduced;
  useEffect(() => {
    if (skip) return;
    const chars = Array.from(text).length;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      let n = 0;
      // Long texts finish within ~2.5 s so the stage never waits.
      const step = Math.max(1, Math.ceil(chars / 90));
      timer = setInterval(() => {
        n = Math.min(chars, n + step);
        setShown(n);
        if (n >= chars) clearInterval(timer);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [text, delay, speed, skip]);

  const chars = Array.from(text);
  const full = skip || shown >= chars.length;
  const visible = full ? text : chars.slice(0, shown).join("");
  return (
    <span className={`${className} ${full ? "" : "lv-caret"}`} aria-label={text}>
      <span aria-hidden>{visible}</span>
    </span>
  );
}
