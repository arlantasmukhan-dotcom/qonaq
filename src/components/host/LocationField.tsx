"use client";

import { useState } from "react";
import type { HostDict } from "@/i18n/host";

type Pos = { lat: number | null; lng: number | null };

/**
 * "Where is the house": the host stands at the house and taps once; the phone's location becomes the
 * pin that the driver card opens in 2GIS and Google Maps. Without it a new house has no map at all.
 */
export function LocationField({
  t,
  lat,
  lng,
  onSave,
}: {
  t: HostDict;
  lat: number | null;
  lng: number | null;
  onSave: (pos: Pos) => Promise<string | null>; // returns an error message or null
}) {
  const [finding, setFinding] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const has = lat !== null && lng !== null;

  function locate() {
    setErr(null);
    if (!("geolocation" in navigator)) {
      setErr(t.locDenied);
      return;
    }
    setFinding(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const round = (v: number) => Math.round(v * 1e6) / 1e6;
        const e = await onSave({ lat: round(p.coords.latitude), lng: round(p.coords.longitude) });
        setFinding(false);
        if (e) setErr(e);
      },
      (e) => {
        setFinding(false);
        setErr(e.code === e.PERMISSION_DENIED ? t.locDenied : t.locFail);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  return (
    <div className={`rounded-2xl border p-3 ${has ? "border-line bg-paper" : "border-clay bg-clay-soft"}`}>
      <span className="label">{t.fLocation}</span>
      {has ? (
        <p className="text-sm font-semibold">
          📍 {lat.toFixed(5)}, {lng.toFixed(5)} ·{" "}
          <a
            href={`https://2gis.kz/geo/${lng},${lat}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-patina underline"
          >
            {t.locCheck}
          </a>
        </p>
      ) : (
        <p className="font-bold">{t.locNone}</p>
      )}
      <p className="mt-1 text-xs text-muted">{t.locHint}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={locate} disabled={finding} className="btn btn-accent flex-1">
          {finding ? t.locFinding : has ? t.locUpdate : t.locSet}
        </button>
        {has && (
          <button
            type="button"
            disabled={finding}
            onClick={() => void onSave({ lat: null, lng: null }).then((e) => setErr(e))}
            className="btn btn-ghost shrink-0 bg-white"
          >
            {t.locRemove}
          </button>
        )}
      </div>
      {err && (
        <p role="alert" className="mt-2 text-sm font-semibold text-busy">
          {err}
        </p>
      )}
    </div>
  );
}
