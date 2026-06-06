import { NextRequest, NextResponse } from "next/server";
import { searchPodcasts } from "@/lib/podcast-index";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ results: [] });

  try {
    const results = await searchPodcasts(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
