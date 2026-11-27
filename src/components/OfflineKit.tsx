"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Offline support glue. Mount once in the root layout: <OfflineKit />.
 *
 * - Registers /sw.js. In production always. In development ONLY when
 *   localStorage.qonaq_sw_dev === "1" (a service worker next to HMR serves stale chunks);
 *   enable with `localStorage.setItem("qonaq_sw_dev","1")` and reload, disable with removeItem
 *   plus "Unregister" in DevTools > Application.
 * - Shows a slim banner while the browser is offline.
 * - Sends the SW the URLs to keep (page, its /driver card, every photo) and, once the SW confirms,
 *   reveals elements marked with the [data-offline-badge] attribute. Render the badge with the
 *   `hidden` attribute; this component removes it.
 */

const RESERVED = new Set(["api", "new", "host", "poster", "live", "offline", "r", "_next", "art"]);

const BANNER: Record<string, string> = {
  ru: "Нет сети — показана сохранённая версия",
  kk: "Желі жоқ — сақталған нұсқа көрсетілді",
  en: "Offline — showing saved copy",
  zh: "离线 — 显示已保存的版本",
};

function bannerText(): string {
  const l = (document.documentElement.lang || "en").toLowerCase().split("-")[0] ?? "en";
  return BANNER[l] ?? BANNER.en!;
}

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

function revealBadges() {
  document.querySelectorAll<HTMLElement>("[data-offline-badge]").forEach((el) => {
    el.hidden = false;
    el.removeAttribute("hidden");
    el.classList.remove("hidden");
    el.style.display = "";
    el.dataset.offlineReady = "true";
  });
}

/** URLs this page wants available offline. */
function urlsForPage(): { page: string; urls: string[] } | null {
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  const isRequest = parts.length === 2 && parts[0] === "r";
  const isHouse = parts.length === 2 && !RESERVED.has(parts[0] ?? "");
  const isDriver = parts.length === 3 && parts[2] === "driver" && !RESERVED.has(parts[0] ?? "");
  if (!isRequest && !isHouse && !isDriver) return null;
  if (isRequest && new URLSearchParams(location.search).has("k")) return null; // host view: keep the key out of caches

  const page = isRequest ? location.pathname + location.search : path;
  const urls = [page];
  if (isHouse) urls.push(`${path}/driver`);
  if (isDriver) urls.push(path.replace(/\/driver$/, ""));
  for (const img of Array.from(document.images)) {
    try {
      const u = new URL(img.currentSrc || img.src, location.href);
      if (u.origin === location.origin && u.pathname.startsWith("/api/photo/")) urls.push(u.pathname);
    } catch {
      /* ignore bad src */
    }
  }
  return { page, urls: [...new Set(urls)] };
}

export function OfflineKit() {
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  // Service worker registration and proactive caching.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const dev = process.env.NODE_ENV !== "production";
    if (dev && localStorage.getItem("qonaq_sw_dev") !== "1") return;

    let observer: MutationObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onMessage = (e: MessageEvent) => {
      const d = e.data as { type?: string; ok?: boolean } | null;
      if (d?.type !== "cache-status" || !d.ok) return;
      revealBadges();
      // Badges rendered after the confirmation (client-side navigation, lazy sections).
      observer?.disconnect();
      observer = new MutationObserver(() => {
        if (document.querySelector("[data-offline-badge]:not([data-offline-ready])")) revealBadges();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    const warm = async () => {
      const info = urlsForPage();
      if (!info) return;
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ type: "cache-urls", page: info.page, urls: info.urls });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => {
        // Images may still be loading; give the page a moment so every src is in the DOM.
        timer = setTimeout(() => void warm(), 800);
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
      observer?.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Keep content clear of the fixed banner while offline.
  useEffect(() => {
    if (online) return;
    const prev = document.body.style.paddingTop;
    document.body.style.paddingTop = "2rem";
    return () => {
      document.body.style.paddingTop = prev;
    };
  }, [online]);

  if (online) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex h-8 items-center justify-center gap-2 bg-ink px-3 text-xs font-bold text-white"
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-clay" />
      <span className="truncate">{bannerText()}</span>
    </div>
  );
}
