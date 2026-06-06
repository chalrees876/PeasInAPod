import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reviews?podcastId=xxx
export async function GET(req: NextRequest) {
  const podcastId = req.nextUrl.searchParams.get("podcastId");
  if (!podcastId) return NextResponse.json({ error: "Missing podcastId" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { podcastId },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews });
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { podcastId, rating, body } = await req.json();
  if (!podcastId || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  const review = await prisma.review.upsert({
    where: { userId_podcastId: { userId: session.user.id, podcastId } },
    create: { userId: session.user.id, podcastId, rating, body },
    update: { rating, body },
  });

  return NextResponse.json({ review });
}
