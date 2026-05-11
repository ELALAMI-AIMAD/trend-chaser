import {
  BadgeCheck,
  CalendarDays,
  Flame,
  Gauge,
  LucideIcon,
  Radar,
  Sparkles,
  Store,
  Timer
} from "lucide-react";

// ─── Primitives ───────────────────────────────────────────────────────────────

export type Temperature = "hot" | "warm" | "cold";
export type Platform = "Amazon" | "Etsy" | "Redbubble";
export type TrendAction = "Test" | "Watch" | "Skip";
export type Urgency = "design now" | "coming soon" | "plan ahead";
export type SafetyVerdict = "safe" | "review" | "blocked";
export type ScanStatus = "queued" | "running" | "completed" | "failed";

// ─── KPI ──────────────────────────────────────────────────────────────────────

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  tone: "green" | "gold" | "cyan" | "pink";
  icon: LucideIcon;
};

// ─── Trend ────────────────────────────────────────────────────────────────────

export type PlatformMetric = {
  platform: Platform;
  demandScore: number;
  competitionScore: number;
  velocityScore: number;
  searchVolume: string;
  resultCount: string;
  searchUrl: string;
};

export type DesignPrompt = {
  id: string;
  style: string;
  prompt: string;
  keywords: string[];
};

export type TrendSignal = {
  id: string;
  phrase: string;
  niche: string;
  subcategory?: string;
  temperature: Temperature;
  score: number;
  momentum: number;
  competition: string;
  uploadWindow: string;
  action: TrendAction;
  source: string;
  platforms: Platform[];
  safetyVerdict: SafetyVerdict;
  safetyNotes?: string;
  aiSummary: string;
  platformMetrics: PlatformMetric[];
  designPrompts: DesignPrompt[];
  listingKeywords: string[];
  firstSeenAt: string;
  lastSeenAt: string;
};

// ─── Calendar ─────────────────────────────────────────────────────────────────

export type CalendarOpportunity = {
  id: string;
  title: string;
  date: string;
  eventDate: string;
  daysAway: number;
  urgency: Urgency;
  platform: Platform;
  uploadDeadline: string;
  subNiches: string[];
  designPrompt: string;
  listingKeywords: string[];
};

// ─── Platform snapshot ────────────────────────────────────────────────────────

export type PlatformSnapshot = {
  platform: Platform;
  signal: string;
  competition: string;
  action: string;
  score: number;
};

// ─── Watchlist ────────────────────────────────────────────────────────────────

export type WatchlistItem = {
  id: string;
  phrase: string;
  niche: string;
  temperature: Temperature;
  score: number;
  addedAt: string;
  notes?: string;
  platforms: Platform[];
};

// ─── Saved prompts ────────────────────────────────────────────────────────────

export type SavedPrompt = {
  id: string;
  phrase: string;
  style: string;
  prompt: string;
  keywords: string[];
  savedAt: string;
  source: "trend" | "calendar";
};

// ─── Scan runs ────────────────────────────────────────────────────────────────

export type ScanRun = {
  id: string;
  status: ScanStatus;
  startedAt: string;
  finishedAt?: string;
  durationSeconds?: number;
  sourcesChecked: number;
  trendsFound: number;
  error?: string;
};

// ─── Pipeline steps ───────────────────────────────────────────────────────────

export type PipelineStep = {
  label: string;
  detail: string;
  icon: LucideIcon;
};

// ─── KPI data ─────────────────────────────────────────────────────────────────

export const kpis: Kpi[] = [
  {
    label: "Hot trends",
    value: "18",
    delta: "+5 new",
    tone: "pink",
    icon: Flame
  },
  {
    label: "Calendar windows",
    value: "30",
    delta: "6 urgent",
    tone: "gold",
    icon: CalendarDays
  },
  {
    label: "Platforms tracked",
    value: "3",
    delta: "Amazon + Etsy + Redbubble",
    tone: "cyan",
    icon: Store
  },
  {
    label: "Scan streak",
    value: "13d",
    delta: "63 total runs",
    tone: "green",
    icon: BadgeCheck
  }
];

// ─── Trend signals ────────────────────────────────────────────────────────────

