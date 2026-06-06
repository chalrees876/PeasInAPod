"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Headphones, BookmarkPlus, CheckCircle, Clock } from "lucide-react";
import type { PodcastIndexResult } from "@/lib/podcast-index";

const STATUS_OPTIONS = [
  { value: "LISTENING", label: "Listening", icon: Headphones },
  { value: "WANT_TO_LISTEN", label: "Want to Listen", icon: Clock },
  { value: "FINISHED", label: "Finished", icon: CheckCircle },
] as const;

interface Props {
  podcast: PodcastIndexResult;
  currentStatus?: string | null;
}

export default function PodcastCard({ podcast, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus ?? null);
  const [loading, setLoading] = useState(false);

  async function handleStatus(newStatus: string) {
    setLoading(true);
    try {
      if (status === newStatus) {
        // Remove from shelf
        const res = await fetch(`/api/shelf?podcastId=${podcast.id}`, { method: "DELETE" });
        if (res.ok) setStatus(null);
      } else {
        const res = await fetch("/api/shelf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            podcastIndexId: podcast.id,
            title: podcast.title,
            author: podcast.author,
            description: podcast.description,
            imageUrl: podcast.image,
            feedUrl: podcast.url,
            status: newStatus,
          }),
        });
        if (res.ok) setStatus(newStatus);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0">
          {podcast.image ? (
            <Image
              src={podcast.image}
              alt={podcast.title}
              width={80}
              height={80}
              className="rounded-lg object-cover"
              unoptimized
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-purple-100 flex items-center justify-center">
              <Headphones className="w-8 h-8 text-purple-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/podcast/${podcast.id}`}
            className="font-semibold text-gray-900 hover:text-purple-600 line-clamp-1 block"
          >
            {podcast.title}
          </Link>
          {podcast.author && (
            <p className="text-sm text-gray-500 mt-0.5">{podcast.author}</p>
          )}
          {podcast.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{podcast.description}</p>
          )}

          <div className="flex gap-2 mt-3 flex-wrap">
            {STATUS_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                disabled={loading}
                onClick={() => handleStatus(value)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  status === value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
