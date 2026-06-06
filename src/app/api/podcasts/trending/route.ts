import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/podcast-index";

export async function GET(req: NextRequest) {
  const cat = req.nextUrl.searchParams.get("cat") ?? undefined;
  try {
    const results = await getTrending(20, cat);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 });
  }
}