export const trendSignals: TrendSignal[] = [
  {
    id: "trend-001",
    phrase: "Living My Best Chaotic Life",
    niche: "Coffee lover",
    subcategory: "Humor / self-aware",
    temperature: "hot",
    score: 82,
    momentum: 74,
    competition: "Ultra niche",
    uploadWindow: "24h",
    action: "Test",
    source: "Search trend",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary:
      "High-velocity phrase targeting coffee-obsessed adults who lean into chaos as a personality. Ultra-niche competition window is open now. Best paired with messy-but-cute illustration style.",
    platformMetrics: [
      {
        platform: "Amazon",
        demandScore: 84,
        competitionScore: 12,
        velocityScore: 78,
        searchVolume: "High",
        resultCount: "< 200",
        searchUrl: "https://www.amazon.com/s?k=living+my+best+chaotic+life+shirt"
      },
      {
        platform: "Etsy",
        demandScore: 76,
        competitionScore: 18,
        velocityScore: 70,
        searchVolume: "Medium-high",
        resultCount: "< 150",
        searchUrl: "https://www.etsy.com/search?q=living+my+best+chaotic+life"
      },
      {
        platform: "Redbubble",
        demandScore: 62,
        competitionScore: 9,
        velocityScore: 55,
        searchVolume: "Medium",
        resultCount: "< 80",
        searchUrl: "https://www.redbubble.com/shop/living+my+best+chaotic+life"
      }
    ],
    designPrompts: [
      {
        id: "dp-001-a",
        style: "Bold retro",
        prompt:
          "Retro-style bold typography, wavy distressed letters spelling 'Living My Best Chaotic Life', surrounded by coffee cups, lightning bolts, and scattered stars. Dark background, orange and cream palette.",
        keywords: ["chaotic", "coffee lover", "retro shirt", "funny quote tee", "bold typography"]
      },
      {
        id: "dp-001-b",
        style: "Minimal line art",
        prompt:
          "Clean single-line illustration of a person juggling a coffee mug, a cat, and a to-do list, with 'Living My Best Chaotic Life' in a casual handwritten font below. White on black.",
        keywords: ["minimal line art", "chaotic life shirt", "funny mom tee", "coffee humor"]
      }
    ],
    listingKeywords: [
      "chaotic life shirt",
      "coffee lover gift",
      "funny sarcastic tee",
      "humor graphic shirt",
      "best chaotic life",
      "adulting shirt",
      "relatable quote tee"
    ],
    firstSeenAt: "2026-05-01",
    lastSeenAt: "2026-05-10"
  },
  {
    id: "trend-002",
    phrase: "Science Keeps Getting Weirder",
    niche: "Science humor",
    subcategory: "Geek / STEM",
    temperature: "hot",
    score: 78,
    momentum: 69,
    competition: "Ultra niche",
    uploadWindow: "24h",
    action: "Test",
    source: "Search trend",
    platforms: ["Amazon", "Etsy"],
    safetyVerdict: "safe",
    aiSummary:
      "Rising phrase among science communicators and STEM enthusiasts reacting to recent physics and biology discoveries. Low competition on both platforms. Strong gift potential.",
    platformMetrics: [
      {
        platform: "Amazon",
        demandScore: 80,
        competitionScore: 14,
        velocityScore: 72,
        searchVolume: "High",
        resultCount: "< 180",
        searchUrl: "https://www.amazon.com/s?k=science+keeps+getting+weirder+shirt"
      },
      {
        platform: "Etsy",
        demandScore: 71,
        competitionScore: 16,
        velocityScore: 65,
        searchVolume: "Medium",
        resultCount: "< 100",
        searchUrl: "https://www.etsy.com/search?q=science+keeps+getting+weirder"
      }
    ],
    designPrompts: [
      {
        id: "dp-002-a",
        style: "Retro science diagram",
        prompt:
          "Vintage scientific diagram style with illustrated atoms, DNA strands, and question marks surrounding the phrase 'Science Keeps Getting Weirder' in a technical stencil font. Teal and white on dark navy.",
        keywords: ["science humor", "STEM gift", "physics shirt", "geek tee", "science diagram"]
      }
    ],
    listingKeywords: [
      "science humor shirt",
      "STEM gift idea",
      "physics nerd tee",
      "funny science quote",
      "geek shirt",
      "biology humor",
      "science teacher gift"
    ],
    firstSeenAt: "2026-05-03",
    lastSeenAt: "2026-05-10"
  },
  {
    id: "trend-003",
    phrase: "History's Greatest Accidents",
    niche: "History humor",
    subcategory: "Trivia / intellectual",
    temperature: "warm",
    score: 64,
    momentum: 58,
    competition: "Low",
    uploadWindow: "3d",
    action: "Test",
    source: "Search trend",
    platforms: ["Amazon"],
    safetyVerdict: "safe",
    aiSummary:
      "Steady interest from history buffs and trivia lovers. Works as a gift for teachers and podcast listeners. No IP concerns. Upload window is comfortable.",
    platformMetrics: [
      {
        platform: "Amazon",
        demandScore: 65,
        competitionScore: 28,
        velocityScore: 55,
        searchVolume: "Medium",
        resultCount: "~450",
        searchUrl: "https://www.amazon.com/s?k=history+greatest+accidents+shirt"
      }
    ],
    designPrompts: [
      {
        id: "dp-003-a",
        style: "Newspaper clipping",
        prompt:
          "Faux vintage newspaper headline layout with 'History's Greatest Accidents' as the bold headline, surrounded by decorative borders and faux subtext in a broadsheet font. Aged sepia tones.",
        keywords: ["history humor", "history teacher gift", "trivia shirt", "vintage newspaper tee"]
      }
    ],
    listingKeywords: [
      "history humor shirt",
      "history teacher gift",
      "funny historical tee",
      "trivia lover shirt",
      "vintage newspaper design"
    ],
    firstSeenAt: "2026-04-28",
    lastSeenAt: "2026-05-09"
  },
  {
    id: "trend-004",
    phrase: "Living In The Weirdest Timeline",
    niche: "Internet culture",
    subcategory: "Gen Z / millennial",
    temperature: "warm",
    score: 61,
    momentum: 55,
    competition: "Low",
    uploadWindow: "3d",
    action: "Watch",
    source: "Search trend",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary:
      "Broad internet culture phrase with steady organic engagement. Watch it — if momentum increases in 48h it becomes a Test. Competition is low but the phrase is generic enough to attract copycats fast.",
    platformMetrics: [
      {
        platform: "Amazon",
        demandScore: 62,
        competitionScore: 32,
        velocityScore: 50,
        searchVolume: "Medium",
        resultCount: "~600",
        searchUrl: "https://www.amazon.com/s?k=weirdest+timeline+shirt"
      },
      {
        platform: "Etsy",
        demandScore: 58,
        competitionScore: 29,
        velocityScore: 48,
        searchVolume: "Medium",
        resultCount: "~400",
        searchUrl: "https://www.etsy.com/search?q=weirdest+timeline"
      },
      {
        platform: "Redbubble",
        demandScore: 50,
        competitionScore: 22,
        velocityScore: 44,
        searchVolume: "Low-medium",
        resultCount: "~250",
        searchUrl: "https://www.redbubble.com/shop/weirdest+timeline"
      }
    ],
    designPrompts: [
      {
        id: "dp-004-a",
        style: "Glitch / digital",
        prompt:
          "Digital glitch-style typography with 'Living In The Weirdest Timeline' fragmented across the design, surrounded by retro CRT scan lines and pixel artifacts. Purple, cyan, and white on black.",
        keywords: ["weirdest timeline", "internet culture shirt", "glitch design", "Gen Z tee"]
      }
    ],
    listingKeywords: [
      "weirdest timeline shirt",
      "internet culture tee",
      "Gen Z humor",
      "millennial shirt",
      "funny 2020s design",
      "dystopia shirt"
    ],
    firstSeenAt: "2026-05-02",
    lastSeenAt: "2026-05-10"
  },
  {
    id: "trend-005",
    phrase: "Nobody Expected This",
    niche: "Viral reaction",
    subcategory: "Meme",
    temperature: "cold",
    score: 38,
    momentum: 44,
    competition: "High",
    uploadWindow: "avoid",
    action: "Skip",
    source: "Search trend",
    platforms: ["Amazon", "Etsy"],
    safetyVerdict: "review",
    safetyNotes: "Generic phrase with high competition; possible brand association risk with meme account.",
    aiSummary:
      "Declining meme phrase now saturated on both Amazon and Etsy. Avoid uploading — the window has passed and competition is high. Flag for 6-month rescan.",
    platformMetrics: [
      {
        platform: "Amazon",
        demandScore: 35,
        competitionScore: 82,
        velocityScore: 28,
        searchVolume: "Medium",
        resultCount: "> 2,000",
        searchUrl: "https://www.amazon.com/s?k=nobody+expected+this+shirt"
      },
      {
        platform: "Etsy",
        demandScore: 32,
        competitionScore: 78,
        velocityScore: 25,
        searchVolume: "Medium",
        resultCount: "> 1,500",
        searchUrl: "https://www.etsy.com/search?q=nobody+expected+this"
      }
    ],
    designPrompts: [],
    listingKeywords: [],
    firstSeenAt: "2026-03-10",
    lastSeenAt: "2026-05-08"
  },
  {
    id: "trend-006",
    phrase: "Professional Plant Murderer",
    niche: "Plant lover",
    subcategory: "Self-deprecating humor",
    temperature: "hot",
    score: 80,
    momentum: 71,
    competition: "Low",
    uploadWindow: "24h",
    action: "Test",
    source: "Reddit trend",
    platforms: ["Amazon", "Etsy"],
    safetyVerdict: "safe",
    aiSummary:
      "Evergreen niche with seasonal spikes in spring. Plant humor is gift-purchase driven. Low competition on both platforms right now. Strong Mother's Day angle.",
    platformMetrics: [
      {
        platform: "Amazon",
        demandScore: 82,
        competitionScore: 20,
        velocityScore: 75,
        searchVolume: "High",
        resultCount: "< 300",
        searchUrl: "https://www.amazon.com/s?k=professional+plant+murderer+shirt"
      },
      {
        platform: "Etsy",
        demandScore: 78,
        competitionScore: 22,
        velocityScore: 68,
        searchVolume: "High",
        resultCount: "< 250",
        searchUrl: "https://www.etsy.com/search?q=professional+plant+murderer"
      }
    ],
    designPrompts: [
      {
        id: "dp-006-a",
        style: "Cute illustration",
        prompt:
          "Cute cartoon illustration of a wilted sad cactus with a small skull, surrounded by drooping leaves, with 'Professional Plant Murderer' in a friendly rounded font. Sage green and terracotta palette.",
        keywords: ["plant lover gift", "plant mom shirt", "funny gardening tee", "plant murderer"]
      }
    ],
    listingKeywords: [
      "plant murderer shirt",
      "plant lover gift",
      "funny gardening tee",
      "plant mom shirt",
      "succulent humor",
      "Mother's Day plant gift"
    ],
    firstSeenAt: "2026-05-05",
    lastSeenAt: "2026-05-10"
  }
];

