import "server-only";
import { cookies } from "next/headers";
import { editCookieName, safeEqual } from "@/lib/http";
import { getListingById } from "@/lib/repo";

/**
 * Host-only check for server pages. Accepts the edit cookie or an explicit ?t= token.
 * Returns the listing and the verified token, or null when the visitor is not the host.
 */
export async function hostAccess(id: string, queryToken?: string | null) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const listing = await getListingById(id);
  if (!listing) return null;
  const cookie = (await cookies()).get(editCookieName(id))?.value;
  const token = [cookie, queryToken].find((t) => safeEqual(t, listing.editToken));
  if (!token) return null;
  return { listing, token };
}
