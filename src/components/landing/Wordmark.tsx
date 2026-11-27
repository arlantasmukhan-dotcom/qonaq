import Link from "next/link";

/** The yurt emblem plus the spaced QONAQ wordmark. `light` sits on photos, `dark` on limewash. */
export function Wordmark({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const color = tone === "light" ? "text-paper" : "text-ink";
  return (
    <Link href="/" aria-label="Qonaq" className={`inline-flex items-center gap-2.5 sm:gap-3 ${color}`}>
      <span aria-hidden className="orn orn-emblem h-9 sm:h-11" />
      <span aria-hidden className="font-serif text-lg font-semibold leading-none tracking-[0.2em] sm:text-2xl sm:tracking-[0.32em]">
        QONAQ
      </span>
    </Link>
  );
}
