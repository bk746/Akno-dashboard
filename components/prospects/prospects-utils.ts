import type { ProspectBoard } from "@/lib/prospects";

export function boardFromPath(pathname: string): ProspectBoard {
  if (pathname.startsWith("/prospects/louise")) return "louise";
  if (pathname.startsWith("/prospects/prospection-ia")) return "ia";
  return "keryan";
}

export function websiteHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  }
}
