"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface Props {
  podcastIndexId: string;
  dbPodcastId: string | null;
  reviews: Review[];
  currentUserId: string | null;
}

function Stars({ value, onClick }: { value: number; onClick?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onClick?.(n)}
          className={onClick ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`w-5 h-5 ${n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ podcastIndexId, dbPodcastId, reviews: initialReviews, currentUserId }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const myReview = reviews.find((r) => r.user.id === currentUserId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Please select a rating.");
    if (!dbPodcastId) return setError("Add this podcast to your shelf first.");
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ podcastId: dbPodcastId, rating, body }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Failed to submit");
      // Refresh reviews optimistically
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-semibold text-gray-900 text-lg mb-4">
        Reviews <span className="text-gray-400 font-normal text-base">({reviews.length})</span>
      </h2>

      {currentUserId && !myReview && (
        <form onSubmit={submit} className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Write a review</p>
          <div className="mb-3">
            <Stars value={rating} onClick={setRating} />
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you think? (optional)"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {reviews.length === 0 && (
        <p className="text-gray-400 text-sm py-4">No reviews yet. Be the first!</p>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="flex gap-3">
            {r.user.image ? (
              <Image
                src={r.user.image}
                alt={r.user.name ?? "User"}
                width={36}
                height={36}
                className="rounded-full flex-shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-600 text-sm font-semibold">
                {r.user.name?.[0] ?? "?"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-gray-800">{r.user.name ?? "Anonymous"}</span>
                <Stars value={r.rating} />
              </div>
              {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