// ─── Calendar opportunities ───────────────────────────────────────────────────

export const calendarOpportunities: CalendarOpportunity[] = [
  {
    id: "cal-001",
    title: "Graduation Season",
    date: "Jun 1",
    eventDate: "2026-06-01",
    daysAway: 22,
    urgency: "design now",
    platform: "Amazon",
    uploadDeadline: "May 18",
    subNiches: ["Class of 2026", "First generation grad", "MBA graduate", "Nursing school grad"],
    designPrompt:
      "Celebratory graduation cap design with 'Class of 2026' in bold collegiate lettering, surrounded by confetti and diploma scrolls. Navy and gold palette, premium feel.",
    listingKeywords: ["graduation gift 2026", "class of 2026 shirt", "grad gift idea", "college graduation tee"]
  },
  {
    id: "cal-002",
    title: "Pride Month",
    date: "Jun 1",
    eventDate: "2026-06-01",
    daysAway: 22,
    urgency: "design now",
    platform: "Etsy",
    uploadDeadline: "May 20",
    subNiches: ["Ally shirt", "Rainbow pride", "Bi pride", "Trans pride", "Queer joy"],
    designPrompt:
      "Bold rainbow gradient typography with 'Love Is Love' in a confident sans-serif. Geometric rainbow flag accent. Vibrant and celebratory, suitable for all ages.",
    listingKeywords: ["pride shirt", "LGBTQ gift", "rainbow tee", "pride month shirt", "love is love"]
  },
  {
    id: "cal-003",
    title: "World Bicycle Day",
    date: "Jun 3",
    eventDate: "2026-06-03",
    daysAway: 24,
    urgency: "design now",
    platform: "Redbubble",
    uploadDeadline: "May 22",
    subNiches: ["Road cycling", "Mountain biking", "Casual cycling", "Cyclist humor"],
    designPrompt:
      "Minimalist line-art bicycle silhouette with 'Life Is Better On Two Wheels' in a clean technical font. Black on white or white on slate.",
    listingKeywords: ["cycling shirt", "bicycle gift", "cyclist tee", "bike lover shirt", "World Bicycle Day"]
  },
  {
    id: "cal-004",
    title: "Father's Day",
    date: "Jun 15",
    eventDate: "2026-06-15",
    daysAway: 36,
    urgency: "coming soon",
    platform: "Amazon",
    uploadDeadline: "Jun 1",
    subNiches: ["Dad jokes", "Grill dad", "Sports dad", "New dad", "Dog dad"],
    designPrompt:
      "Retro vintage badge design with 'World's Okayest Dad' in a worn western font, surrounded by stars and laurel wreath. Distressed dark teal and cream palette.",
    listingKeywords: ["Father's Day gift", "dad shirt", "funny dad tee", "gift for dad", "dad joke shirt"]
  },
  {
    id: "cal-005",
    title: "Independence Day",
    date: "Jul 4",
    eventDate: "2026-07-04",
    daysAway: 55,
    urgency: "plan ahead",
    platform: "Etsy",
    uploadDeadline: "Jun 20",
    subNiches: ["Patriotic", "Americana", "Fireworks", "Fourth of July BBQ"],
    designPrompt:
      "Vintage Americana eagle design with stars and stripes, 'Land of the Free' in a bold serif. Red, white, and navy distressed palette.",
    listingKeywords: ["4th of July shirt", "patriotic tee", "Independence Day gift", "American flag shirt"]
  },
  {
    id: "cal-006",
    title: "Back to School",
    date: "Aug 15",
    eventDate: "2026-08-15",
    daysAway: 97,
    urgency: "plan ahead",
    platform: "Amazon",
    uploadDeadline: "Aug 1",
    subNiches: ["Teacher gift", "First day of school", "School supplies humor", "Mom survived summer"],
    designPrompt:
      "Playful chalkboard-style design with 'Survived Another Summer' in hand-lettered chalk script, surrounded by school supply doodles. Black board, white chalk, yellow accents.",
    listingKeywords: ["back to school shirt", "teacher gift", "first day of school tee", "school shirt"]
  }
];

