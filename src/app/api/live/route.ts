import type { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { eventsAfter } from "@/lib/repo";

/** Live feed for the projector screen. Poll with ?after=<last id>. Response: { events } */
export async function GET(req: NextRequest) {
  const after = Number(req.nextUrl.searchParams.get("after") ?? "0") || 0;
  const events = await eventsAfter(after, after === 0 ? 20 : 50);
  return json({ events }, { headers: { "Cache-Control": "no-store" } });
}
