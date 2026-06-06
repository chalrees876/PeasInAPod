import Link from "next/link";
import { Headphones, Compass, BookOpen, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Headphones className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Your podcast life,<br />
          <span className="text-purple-600">organized & shared.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-md mb-10">
          Track what you&apos;re listening to, discover new shows, and build your podcast shelf — like Goodreads, but for podcasts.
        </p>
        <div className="flex gap-4">
          <Link
            href="/discover"
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          >
            Browse Podcasts
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Compass,
              title: "Discover",
              desc: "Browse trending podcasts and search across 4 million shows from the open Podcast Index.",
            },
            {
              icon: BookOpen,
              title: "Track",
              desc: "Keep a shelf of what you're listening to, want to hear next, and what you've finished.",
            },
            {
              icon: Star,
              title: "Review",
              desc: "Rate and review your favourite shows so others know what's worth their time.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
