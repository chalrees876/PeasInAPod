import crypto from "crypto";

const API_KEY = process.env.PODCAST_INDEX_API_KEY ?? "";
const API_SECRET = process.env.PODCAST_INDEX_API_SECRET ?? "";
const BASE_URL = "https://api.podcastindex.org/api/1.0";

function getHeaders() {
  const epoch = Math.floor(Date.now() / 1000);
  const hash = crypto
    .createHash("sha1")
    .update(API_KEY + API_SECRET + epoch)
    .digest("hex");

  return {
    "X-Auth-Date": String(epoch),
    "X-Auth-Key": API_KEY,
    Authorization: hash,
    "User-Agent": "PeasInAPod/1.0",
  };
}

export interface PodcastIndexResult {
  id: number;
  title: string;
  author: string;
  description: string;
  image: string;
  url: string;
  link: string;
  categories?: Record<string, string>;
  language?: string;
}

export async function searchPodcasts(query: string, max = 20) {
  const res = await fetch(
    `${BASE_URL}/search/byterm?q=${encodeURIComponent(query)}&max=${max}&fulltext`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error("Podcast Index search failed");
  const data = await res.json();
  return (data.feeds ?? []) as PodcastIndexResult[];
}

export async function getTrending(max = 20, cat?: string) {
  const catParam = cat ? `&cat=${encodeURIComponent(cat)}` : "";
  const res = await fetch(
    `${BASE_URL}/podcasts/trending?max=${max}&lang=en${catParam}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error("Podcast Index trending failed");
  const data = await res.json();
  return (data.feeds ?? []) as PodcastIndexResult[];
}

export async function getPodcastById(id: string) {
  const res = await fetch(`${BASE_URL}/podcasts/byfeedid?id=${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Podcast Index lookup failed");
  const data = await res.json();
  return data.feed as PodcastIndexResult | null;
}