// ─── Platform snapshots ───────────────────────────────────────────────────────

export const platformSnapshots: PlatformSnapshot[] = [
  {
    platform: "Amazon",
    signal: "Best for fast test uploads",
    competition: "Mixed",
    action: "Prioritize ultra-niche phrases",
    score: 72
  },
  {
    platform: "Etsy",
    signal: "Best for calendar-led designs",
    competition: "Unknown in current report",
    action: "Add Open API checks",
    score: 58
  },
  {
    platform: "Redbubble",
    signal: "New platform gap",
    competition: "Not yet measured",
    action: "Build collector and scoring",
    score: 45
  }
];

// ─── Watchlist seed ───────────────────────────────────────────────────────────

export const watchlistItems: WatchlistItem[] = [
  {
    id: "wl-001",
    phrase: "Science Keeps Getting Weirder",
    niche: "Science humor",
    temperature: "hot",
    score: 78,
    addedAt: "2026-05-08",
    notes: "Check Amazon BSR in 48h. Potential teacher gift angle.",
    platforms: ["Amazon", "Etsy"]
  },
  {
    id: "wl-002",
    phrase: "Professional Plant Murderer",
    niche: "Plant lover",
    temperature: "hot",
    score: 80,
    addedAt: "2026-05-09",
    notes: "Strong Mother's Day hook. Upload by May 18.",
    platforms: ["Amazon", "Etsy"]
  },
  {
    id: "wl-003",
    phrase: "Living In The Weirdest Timeline",
    niche: "Internet culture",
    temperature: "warm",
    score: 61,
    addedAt: "2026-05-07",
    platforms: ["Amazon", "Etsy", "Redbubble"]
  }
];

