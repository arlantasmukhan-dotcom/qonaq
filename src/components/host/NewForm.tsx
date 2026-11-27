"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSpeech } from "@/components/useSpeech";
import type { HostDict } from "@/i18n/host";
import { LANG_LABEL } from "@/lib/lang";
import { LANGS } from "@/lib/types";
import { apiJson, ApiFail, jsonInit } from "./api";
import { PhotoPicker } from "./PhotoPicker";

type DictLang = "kk" | "ru";

function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d) return "";
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)].filter(Boolean);
  return `+7${p.length ? " " + p.join(" ") : ""}`;
}

function MicIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

export function NewForm({ t, initialLang }: { t: HostDict; initialLang: DictLang }) {
  const router = useRouter();
  const [dictLang, setDictLang] = useState<DictLang>(initialLang);
  const speech = useSpeech(dictLang === "kk" ? "kk-KZ" : "ru-RU");
  const [phone, setPhone] = useState("");
  // Empty by default: a pre-filled "Саты" contradicted hosts who name another village aloud.
  const [village, setVillage] = useState("");
  const [photos, setPhotos] = useState<{ ids: string[]; busy: boolean }>({ ids: [], busy: false });
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const onPhotos = useCallback((s: { ids: string[]; busy: boolean }) => setPhotos(s), []);

  // Progress sequence: purely cosmetic, runs while the AI request is in flight.
  useEffect(() => {
    if (!busy) return;
    const timers = [1800, 4500, 8000, 11500, 15000].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [busy]);

  const speechErr = !speech.error
    ? null
    : speech.error === "not-allowed" || speech.error === "service-not-allowed"
      ? t.errMicDenied
      : t.errSpeech;

  function toggleMic() {
    if (speech.listening) speech.stop();
    else speech.start();
  }

  function pickLang(l: DictLang) {
    if (speech.listening) speech.stop();
    setDictLang(l);
  }

  async function submit() {
    setFormErr(null);
    setFailed(false);
    if (speech.listening) speech.stop();
    // Words still being recognised when the host taps "create" count too.
    const text = `${speech.text} ${speech.interim}`.trim();
    if (text.length < 10) return setFormErr(t.needText);
    if (phone.replace(/\D/g, "").length < 10) return setFormErr(t.needPhone);
    if (!village.trim()) {
      document.getElementById("village")?.focus();
      return setFormErr(t.needVillage);
    }
    if (photos.busy) return setFormErr(t.waitPhotos);
    setStep(0);
    setBusy(true);
    try {
      const data = await apiJson<{ id: string }>(
        "/api/listings/draft",
        jsonInit("POST", {
          text,
          lang: dictLang,
          whatsapp: phone.replace(/\D/g, ""),
          village: village.trim(),
          photoIds: photos.ids,
        }),
      );
      router.push(`/new/${data.id}`);
    } catch (e) {
      setBusy(false);
      setFailed(true);
      const code = e instanceof ApiFail ? e.code : "network";
      setFormErr(
        code === "ai_no_key"
          ? t.errAiNoKey
          : code === "network"
            ? t.errNet
            : code === "rate_limited"
              ? t.errRate
              : code === "bad_request"
                ? t.errBad
                : t.errAi,
      );
    }
  }

  const steps = [t.p1, t.p2, t.p2, t.p3, t.p4, t.p5];
  const lit = Math.max(0, step - 2); // how many language chips are lit

  return (
    <>
      <div className="card animate-rise p-5 text-center">
        <div role="group" aria-label={t.dictLang} className="mx-auto mb-5 inline-flex rounded-full border border-line bg-sand p-1">
          {(["kk", "ru"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={dictLang === l}
              onClick={() => pickLang(l)}
              className={`min-h-11 min-w-28 rounded-full px-4 text-sm font-bold transition-colors ${
                dictLang === l ? "bg-patina text-white" : "text-muted"
              }`}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleMic}
            disabled={!speech.supported}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? t.micListening : t.micTap}
            className={`flex h-32 w-32 items-center justify-center rounded-full bg-clay text-paper shadow-lg transition-transform active:scale-95 disabled:opacity-40 ${
              speech.listening ? "animate-mic scale-105" : ""
            }`}
          >
            <MicIcon />
          </button>
        </div>
        <p className="mt-3 text-sm font-bold text-patina-dark" aria-live="polite">
          {speech.listening ? t.micListening : t.micTap}
        </p>

        {!speech.supported && <p className="mt-3 rounded-xl bg-clay-soft p-3 text-sm text-ink">{t.errNoSpeech}</p>}
        {speechErr && (
          <p role="alert" className="mt-3 rounded-xl bg-busy-soft p-3 text-sm font-semibold text-busy">
            {speechErr}
          </p>
        )}

        {(speech.listening || speech.interim) && (
          <div className="mt-4 rounded-2xl bg-sand p-3 text-left text-base leading-snug" aria-live="polite">
            <span className="text-ink">{speech.text} </span>
            <span className="text-muted/70">{speech.interim}</span>
          </div>
        )}
      </div>

      <section className="card mt-4 p-4">
        <label className="label" htmlFor="story">
          {t.textLabel}
        </label>
        <textarea
          id="story"
          className="input min-h-36 resize-y leading-snug"
          value={speech.text}
          onChange={(e) => speech.setText(e.target.value)}
          placeholder={t.textPlaceholder}
          lang={dictLang}
        />
        <div className="mt-2 flex justify-end">
          {speech.text && (
            <button type="button" className="min-h-11 px-2 text-sm font-bold text-muted underline" onClick={speech.reset}>
              {t.clear}
            </button>
          )}
        </div>
        <details className="rounded-xl bg-patina-soft p-3 text-sm" open={!speech.text}>
          <summary className="min-h-6 cursor-pointer font-bold text-patina-dark">{t.hintTitle}</summary>
          <p className="mt-2 text-muted">{t.hintList}</p>
          <p className="mt-2 italic text-ink">«{t.hintExample}»</p>
        </details>
      </section>

      <section className="card mt-4 p-4">
        <h2 className="text-base font-extrabold">{t.photos}</h2>
        <p className="mb-3 text-sm text-muted">{t.photosHint}</p>
        <PhotoPicker t={t} onChange={onPhotos} />
      </section>

      <section className="card mt-4 space-y-4 p-4">
        <div>
          <label className="label" htmlFor="wa">
            {t.whatsapp}
          </label>
          <input
            id="wa"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 7XX XXX XX XX"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
          />
          <p className="mt-1 text-xs text-muted">{t.whatsappHint}</p>
        </div>
        <div>
          <label className="label" htmlFor="village">
            {t.village}
          </label>
          <input
            id="village"
            className="input"
            value={village}
            placeholder={t.villagePlaceholder}
            onChange={(e) => setVillage(e.target.value)}
            maxLength={60}
          />
          <p className="mt-1 text-xs text-muted">{t.villageHint}</p>
        </div>
      </section>

      {formErr && (
        <div role="alert" className="mt-4 rounded-2xl bg-busy-soft p-4 text-sm font-semibold text-busy">
          {formErr}
        </div>
      )}

      <button type="button" className="btn btn-primary btn-xl mt-5 w-full" onClick={() => void submit()} disabled={busy}>
        {failed ? t.retry : t.create}
      </button>

      {busy && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-patina-dark px-6 text-center text-white"
          role="dialog"
          aria-modal="true"
          aria-label={t.p5}
        >
          <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-clay/40" />
            <span className="absolute inset-3 animate-pulse rounded-full bg-clay/70" />
            <span className="relative text-ink">
              <MicIcon />
            </span>
          </div>
          <p key={step} className="animate-rise min-h-16 max-w-xs text-xl font-extrabold leading-snug" aria-live="polite">
            {steps[Math.min(step, steps.length - 1)]}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2" aria-hidden>
            {LANGS.map((l, i) => (
              <span
                key={l}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-500 ${
                  i < lit || (i === 0 && step >= 2) ? "scale-110 bg-clay text-paper" : "bg-white/15 text-white/60"
                }`}
              >
                {LANG_LABEL[l]}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
