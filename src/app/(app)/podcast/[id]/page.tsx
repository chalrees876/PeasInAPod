import { notFound } from "next/navigation";
import Image from "next/image";
import { getPodcastById } from "@/lib/podcast-index";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ShelfButton from "./ShelfButton";
import ReviewSection from "./ReviewSection";
import { Headphones, ExternalLink, Globe } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PodcastPage({ params }: Props) {
  const { id } = await params;

  let podcast = null;
  try {
    podcast = await getPodcastById(id);
  } catch {
    // fall through to DB lookup
  }

  if (!podcast) {
    const dbPodcast = await prisma.podcast.findFirst({
      where: { OR: [{ id }, { podcastIndexId: id }] },
    });
    if (!dbPodcast) notFound();
    podcast = {
      id: Number(dbPodcast.podcastIndexId ?? dbPodcast.id),
      title: dbPodcast.title,
      author: dbPodcast.author ?? "",
      description: dbPodcast.description ?? "",
      image: dbPodcast.imageUrl ?? "",
      url: dbPodcast.feedUrl ?? "",
      link: dbPodcast.websiteUrl ?? "",
    };
  }

  const session = await auth();

  let shelfEntry = null;
  let dbPodcastId: string | null = null;

  if (session?.user?.id) {
    const dbPodcast = await prisma.podcast.findFirst({
      where: { podcastIndexId: String(podcast.id) },
      include: {
        shelves: { where: { userId: session.user.id } },
      },
    });
    shelfEntry = dbPodcast?.shelves?.[0] ?? null;
    dbPodcastId = dbPodcast?.id ?? null;
  }

  const reviews = await prisma.review.findMany({
    where: {
      podcast: { podcastIndexId: String(podcast.id) },
    },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex gap-6 mb-8">
        {podcast.image ? (
          <Image
            src={podcast.image}
            alt={podcast.title}
            width={128}
            height={128}
            className="rounded-2xl object-cover flex-shrink-0 shadow-md"
            unoptimized
          />
        ) : (
          <div className="w-32 h-32 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Headphones className="w-12 h-12 text-purple-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{podcast.title}</h1>
          {podcast.author && <p className="text-gray-500 mb-2">{podcast.author}</p>}
          {avgRating && (
            <p className="text-sm text-yellow-600 font-medium mb-3">★ {avgRating} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            <ShelfButton
              podcastIndexId={String(podcast.id)}
              title={podcast.title}
              author={podcast.author}
              description={podcast.description}
              imageUrl={podcast.image}
              feedUrl={podcast.url}
              initialStatus={shelfEntry?.status ?? null}
            />
            {podcast.link && (
              <a
                href={podcast.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-purple-400"
              >
                <Globe className="w-4 h-4" />
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {podcast.description && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {podcast.description.replace(/<[^>]+>/g, "")}
          </p>
        </div>
      )}

      <ReviewSection
        podcastIndexId={String(podcast.id)}
        dbPodcastId={dbPodcastId}
        reviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          body: r.body,
          createdAt: r.createdAt.toISOString(),
          user: r.user,
        }))}
        currentUserId={session?.user?.id ?? null}
      />
    </div>
  );
}