// ─── Saved prompts seed ───────────────────────────────────────────────────────

export const savedPrompts: SavedPrompt[] = [
  {
    id: "sp-001",
    phrase: "Living My Best Chaotic Life",
    style: "Bold retro",
    prompt:
      "Retro-style bold typography, wavy distressed letters spelling 'Living My Best Chaotic Life', surrounded by coffee cups, lightning bolts, and scattered stars. Dark background, orange and cream palette.",
    keywords: ["chaotic", "coffee lover", "retro shirt", "funny quote tee", "bold typography"],
    savedAt: "2026-05-09",
    source: "trend"
  },
  {
    id: "sp-002",
    phrase: "Graduation Season",
    style: "Collegiate",
    prompt:
      "Celebratory graduation cap design with 'Class of 2026' in bold collegiate lettering, surrounded by confetti and diploma scrolls. Navy and gold palette, premium feel.",
    keywords: ["graduation gift 2026", "class of 2026 shirt", "grad gift idea", "college graduation tee"],
    savedAt: "2026-05-08",
    source: "calendar"
  }
];

// ─── Scan runs seed ───────────────────────────────────────────────────────────

export const scanRuns: ScanRun[] = [
  {
    id: "run-001",
    status: "completed",
    startedAt: "2026-05-10T00:49:00Z",
    finishedAt: "2026-05-10T01:12:00Z",
    durationSeconds: 1380,
    sourcesChecked: 6,
    trendsFound: 18
  },
  {
    id: "run-002",
    status: "completed",
    startedAt: "2026-05-09T00:51:00Z",
    finishedAt: "2026-05-09T01:08:00Z",
    durationSeconds: 1020,
    sourcesChecked: 6,
    trendsFound: 15
  },
  {
    id: "run-003",
    status: "completed",
    startedAt: "2026-05-08T00:49:00Z",
    finishedAt: "2026-05-08T01:15:00Z",
    durationSeconds: 1560,
    sourcesChecked: 5,
    trendsFound: 14
  },
  {
    id: "run-004",
    status: "failed",
    startedAt: "2026-05-07T00:50:00Z",
    finishedAt: "2026-05-07T00:52:00Z",
    durationSeconds: 120,
    sourcesChecked: 2,
    trendsFound: 0,
    error: "Reddit API rate limit exceeded at source 2. Retried 3× — dead-lettered."
  },
  {
    id: "run-005",
    status: "completed",
    startedAt: "2026-05-06T00:48:00Z",
    finishedAt: "2026-05-06T01:10:00Z",
    durationSeconds: 1320,
    sourcesChecked: 6,
    trendsFound: 16
  }
];

// ─── Pipeline steps ───────────────────────────────────────────────────────────

export const pipelineSteps: PipelineStep[] = [
  { label: "Collect", detail: "Reddit, Google Trends, Etsy, Amazon, Redbubble", icon: Radar },
  { label: "Score", detail: "Momentum, demand, competition, urgency", icon: Gauge },
  { label: "Generate", detail: "Claude prompts, phrase variants, listing angles", icon: Sparkles },
  { label: "Schedule", detail: "Daily scan with retries and dead-letter logging", icon: Timer }
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getTrendById(id: string): TrendSignal | undefined {
  return trendSignals.find((t) => t.id === id);
}

export function getCalendarEventById(id: string): CalendarOpportunity | undefined {
  return calendarOpportunities.find((e) => e.id === id);
}
