import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { AiError } from "./ai";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export type ApiErrorCode = "bad_request" | "too_many_guests" | "not_found" | "forbidden" | "rate_limited" | "ai_no_key" | "ai_failed";

export function fail(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function aiFail(err: unknown) {
  if (err instanceof AiError && err.kind === "no_key") {
    return fail("ai_no_key", "AI is not configured on the server (ANTHROPIC_API_KEY).", 503);
  }
  console.error("[ai]", err);
  return fail("ai_failed", err instanceof Error ? err.message : "AI request failed", 502);
}

/** Public origin for links and QR codes. PUBLIC_BASE_URL wins, else the request's own host. */
export function baseUrl(req: NextRequest): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

export function clientIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
}

export function safeEqual(a: string | null | undefined, b: string): boolean {
  if (!a) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const editCookieName = (listingId: string) => `qe_${listingId.replace(/-/g, "").slice(0, 16)}`;

/** The host proves ownership of a listing with the edit token: cookie, header or ?t= query. */
export function hostToken(req: NextRequest, listingId: string): string | null {
  return (
    req.cookies.get(editCookieName(listingId))?.value ??
    req.headers.get("x-edit-token") ??
    req.nextUrl.searchParams.get("t")
  );
}

export function setEditCookie(res: NextResponse, listingId: string, token: string) {
  res.cookies.set(editCookieName(listingId), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function readJson<T>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
