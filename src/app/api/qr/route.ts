import type { NextRequest } from "next/server";
import QRCode from "qrcode";

/** GET /api/qr?text=<url>&dark=0F3D3E → SVG QR code. */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");
  if (!text || text.length > 500) return new Response("text is required (max 500 chars)", { status: 400 });
  const dark = /^[0-9a-fA-F]{6}$/.test(req.nextUrl.searchParams.get("dark") ?? "")
    ? `#${req.nextUrl.searchParams.get("dark")}`
    : "#0F3D3E";
  const svg = await QRCode.toString(text, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark, light: "#00000000" },
  });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
