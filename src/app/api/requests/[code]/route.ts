import type { NextRequest } from "next/server";
import { fail, json, safeEqual } from "@/lib/http";
import { getListingById, getRequestByCode, listMessages, publicListing, publicRequest } from "@/lib/repo";

/**
 * Request page data, polled every few seconds.
 * With ?k=<hostKey> the caller is the host (isHost: true) and may reply.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const request = await getRequestByCode(code.toUpperCase());
  if (!request) return fail("not_found", "Request not found", 404);
  const listing = await getListingById(request.listingId);
  if (!listing) return fail("not_found", "Listing not found", 404);

  const isHost = safeEqual(req.nextUrl.searchParams.get("k"), request.hostKey);
  return json(
    {
      request: publicRequest(request),
      listing: publicListing(listing),
      messages: await listMessages(request.id),
      isHost,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
