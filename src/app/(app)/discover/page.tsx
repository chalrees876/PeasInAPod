import SearchBar from "@/components/ui/SearchBar";
import PodcastCard from "@/components/podcast/PodcastCard";
import { searchPodcasts, getTrending } from "@/lib/podcast-index";

const CATEGORIES = ["Technology", "True Crime", "Comedy", "News", "Education", "Health", "Business", "Science"];

interface Props {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default async function DiscoverPage({ searchParams }: Props) {
  const { q, cat } = await searchParams;

  let podcasts: import("@/lib/podcast-index").PodcastIndexResult[] = [];
  let heading = "Trending";

  try {
    if (q) {
      podcasts = await searchPodcasts(q, 20);
      heading = `Results for "${q}"`;
    } else {
      podcasts = await getTrending(20, cat);
      heading = cat ? `Trending in ${cat}` : "Trending Now";
    }
  } catch {
    // API key not configured yet — show empty state
  }

  return (
    <div>
      <div className="mb-6">
        <SearchBar defaultValue={q ?? ""} />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        <a
          href="/discover"
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!cat && !q ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-400"}`}
        >
          All
        </a>
        {CATEGORIES.map((c) => (
          <a
            key={c}
            href={`/discover?cat=${encodeURIComponent(c)}`}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${cat === c ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-400"}`}
          >
            {c}
          </a>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">{heading}</h2>

      {podcasts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No podcasts found</p>
          <p className="text-sm">
            {!process.env.PODCAST_INDEX_API_KEY
              ? "Add your Podcast Index API key to .env to start searching."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {podcasts.map((p) => (
            <PodcastCard key={p.id} podcast={p} />
          ))}
        </div>
      )}
    </div>
  );
}
