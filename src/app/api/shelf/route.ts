import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShelfStatus } from "@prisma/client";

// GET /api/shelf — get current user's shelf
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.shelfEntry.findMany({
    where: { userId: session.user.id },
    include: { podcast: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ entries });
}

// POST /api/shelf — add or update a shelf entry
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { podcastIndexId, title, author, description, imageUrl, feedUrl, status } =
    await req.json();

  if (!podcastIndexId || !title || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Upsert podcast record
  const podcast = await prisma.podcast.upsert({
    where: { podcastIndexId: String(podcastIndexId) },
    create: {
      podcastIndexId: String(podcastIndexId),
      title,
      author,
      description,
      imageUrl,
      feedUrl,
    },
    update: { title, author, description, imageUrl, feedUrl },
  });

  // Upsert shelf entry
  const entry = await prisma.shelfEntry.upsert({
    where: { userId_podcastId: { userId: session.user.id, podcastId: podcast.id } },
    create: { userId: session.user.id, podcastId: podcast.id, status: status as ShelfStatus },
    update: { status: status as ShelfStatus },
  });

  return NextResponse.json({ entry });
}

// DELETE /api/shelf?podcastId=xxx OR ?podcastIndexId=xxx
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const podcastId = req.nextUrl.searchParams.get("podcastId");
  const podcastIndexId = req.nextUrl.searchParams.get("podcastIndexId");

  if (podcastId) {
    await prisma.shelfEntry.deleteMany({
      where: { userId: session.user.id, podcastId },
    });
  } else if (podcastIndexId) {
    const podcast = await prisma.podcast.findUnique({ where: { podcastIndexId } });
    if (podcast) {
      await prisma.shelfEntry.deleteMany({
        where: { userId: session.user.id, podcastId: podcast.id },
      });
    }
  } else {
    return NextResponse.json({ error: "Missing podcastId or podcastIndexId" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
