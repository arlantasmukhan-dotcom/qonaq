"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* Minimal typings for the Web Speech API (not in lib.dom for every TS version). */
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type Ctor = new () => SpeechRecognitionLike;

function getCtor(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

export type SpeechLang = "kk-KZ" | "ru-RU" | "en-US" | "zh-CN";

/**
 * Browser dictation. `text` = final transcript so far, `interim` = words still being recognised.
 * `supported` is false on browsers without the API (then show the text field only).
 * `error` is "not-allowed" when the microphone permission is denied.
 */
export function useSpeech(lang: SpeechLang) {
  // Feature detection without a setState-in-effect: false on the server, real value in the browser.
  const supported = useSyncExternalStore(noopSubscribe, () => getCtor() !== null, () => false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<SpeechRecognitionLike | null>(null);
  const wantOn = useRef(false);

  useEffect(() => {
    return () => {
      wantOn.current = false;
      rec.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const C = getCtor();
    if (!C) return;
    rec.current?.abort();
    const r = new C();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalChunk += res[0].transcript;
        else interimChunk += res[0].transcript;
      }
      if (finalChunk) setText((t) => (t ? `${t.trimEnd()} ${finalChunk.trim()}` : finalChunk.trim()));
      setInterim(interimChunk);
    };
    r.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") setError(e.error);
      if (e.error === "not-allowed" || e.error === "language-not-supported") wantOn.current = false;
    };
    r.onend = () => {
      setInterim("");
      // Mobile Chrome stops after a pause; keep listening until the user taps stop.
      if (wantOn.current) {
        try {
          r.start();
          return;
        } catch {
          /* fall through */
        }
      }
      setListening(false);
    };
    rec.current = r;
    wantOn.current = true;
    setError(null);
    try {
      r.start();
      setListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "start-failed");
    }
  }, [lang]);

  const stop = useCallback(() => {
    wantOn.current = false;
    rec.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setText("");
    setInterim("");
  }, []);

  return { supported, listening, text, interim, error, start, stop, reset, setText };
}
