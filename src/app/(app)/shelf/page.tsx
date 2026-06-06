import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Headphones, Clock, CheckCircle, XCircle } from "lucide-react";
import { ShelfStatus } from "@prisma/client";
import type { ElementType } from "react";

const SHELF_SECTIONS: { status: ShelfStatus; label: string; icon: ElementType }[] = [
  { status: "LISTENING", label: "Currently Listening", icon: Headphones },
  { status: "WANT_TO_LISTEN", label: "Want to Listen", icon: Clock },
  { status: "FINISHED", label: "Finished", icon: CheckCircle },
  { status: "DROPPED", label: "Dropped", icon: XCircle },
];

export default async function ShelfPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entries = await prisma.shelfEntry.findMany({
    where: { userId: session.user.id },
    include: { podcast: true },
    orderBy: { updatedAt: "desc" },
  });

  const byStatus = Object.fromEntries(
    SHELF_SECTIONS.map((s) => [s.status, entries.filter((e) => e.status === s.status)])
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Shelf</h1>

      {entries.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Headphones className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg mb-2">Your shelf is empty</p>
          <Link href="/discover" className="text-purple-600 hover:underline text-sm">
            Browse podcasts to add
          </Link>
        </div>
      )}

      <div className="space-y-10">
        {SHELF_SECTIONS.map(({ status, label, icon: Icon }) => {
          const items = byStatus[status] ?? [];
          if (items.length === 0) return null;
          return (
            <section key={status}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {label} <span className="text-gray-400 font-normal text-base">({items.length})</span>
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map(({ podcast }) => (
                  <Link
                    key={podcast.id}
                    href={`/podcast/${podcast.podcastIndexId ?? podcast.id}`}
                    className="flex gap-3 items-center p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    {podcast.imageUrl ? (
                      <Image
                        src={podcast.imageUrl}
                        alt={podcast.title}
                        width={56}
                        height={56}
                        className="rounded-lg object-cover flex-shrink-0"
                        unoptimized
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Headphones className="w-6 h-6 text-purple-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">{podcast.title}</p>
                      {podcast.author && (
                        <p className="text-sm text-gray-500 line-clamp-1">{podcast.author}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
