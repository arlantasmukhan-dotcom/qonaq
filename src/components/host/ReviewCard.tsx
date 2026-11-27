"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HostDict } from "@/i18n/host";
import { formatKzt } from "@/lib/currency";
import { LANG_LABEL } from "@/lib/lang";
import type { Lang, Listing, ListingText } from "@/lib/types";
import { formatPhone } from "@/i18n/tourist";
import { normalizeWhatsapp } from "@/lib/phone";
import { apiJson, ApiFail, jsonInit } from "./api";
import { FieldRow } from "./FieldRow";
import { LocationField } from "./LocationField";

const PREVIEW_ORDER: Lang[] = ["zh", "en", "kk", "ru"];
type TextField = keyof ListingText;

export function ReviewCard({
  t,
  initial,
  hostLang,
  token,
}: {
  t: HostDict;
  initial: Listing;
  hostLang: "kk" | "ru";
  token: string;
}) {
  const router = useRouter();
  const [listing, setListing] = useState(initial);
  const [preview, setPreview] = useState<Lang>("zh");
  const [publishing, setPublishing] = useState(false);
  const [pubErr, setPubErr] = useState<string | null>(null);
  const src = listing.sourceLang;
  const srcText = listing.content[src];

  async function patch(body: Record<string, unknown>): Promise<string | null> {
    try {
      const r = await apiJson<{ listing: Listing }>(`/api/listings/${listing.id}`, {
        ...jsonInit("PATCH", body),
        headers: { "Content-Type": "application/json", "x-edit-token": token },
      });
      setListing(r.listing);
      return null;
    } catch (e) {
      if (e instanceof ApiFail) {
        if (e.code === "ai_no_key") return t.errAiNoKey;
        if (e.code === "network") return t.errNet;
      }
      return t.saveFail;
    }
  }

  const saveText = (field: TextField) => (v: string) =>
    patch({
      content: { ...listing.content, [src]: { ...srcText, [field]: v.trim() } },
      retranslateFrom: src,
    });

  const saveNum = (field: "rooms" | "priceKzt" | "priceGuests") => (v: string) => {
    const n = v.trim() === "" ? null : Math.round(Number(v));
    if (n !== null && (!Number.isFinite(n) || n < 0)) return Promise.resolve(t.saveFail);
    if (field === "priceGuests" && n === 0) return Promise.resolve(t.saveFail);
    return patch({ [field]: n });
  };

  async function publish() {
    setPublishing(true);
    setPubErr(null);
    const e = await patch({ status: "published" });
    if (e) {
      setPublishing(false);
      setPubErr(e);
      return;
    }
    router.push(`/host/${listing.id}`);
  }

  const missing = {
    title: !srcText.title.trim(),
    description: !srcText.description.trim(),
    rooms: listing.rooms === null,
    price: listing.priceKzt === null,
    guests: listing.priceGuests === null,
    breakfast: listing.breakfastIncluded === null,
    checkIn: !listing.checkIn,
    rules: !srcText.rules.trim(),
  };
  const pv = listing.content[preview];
  const cover = listing.photoIds[0];

  return (
    <div className="space-y-3">
      <FieldRow t={t} label={t.fTitle} kind="text" lang={src} value={srcText.title} missing={missing.title} onSave={saveText("title")} busyText={t.saveTranslating} />
      <FieldRow t={t} label={t.fDescription} kind="area" lang={src} value={srcText.description} missing={missing.description} onSave={saveText("description")} busyText={t.saveTranslating} />

      <div className="grid grid-cols-2 gap-3">
        <FieldRow
          t={t}
          label={t.fRooms}
          kind="number"
          value={listing.rooms?.toString() ?? ""}
          display={`${listing.rooms} ${t.roomsUnit}`}
          missing={missing.rooms}
          onSave={saveNum("rooms")}
        />
        <FieldRow
          t={t}
          label={t.fCheckIn}
          kind="time"
          value={listing.checkIn ?? ""}
          missing={missing.checkIn}
          onSave={(v) => patch({ checkIn: /^\d{2}:\d{2}$/.test(v) ? v : null })}
        />
      </div>

      <FieldRow
        t={t}
        label={`${t.fPrice} (₸)`}
        kind="number"
        value={listing.priceKzt?.toString() ?? ""}
        display={listing.priceKzt !== null ? `${formatKzt(listing.priceKzt)} ${t.perNight}` : ""}
        missing={missing.price}
        suffix="₸"
        onSave={saveNum("priceKzt")}
      />
      <FieldRow
        t={t}
        label={t.fGuests}
        kind="number"
        value={listing.priceGuests?.toString() ?? ""}
        display={`${listing.priceGuests} ${t.guestsUnit}`}
        missing={missing.guests}
        onSave={saveNum("priceGuests")}
      />

      <div className={`rounded-2xl border p-3 ${missing.breakfast ? "border-saffron bg-saffron-soft" : "border-line bg-paper"}`}>
        <span className="label">{t.fBreakfast}</span>
        {missing.breakfast && <p className="mb-2 font-bold">{t.missing}</p>}
        <div role="group" aria-label={t.fBreakfast} className="grid grid-cols-2 gap-2">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={listing.breakfastIncluded === v}
              onClick={() => void patch({ breakfastIncluded: v })}
              className={`min-h-12 rounded-xl border-2 text-sm font-bold ${
                listing.breakfastIncluded === v ? "border-teal bg-teal text-white" : "border-line bg-white text-ink"
              }`}
            >
              {v ? t.breakfastYes : t.breakfastNo}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="label mt-4">{t.fExtras}</h3>
        {listing.extras.length === 0 ? (
          <p className="rounded-2xl border border-line bg-paper p-3 text-muted">{t.noExtras}</p>
        ) : (
          <div className="space-y-2">
            {listing.extras.map((x) => (
              <FieldRow
                key={x.id}
                t={t}
                label={x.name[hostLang] || x.name[src] || x.kind}
                kind="number"
                value={x.priceKzt?.toString() ?? ""}
                display={x.priceKzt === null ? t.priceUnset : x.priceKzt === 0 ? t.free : formatKzt(x.priceKzt)}
                suffix="₸"
                onSave={(v) => {
                  const n = v.trim() === "" ? null : Math.round(Number(v));
                  if (n !== null && (!Number.isFinite(n) || n < 0)) return Promise.resolve(t.saveFail);
                  return patch({ extras: listing.extras.map((e) => (e.id === x.id ? { ...e, priceKzt: n } : e)) });
                }}
                onRemove={() => void patch({ extras: listing.extras.filter((e) => e.id !== x.id) })}
              />
            ))}
          </div>
        )}
      </div>

      <FieldRow t={t} label={t.fRules} kind="area" lang={src} value={srcText.rules} missing={missing.rules} onSave={saveText("rules")} busyText={t.saveTranslating} />

      <FieldRow
        t={t}
        label={t.fPhone}
        kind="text"
        value={formatPhone(listing.whatsapp)}
        onSave={(v) => {
          // Same normalisation as the server; bookings go to this number, so check it here.
          const digits = normalizeWhatsapp(v);
          if (!digits) return Promise.resolve(t.badPhone);
          return patch({ whatsapp: digits });
        }}
      />

      <LocationField t={t} lat={listing.lat} lng={listing.lng} onSave={(pos) => patch(pos)} />

      <section className="card mt-6 overflow-hidden" aria-label={t.previewTitle}>
        <div className="bg-teal-soft p-3">
          <h2 className="mb-2 text-sm font-extrabold text-teal-dark">{t.previewTitle}</h2>
          <div role="group" aria-label={t.previewTitle} className="grid grid-cols-4 gap-1">
            {PREVIEW_ORDER.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={preview === l}
                onClick={() => setPreview(l)}
                className={`min-h-11 rounded-full px-1 text-xs font-bold ${preview === l ? "bg-teal text-white" : "bg-white text-teal-dark"}`}
              >
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/photo/${cover}`} alt="" className="aspect-[16/10] w-full object-cover" />
        )}
        <div className="p-4" lang={preview === "zh" ? "zh-CN" : preview}>
          <h3 className="text-xl font-extrabold leading-snug">{pv.title || "—"}</h3>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/85">{pv.description}</p>
        </div>
      </section>

      {pubErr && (
        <div role="alert" className="rounded-2xl bg-busy-soft p-3 text-sm font-semibold text-busy">
          {pubErr}
        </div>
      )}
      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-sand via-sand to-transparent px-4 pb-4 pt-6">
        <button type="button" className="btn btn-primary btn-xl w-full" disabled={publishing} onClick={() => void publish()}>
          {publishing ? t.publishing : t.publish}
        </button>
      </div>
    </div>
  );
}
