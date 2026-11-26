"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BookingRequest, Listing, Message } from "@/lib/types";

export interface RequestData {
  request: BookingRequest;
  listing: Listing;
  messages: Message[];
}

/** Polls the request every 3 s. `live` is false while the last fetch failed. */
export function useRequestPolling(code: string, k: string | null, initial: RequestData) {
  const [data, setData] = useState<RequestData>(initial);
  const [live, setLive] = useState(true);
  const inFlight = useRef(false);
  // Bumped on every local change; a poll that started before it is stale and is dropped.
  const localVersion = useRef(0);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const startedAt = localVersion.current;
    try {
      const res = await fetch(`/api/requests/${code}${k ? `?k=${encodeURIComponent(k)}` : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const j = (await res.json()) as RequestData;
      if (startedAt !== localVersion.current) return;
      setData({ request: j.request, listing: j.listing, messages: j.messages });
      setLive(true);
    } catch {
      setLive(false);
    } finally {
      inFlight.current = false;
    }
  }, [code, k]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 3000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  /** Adds a message we just created without waiting for the next poll. */
  const addMessage = useCallback((m: Message, status?: BookingRequest["status"]) => {
    localVersion.current++;
    setData((d) => ({
      ...d,
      request: status ? { ...d.request, status } : d.request,
      messages: d.messages.some((x) => x.id === m.id) ? d.messages : [...d.messages, m],
    }));
  }, []);

  return { data, live, refresh, addMessage };
}
