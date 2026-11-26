"use client";

import { useState, type ReactNode } from "react";
import type { HostDict } from "@/i18n/host";

export type FieldKind = "text" | "area" | "number" | "time";

/** A card row: shows the value, tap to edit inline, Save/Cancel. Highlights when the value is missing. */
export function FieldRow({
  t,
  label,
  kind,
  value,
  display,
  missing,
  suffix,
  lang,
  onSave,
  onRemove,
  busyText,
}: {
  t: HostDict;
  label: string;
  kind: FieldKind;
  value: string;
  display?: ReactNode;
  missing?: boolean;
  suffix?: string;
  lang?: string;
  onSave: (v: string) => Promise<string | null>; // returns an error message or null
  onRemove?: () => void;
  busyText?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    const e = await onSave(draft);
    setSaving(false);
    if (e) setErr(e);
    else setEditing(false);
  }

  if (!editing) {
    return (
      <div
        className={`flex items-start gap-2 rounded-2xl border p-3 ${
          missing ? "border-saffron bg-saffron-soft" : "border-line bg-paper"
        }`}
      >
        <button
          type="button"
          className="min-h-12 flex-1 text-left"
          onClick={() => {
            setDraft(value);
            setErr(null);
            setEditing(true);
          }}
        >
          <span className="label !mb-0.5">{label}</span>
          {missing ? (
            <span className="block text-base font-bold text-ink">{t.missing}</span>
          ) : (
            <span className="block whitespace-pre-line text-base font-semibold leading-snug">{display ?? value}</span>
          )}
        </button>
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center text-teal" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h4L19 9l-4-4L4 16z" />
          </svg>
        </span>
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label={t.remove} className="h-12 w-12 shrink-0 text-xl text-busy">
            ×
          </button>
        )}
      </div>
    );
  }

  const id = `f-${label.replace(/\W/g, "")}`;
  return (
    <div className="rounded-2xl border-2 border-teal bg-paper p-3">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {kind === "area" ? (
        <textarea id={id} className="input min-h-32 leading-snug" value={draft} lang={lang} autoFocus onChange={(e) => setDraft(e.target.value)} />
      ) : (
        <div className="flex items-center gap-2">
          <input
            id={id}
            className="input"
            type={kind === "number" ? "number" : kind === "time" ? "time" : "text"}
            inputMode={kind === "number" ? "numeric" : undefined}
            min={kind === "number" ? 0 : undefined}
            value={draft}
            lang={lang}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
          />
          {suffix && <span className="shrink-0 font-bold text-muted">{suffix}</span>}
        </div>
      )}
      {err && (
        <p role="alert" className="mt-2 text-sm font-semibold text-busy">
          {err}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-primary flex-1" disabled={saving} onClick={() => void save()}>
          {saving ? (busyText ?? t.saving) : t.save}
        </button>
        <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => setEditing(false)}>
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
