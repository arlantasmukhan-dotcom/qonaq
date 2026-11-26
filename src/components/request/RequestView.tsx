"use client";

import { GuestView } from "./GuestView";
import { HostView } from "./HostView";
import type { RequestData } from "./usePolling";
import type { Lang } from "@/lib/types";

/** One URL, two modes: the host (valid ?k) sees the Russian answer screen, the guest sees the status. */
export function RequestView({
  code,
  initial,
  hostKey,
  lang,
}: {
  code: string;
  initial: RequestData;
  hostKey: string | null;
  lang: Lang;
}) {
  if (hostKey) return <HostView code={code} initial={initial} hostKey={hostKey} lang={lang === "kk" ? "kk" : "ru"} />;
  return <GuestView code={code} initial={initial} lang={lang} />;
}
