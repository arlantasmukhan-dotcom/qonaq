"use client";

import { useEffect, useRef, useState } from "react";
import type { HostDict } from "@/i18n/host";

const MAX_PHOTOS = 6;
const MAX_SIDE = 1280;

interface Item {
  key: string;
  preview: string;
  id?: string;
  progress: number;
  error?: boolean;
}

async function resizeToDataUrl(file: File): Promise<string> {
  const objUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode"));
      i.src = objUrl;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    let q = 0.8;
    let out = canvas.toDataURL("image/jpeg", q);
    while (out.length * 0.75 > 640 * 1024 && q > 0.4) {
      q -= 0.1;
      out = canvas.toDataURL("image/jpeg", q);
    }
    return out;
  } finally {
    URL.revokeObjectURL(objUrl);
  }
}

function upload(dataUrl: string, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/photos");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as { id?: string };
        if (xhr.status >= 200 && xhr.status < 300 && data.id) resolve(data.id);
        else reject(new Error("upload"));
      } catch {
        reject(new Error("upload"));
      }
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(JSON.stringify({ dataUrl }));
  });
}

export function PhotoPicker({
  t,
  onChange,
}: {
  t: HostDict;
  onChange: (state: { ids: string[]; busy: boolean }) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange({
      ids: items.filter((i) => i.id).map((i) => i.id as string),
      busy: items.some((i) => !i.id && !i.error),
    });
  }, [items, onChange]);

  function patch(key: string, p: Partial<Item>) {
    setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...p } : i)));
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setErr(false);
    const room = MAX_PHOTOS - items.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    for (const file of picked) {
      const key = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setItems((cur) => [...cur, { key, preview, progress: 0 }]);
      void (async () => {
        try {
          const dataUrl = await resizeToDataUrl(file);
          const id = await upload(dataUrl, (p) => patch(key, { progress: p }));
          patch(key, { id, progress: 1 });
        } catch {
          patch(key, { error: true });
          setErr(true);
        }
      })();
    }
    if (input.current) input.current.value = "";
  }

  function remove(key: string) {
    setItems((cur) => cur.filter((i) => i.key !== key));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it, idx) => (
          <div key={it.key} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.preview} alt="" className="h-full w-full object-cover" />
            {idx === 0 && it.id && (
              <span className="absolute bottom-1 left-1 rounded-full bg-saffron px-2 py-0.5 text-[10px] font-bold text-ink">★</span>
            )}
            {!it.id && !it.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-ink/35 p-2" role="status" aria-label={t.uploading}>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/40">
                  <div className="h-full bg-saffron transition-all" style={{ width: `${Math.max(8, it.progress * 100)}%` }} />
                </div>
              </div>
            )}
            {it.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-busy-soft/90 text-xs font-bold text-busy">!</div>
            )}
            <button
              type="button"
              onClick={() => remove(it.key)}
              aria-label={t.removePhoto}
              className="absolute right-0 top-0 flex h-11 w-11 items-start justify-end p-1.5"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-sm text-white">×</span>
            </button>
          </div>
        ))}
        {items.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-paper text-teal"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span className="px-1 text-center text-xs font-bold leading-tight">{t.addPhoto}</span>
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-label={t.addPhoto}
        tabIndex={-1}
        onChange={(e) => void onFiles(e.target.files)}
      />
      {err && (
        <p role="alert" className="mt-2 text-sm font-semibold text-busy">
          {t.errPhoto}
        </p>
      )}
    </div>
  );
}
