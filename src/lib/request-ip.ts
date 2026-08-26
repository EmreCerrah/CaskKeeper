import type { NextRequest } from "next/server";

/**
 * @file request-ip.ts
 * @description Extracts the client's IP from the request headers.
 *
 * The app runs behind Vercel — or behind a reverse proxy in the Docker setup —
 * so the connection's own address always belongs to the proxy. The real client
 * sits at the FRONT of the `x-forwarded-for` list.
 *
 * SECURITY: this header can be invented by the client. Vercel replaces the
 * incoming header with its own value, so it is trustworthy there; in a setup
 * exposed directly to the internet without a reverse proxy it can be spoofed.
 * The consequence: rate limiting is solid behind a proxy and bypassable
 * without one — which is written down in the README.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  // Vercel sends this as well; some proxies set only this one.
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // If no address can be resolved, all such requests fall into one bucket.
  // Safer than letting the limiting fall away entirely.
  return "unknown";
}
