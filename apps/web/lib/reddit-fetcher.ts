export type RedditPost = {
  id: string;
  title: string;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  subreddit: string;
  permalink: string;
  created_utc: number;
};

export type RedditTrend = {
  id: string;
  phrase: string;
  originalTitle: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  subreddit: string;
  sourceUrl: string;
  observedAt: string;
  estimatedTemperature: "hot" | "warm" | "cold";
  estimatedScore: number;
};

const SUBREDDITS = [
  "mildlyinteresting",
  "interestingasfuck",
  "Showerthoughts",
  "funny",
  "todayilearned"
] as const;

type RedditListingResponse = {
  data?: {
    children?: Array<{
      data?: Partial<RedditPost>;
    }>;
  };
};

function trimAtWordBoundary(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;

  const truncated = value.slice(0, maxLength + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const boundary = lastSpace > 20 ? lastSpace : maxLength;

  return value.slice(0, boundary).trim();
}

function cleanTitle(title: string): string {
  const cleaned = title
    .replace(/^\s*\[[^\]]+\]\s*/g, "")
    .replace(/^\s*(TIL\s+that|TIL:|ELI5:)\s*/i, "")
    .trim();

  const trimmed = trimAtWordBoundary(cleaned, 60);
  if (!trimmed) return "Untitled Reddit trend";

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function isRedditPost(post: Partial<RedditPost>): post is RedditPost {
  return (
    typeof post.id === "string" &&
    typeof post.title === "string" &&
    typeof post.score === "number" &&
    typeof post.upvote_ratio === "number" &&
    typeof post.num_comments === "number" &&
    typeof post.subreddit === "string" &&
    typeof post.permalink === "string" &&
    typeof post.created_utc === "number"
  );
}

function estimateTemperature(score: number): RedditTrend["estimatedTemperature"] {
  if (score > 5000) return "hot";
  if (score > 1000) return "warm";
  return "cold";
}

async function fetchSubredditTrends(subreddit: string): Promise<RedditTrend[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/rising.json?limit=10`,
      {
        headers: {
          Accept: "application/json"
        },
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) return [];

    const json = (await response.json()) as RedditListingResponse;
    const posts =
      json.data?.children?.flatMap((child) => (child.data ? [child.data] : [])) ?? [];

    return posts
      .filter(isRedditPost)
      .filter((post) => post.score > 500)
      .map((post) => ({
        id: `reddit-${post.id}`,
        phrase: cleanTitle(post.title),
        originalTitle: post.title,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        numComments: post.num_comments,
        subreddit: post.subreddit,
        sourceUrl: `https://reddit.com${post.permalink}`,
        observedAt: new Date().toISOString(),
        estimatedTemperature: estimateTemperature(post.score),
        estimatedScore: Math.min(95, Math.round(post.score / 200))
      }));
  } catch {
    return [];
  }
}

export async function fetchRedditTrends(): Promise<RedditTrend[]> {
  const results = await Promise.all(
    SUBREDDITS.map((subreddit) => fetchSubredditTrends(subreddit))
  );

  return results.flat();
}
