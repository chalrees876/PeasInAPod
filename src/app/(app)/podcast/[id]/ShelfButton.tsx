"use client";

import { useState } from "react";
import { Headphones, Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "LISTENING", label: "Listening", icon: Headphones },
  { value: "WANT_TO_LISTEN", label: "Want to Listen", icon: Clock },
  { value: "FINISHED", label: "Finished", icon: CheckCircle },
  { value: "DROPPED", label: "Dropped", icon: XCircle },
] as const;

interface Props {
  podcastIndexId: string;
  title: string;
  author?: string;
  description?: string;
  imageUrl?: string;
  feedUrl?: string;
  initialStatus: string | null;
}

export default function ShelfButton({ podcastIndexId, title, author, description, imageUrl, feedUrl, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = OPTIONS.find((o) => o.value === status);
  const Icon = current?.icon ?? Headphones;

  async function select(value: string | null) {
    setOpen(false);
    setLoading(true);
    try {
      if (!value) {
        // Need DB podcast id — use the shelf DELETE with podcastIndexId param for now
        await fetch(`/api/shelf?podcastIndexId=${podcastIndexId}`, { method: "DELETE" });
        setStatus(null);
      } else {
        const res = await fetch("/api/shelf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ podcastIndexId, title, author, description, imageUrl, feedUrl, status: value }),
        });
        if (res.ok) setStatus(value);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          status
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
        }`}
      >
        <Icon className="w-4 h-4" />
        {current?.label ?? "Add to Shelf"}
        <ChevronDown className="w-3 h-3 ml-0.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
            {OPTIONS.map(({ value, label, icon: Opt }) => (
              <button
                key={value}
                onClick={() => select(value)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-purple-50 ${status === value ? "text-purple-700 font-medium" : "text-gray-700"}`}
              >
                <Opt className="w-4 h-4" />
                {label}
              </button>
            ))}
            {status && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => select(null)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  Remove from shelf
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
