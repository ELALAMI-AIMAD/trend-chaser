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

export type AiPlatform = "amazon" | "etsy" | "redbubble";

export type TrendScoreBreakdown = {
  total: number;
  temperature: Temperature;
  demand: number;
  competition: number;
  velocity: number;
  timing: number;
  platformFit: number;
  ipSafety: number;
  confidence: number;
};

export type PlatformCompetition = {
  competition: "low" | "medium" | "high";
  label: "Low" | "Medium" | "High";
};

export type AwarenessDesignPrompt = {
  title: string;
  prompt: string;
  platformFit: AiPlatform[];
  styleTags: string[];
};

export type PhraseVariation = {
  phrase: string;
  angle: string;
  risk: "low" | "medium" | "high";
};

export type TrendAiInsight = {
  whyNow: string;
  targetBuyer: string;
  designStyle: string;
  safetyVerdict: SafetyVerdict;
  safetyNotes: string[];
  phraseVariations: PhraseVariation[];
  designPrompts: AwarenessDesignPrompt[];
  listingKeywords: string[];
  platformNotes: Record<AiPlatform, string>;
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
  scoreBreakdown?: TrendScoreBreakdown;
  platformCompetition?: Record<AiPlatform, PlatformCompetition>;
  ai?: TrendAiInsight;
  sources?: number;
  awarenessId?: string;
  sourceType?: "seed" | "reddit";
  isLive?: boolean;
  sourceUrl?: string;
  observedAt?: string;
};

export type AwarenessNiche = {
  id: string;
  name: string;
  month: string;
  monthNumber: number;
  ribbon: string;
  color: string;
  phraseAngles: string[];
  platforms: AiPlatform[];
  designStyle: string;
  daysUntilPeak: number;
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

const platformLabels = {
  low: { competition: "low", label: "Low" },
  medium: { competition: "medium", label: "Medium" },
  high: { competition: "high", label: "High" }
} satisfies Record<string, PlatformCompetition>;

function metric(platform: Platform, phrase: string, demandScore: number, competitionScore: number, velocityScore: number): PlatformMetric {
  const host =
    platform === "Amazon"
      ? "https://www.amazon.com/s?k="
      : platform === "Etsy"
        ? "https://www.etsy.com/search?q="
        : "https://www.redbubble.com/shop/";

  return {
    platform,
    demandScore,
    competitionScore,
    velocityScore,
    searchVolume: demandScore >= 80 ? "High" : "Medium-high",
    resultCount: competitionScore <= 25 ? "< 300" : competitionScore <= 45 ? "~600" : "> 1,000",
    searchUrl: `${host}${encodeURIComponent(`${phrase} shirt`).replace(/%20/g, "+")}`
  };
}

function dashboardPrompts(prefix: string, prompts: AwarenessDesignPrompt[]): DesignPrompt[] {
  return prompts.map((prompt, index) => ({
    id: `${prefix}-${String.fromCharCode(97 + index)}`,
    style: prompt.title,
    prompt: prompt.prompt,
    keywords: prompt.styleTags
  }));
}

const awarenessAi = {
  mentalHealth: {
    whyNow:
      "Mental Health Awareness Month drives massive search volume every May. Semicolon and supportive messaging performs strongly.",
    targetBuyer: "People in recovery, therapists, mental health advocates aged 20-45.",
    designStyle: "Botanical Floral Minimal",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Semicolon Warrior", angle: "Recovery symbol", risk: "low" },
      { phrase: "Mental Health Matters", angle: "Awareness statement", risk: "low" },
      { phrase: "And Still I Rise", angle: "Resilience", risk: "low" }
    ],
    designPrompts: [
      {
        title: "Botanical Semicolon",
        prompt:
          "Graphic design - exquisite botanical illustration: large semicolon symbol formed organically from a single wildflower stem, the dot being the flower bloom, surrounded by delicate hand-drawn botanical wreath of ferns and small blossoms, 'IT'S OK NOT TO BE OK' in delicate pointed-pen calligraphy below, sage green and cream palette on black, flat graphic artwork only, NO t-shirt mockup, NO clothing, NO mannequin, solid black background, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["botanical", "minimal", "floral"]
      },
      {
        title: "Bold Empowerment",
        prompt:
          "Graphic design - bold empowerment typographic poster: 'IT'S OK TO NOT BE OK' in massive rounded display lettering occupying 70% of design, single painted watercolor wash of soft lavender behind the text block, 'AND IT'S OK TO ASK FOR HELP' in small refined caps at bottom, muted and powerful on black, flat graphic artwork only, NO t-shirt mockup, solid black background, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["bold", "typography", "empowerment"]
      },
      {
        title: "Minimalist Line Art",
        prompt:
          "Graphic design - sophisticated minimal: single thin semicolon drawn with precise weight, beneath it 'MENTAL HEALTH MATTERS' in four lines of refined small-caps serif text, strict geometric composition, white and lavender on black, flat graphic artwork only, NO mockup, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["minimal", "clean", "serif"]
      },
      {
        title: "Wildflower Garden",
        prompt:
          "Graphic design - delicate wildflower illustration: semicolon hidden within a loose bouquet of hand-drawn wildflowers and stems, 'your story isn't over' in flowing script below, watercolor-style palette of dusty rose sage and cream on black, flat graphic artwork only, NO mockup, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["floral", "watercolor", "delicate"]
      },
      {
        title: "Retro Support",
        prompt:
          "Graphic design - retro 70s style: 'MIND MATTERS' in groovy rounded bold type, brain illustration rendered as a flower with petals, warm mustard and terracotta palette on black, flat graphic artwork only, NO t-shirt mockup, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["retro", "groovy", "warm"]
      }
    ],
    listingKeywords: [
      "mental health shirt",
      "semicolon shirt",
      "mental health awareness",
      "it's ok not to be ok",
      "mental health gift",
      "therapist shirt",
      "mental health warrior",
      "anxiety shirt",
      "depression awareness",
      "mental health month"
    ],
    platformNotes: {
      amazon: "Strong performer in May. Use 'mental health awareness' in title.",
      etsy: "Gift buyers strong. Add 'gift for therapist' and 'mental health gift' tags.",
      redbubble: "Sticker format performs well. Upload as sticker pack too."
    }
  },
  breastCancer: {
    whyNow:
      "October brings a predictable spike for pink ribbon designs, survivor gifts, fundraising walks, and support-team apparel.",
    targetBuyer: "Breast cancer survivors, family supporters, charity walk teams, nurses, and oncology gift buyers.",
    designStyle: "Bold Pink Ribbon",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Pink Ribbon Strong", angle: "Ribbon identity", risk: "low" },
      { phrase: "Warrior Not Worrier", angle: "Survivor strength", risk: "low" },
      { phrase: "Stronger Than Cancer", angle: "Support statement", risk: "low" }
    ],
    designPrompts: [
      {
        title: "Pink Ribbon Shield",
        prompt:
          "Graphic design - bold pink ribbon shield emblem with 'FIGHT LIKE A GIRL' in strong athletic lettering and 'BREAST CANCER WARRIOR' in clean caps below, layered ribbon highlights, black background, flat vector artwork only, NO mockup, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["pink-ribbon", "bold", "survivor"]
      },
      {
        title: "Floral Survivor Ribbon",
        prompt:
          "Graphic design - elegant pink ribbon woven through peonies and rose leaves, 'PINK RIBBON STRONG' in graceful serif typography, blush pink white and deep rose on black, flat graphic artwork only, NO clothing mockup, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["floral", "elegant", "ribbon"]
      },
      {
        title: "Warrior Not Worrier",
        prompt:
          "Graphic design - empowering typographic layout: 'WARRIOR NOT WORRIER' in stacked bold block letters, small pink ribbon replacing the letter I, distressed athletic texture, hot pink and white on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["typography", "athletic", "empowerment"]
      },
      {
        title: "Cancer Support Team",
        prompt:
          "Graphic design - supportive walk-team badge with pink ribbon, stars, and laurel branches, 'NO ONE FIGHTS ALONE' in vintage badge typography, soft pink cream and charcoal palette, flat design only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["team", "badge", "fundraiser"]
      },
      {
        title: "Minimal Pink Line",
        prompt:
          "Graphic design - minimalist single-line pink ribbon with tiny heart at the crossing point, 'STRONGER THAN CANCER' in refined small-caps serif below, lots of negative space, pink and white on black, flat artwork only, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["minimal", "clean", "support"]
      }
    ],
    listingKeywords: [
      "breast cancer shirt",
      "pink ribbon shirt",
      "cancer warrior shirt",
      "breast cancer awareness",
      "fight like a girl shirt",
      "cancer survivor gift",
      "pink october shirt",
      "breast cancer gift",
      "warrior shirt",
      "cancer support shirt"
    ],
    platformNotes: {
      amazon: "Peak in October; use clear pink ribbon and survivor keywords.",
      etsy: "Personalized survivor and support-team wording can lift conversion.",
      redbubble: "Sticker and walk-team graphics work well with bold ribbon shapes."
    }
  },
  autism: {
    whyNow:
      "April search interest rises around Autism Awareness and Acceptance Month, especially for parent identity and neurodiversity designs.",
    targetBuyer: "Autism parents, educators, therapists, neurodivergent adults, and acceptance advocates.",
    designStyle: "Colorful Puzzle Piece Modern",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Autism Dad - My Kid Fights Harder", angle: "Parent pride", risk: "low" },
      { phrase: "Autism Mom Strong", angle: "Parent identity", risk: "low" },
      { phrase: "See The World Differently", angle: "Neurodiversity", risk: "low" }
    ],
    designPrompts: [
      {
        title: "Different Not Less",
        prompt:
          "Graphic design - modern colorful puzzle-piece mosaic forming a heart, 'DIFFERENT NOT LESS' in clean rounded type, bright blue red yellow and teal accents on black, flat graphic artwork only, NO mockup, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["colorful", "puzzle", "acceptance"]
      },
      {
        title: "Autism Mom Strong",
        prompt:
          "Graphic design - bold parent pride typography reading 'AUTISM MOM STRONG' with colorful infinity symbol and subtle puzzle accents, modern sans-serif lettering, vibrant palette on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["mom", "bold", "neurodiversity"]
      },
      {
        title: "Autism Dad Badge",
        prompt:
          "Graphic design - clean badge emblem with 'AUTISM DAD' and 'MY KID FIGHTS HARDER', star accents, modern athletic type, blue and white with rainbow detail on black, flat design only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["dad", "badge", "family"]
      },
      {
        title: "Spectrum Infinity",
        prompt:
          "Graphic design - elegant rainbow infinity symbol made from smooth ribbon strokes, 'SEE THE WORLD DIFFERENTLY' in refined geometric caps below, black background, flat vector artwork only, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["infinity", "minimal", "rainbow"]
      },
      {
        title: "Acceptance Rainbow",
        prompt:
          "Graphic design - uplifting retro rainbow arch with small stars and puzzle-piece confetti, 'AUTISM ACCEPTANCE' in friendly rounded lettering, bright joyful colors on black, flat graphic artwork only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["retro", "rainbow", "joyful"]
      }
    ],
    listingKeywords: [
      "autism shirt",
      "autism awareness shirt",
      "autism mom shirt",
      "autism dad shirt",
      "different not less shirt",
      "autism gift",
      "autism awareness month",
      "autism acceptance",
      "autism spectrum shirt",
      "neurodivergent shirt"
    ],
    platformNotes: {
      amazon: "Parent identity phrases perform strongly during April.",
      etsy: "Add autism acceptance, mom, dad, and teacher tags.",
      redbubble: "Infinity and rainbow sticker designs are a strong fit."
    }
  },
  nurse: {
    whyNow:
      "National Nurses Week in May creates reliable gifting demand for nurse appreciation, graduation, and unit-specific designs.",
    targetBuyer: "Registered nurses, nursing students, ICU nurses, hospital teams, and nurse gift buyers.",
    designStyle: "Clean Medical Professional",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Nurse Life - Saving Lives Daily", angle: "Professional pride", risk: "low" },
      { phrase: "ICU Nurse Strong", angle: "Unit-specific", risk: "low" },
      { phrase: "Fueled By Coffee And Compassion", angle: "Giftable humor", risk: "low" }
    ],
    designPrompts: [
      {
        title: "Work Of Heart",
        prompt:
          "Graphic design - clean medical typography: 'NURSING IS A WORK OF HEART' with stethoscope line forming a heart, teal white and soft red on black, professional flat artwork only, NO mockup, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["medical", "clean", "heart"]
      },
      {
        title: "ICU Nurse Strong",
        prompt:
          "Graphic design - bold ICU badge with heartbeat line, small cross, and 'ICU NURSE STRONG' in confident condensed lettering, teal and white on black, flat vector artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["icu", "badge", "bold"]
      },
      {
        title: "Coffee Compassion",
        prompt:
          "Graphic design - cute coffee cup wearing a tiny nurse cap with 'FUELED BY COFFEE AND COMPASSION' in warm rounded lettering, teal cream and coffee brown palette on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["coffee", "cute", "gift"]
      },
      {
        title: "Nurse Life Script",
        prompt:
          "Graphic design - elegant hand-lettered 'NURSE LIFE' with small syringe, stars, and heartbeat accents, clean white and teal on black, modern script composition, flat artwork only, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["script", "nurse-life", "minimal"]
      },
      {
        title: "Saving Lives Daily",
        prompt:
          "Graphic design - heroic but clean typographic poster reading 'SAVING LIVES DAILY' with subtle hospital cross and pulse line, strong sans-serif, teal white and red on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["professional", "heroic", "healthcare"]
      }
    ],
    listingKeywords: [
      "nurse shirt",
      "nurse life shirt",
      "nursing shirt",
      "nurse gift",
      "rn shirt",
      "registered nurse shirt",
      "nursing school shirt",
      "nurse appreciation",
      "healthcare worker shirt",
      "icu nurse shirt"
    ],
    platformNotes: {
      amazon: "Use nurse appreciation and RN keywords around Nurses Week.",
      etsy: "Gift positioning and unit-specific tags are important.",
      redbubble: "Cute medical stickers can reuse the same design language."
    }
  },
  teacher: {
    whyNow:
      "Teacher designs peak around Teacher Appreciation Week, back-to-school, and September classroom season.",
    targetBuyer: "Teachers, school staff, parents buying teacher gifts, and education teams.",
    designStyle: "Bold Collegiate Fun",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Fueled By Coffee And Dry Erase Markers", angle: "Teacher humor", risk: "low" },
      { phrase: "World's Okayest Teacher", angle: "Self-aware gift", risk: "low" },
      { phrase: "Teaching Future Leaders", angle: "Inspirational", risk: "low" }
    ],
    designPrompts: [
      {
        title: "Teacher Superpower",
        prompt:
          "Graphic design - bold collegiate layout reading 'TEACHING IS MY SUPERPOWER' with lightning bolt, pencil, and star icons, royal blue yellow and white on black, flat graphic artwork only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["collegiate", "bold", "teacher"]
      },
      {
        title: "Coffee Dry Erase",
        prompt:
          "Graphic design - playful coffee cup and dry erase marker crossed like tools, 'FUELED BY COFFEE AND DRY ERASE MARKERS' in hand-lettered chalk style, cream yellow and teal on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["coffee", "chalk", "funny"]
      },
      {
        title: "Okayest Teacher",
        prompt:
          "Graphic design - retro badge with apple icon and 'WORLD'S OKAYEST TEACHER' in distressed varsity lettering, red cream and gold on black, flat design only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["retro", "apple", "humor"]
      },
      {
        title: "Future Leaders",
        prompt:
          "Graphic design - inspiring classroom poster style: 'TEACHING FUTURE LEADERS' with pencil sunburst and small stars, clean serif and sans type mix, gold white and navy on black, flat artwork only, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["inspirational", "classroom", "clean"]
      },
      {
        title: "Back To School Varsity",
        prompt:
          "Graphic design - bold varsity teacher design with stacked text 'TEACHER VIBES' and small books, apple, and ruler icons, yellow red and cream on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["varsity", "school", "seasonal"]
      }
    ],
    listingKeywords: [
      "teacher shirt",
      "teacher life shirt",
      "teacher gift",
      "teaching shirt",
      "elementary teacher",
      "teacher appreciation",
      "back to school shirt",
      "teacher vibes",
      "best teacher shirt",
      "teacher superpower"
    ],
    platformNotes: {
      amazon: "Back-to-school and teacher appreciation titles work best.",
      etsy: "Giftable wording and grade-level tags can improve discovery.",
      redbubble: "Sticker and classroom laptop designs can reuse the same prompts."
    }
  },
  dogMom: {
    whyNow:
      "Dog owner identity is evergreen with seasonal lifts around National Pet Month, Dog Mom Day, and National Dog Day.",
    targetBuyer: "Dog moms, rescue adopters, dog dads, pet gift buyers, and animal shelter supporters.",
    designStyle: "Cute Cartoon Mascot",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Rescue Dog Mom", angle: "Rescue identity", risk: "low" },
      { phrase: "My Dog Is My Therapist", angle: "Emotional support humor", risk: "low" },
      { phrase: "Dog Mom Life Is The Best Life", angle: "Lifestyle", risk: "low" }
    ],
    designPrompts: [
      {
        title: "Kids Have Paws",
        prompt:
          "Graphic design - cute cartoon dog face with paw-print hearts and 'DOG MOM - MY KIDS HAVE PAWS' in friendly rounded type, orange cream and white on black, flat artwork only, NO mockup, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["cute", "cartoon", "dog-mom"]
      },
      {
        title: "Rescue Dog Mom",
        prompt:
          "Graphic design - rescue dog silhouette with small heart tag, 'RESCUE DOG MOM' in warm hand-lettered script and block type, soft orange and cream on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["rescue", "heart", "pet"]
      },
      {
        title: "Dog Therapist",
        prompt:
          "Graphic design - playful dog wearing tiny glasses beside a couch, 'MY DOG IS MY THERAPIST' in cute retro lettering, teal orange and cream on black, flat graphic artwork only, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["humor", "cartoon", "therapy"]
      },
      {
        title: "Paw Print Minimal",
        prompt:
          "Graphic design - clean paw print wreath with tiny hearts, 'DOG MOM LIFE' in refined sans-serif lettering, white and burnt orange on black, minimal flat artwork only, ar 4:5",
        platformFit: ["amazon", "redbubble"],
        styleTags: ["minimal", "paw-print", "clean"]
      },
      {
        title: "Best Life Badge",
        prompt:
          "Graphic design - retro badge with dog bone, paw prints, and 'DOG MOM LIFE IS THE BEST LIFE' in groovy 70s lettering, orange mustard and cream on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["retro", "badge", "warm"]
      }
    ],
    listingKeywords: [
      "dog mom shirt",
      "dog lover shirt",
      "dog mom gift",
      "fur mama shirt",
      "dog owner shirt",
      "rescue dog shirt",
      "dog mom life shirt",
      "crazy dog lady",
      "dog mama shirt",
      "paw print shirt"
    ],
    platformNotes: {
      amazon: "Evergreen dog mom terms are high demand but need niche styling.",
      etsy: "Rescue and personalized dog breed tags can help conversion.",
      redbubble: "Paw-print stickers and cartoon dog assets translate well."
    }
  },
  veterans: {
    whyNow:
      "Veterans Day and Veterans Awareness Month create November demand for patriotic, military-family, and service-pride apparel.",
    targetBuyer: "Veterans, military families, patriotic gift buyers, and service organizations.",
    designStyle: "Bold American Patriotic",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Home Of The Brave", angle: "Patriotic pride", risk: "low" },
      { phrase: "Veteran - Served With Honor", angle: "Service pride", risk: "low" },
      { phrase: "Military Family Strong", angle: "Family support", risk: "low" }
    ],
    designPrompts: [
      {
        title: "Veteran Proud",
        prompt:
          "Graphic design - bold patriotic eagle badge with 'VETERAN PROUD' and 'FREEDOM ISN'T FREE' in strong serif lettering, stars and subtle flag stripes, red white and blue on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["patriotic", "eagle", "bold"]
      },
      {
        title: "Served With Honor",
        prompt:
          "Graphic design - clean military-style emblem with folded flag shape, stars, and 'SERVED WITH HONOR' in disciplined block type, navy cream and red on black, flat vector artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["military", "honor", "emblem"]
      },
      {
        title: "Home Of The Brave",
        prompt:
          "Graphic design - vintage Americana typography reading 'HOME OF THE BRAVE' with distressed stars, flag wave, and laurel branches, red cream and navy on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["americana", "vintage", "typography"]
      },
      {
        title: "Military Family Strong",
        prompt:
          "Graphic design - supportive family badge with star, small heart, and 'MILITARY FAMILY STRONG' in clean sans-serif type, red white blue and gold accents on black, flat artwork only, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["family", "support", "badge"]
      },
      {
        title: "Freedom Shield",
        prompt:
          "Graphic design - patriotic shield with eagle wings and bold text 'FREEDOM ISN'T FREE', distressed texture, strong contrast red white and blue on black, flat graphic artwork only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["shield", "freedom", "distressed"]
      }
    ],
    listingKeywords: [
      "veteran shirt",
      "military shirt",
      "veteran gift",
      "army shirt",
      "navy shirt",
      "air force shirt",
      "marine shirt",
      "veteran proud shirt",
      "military veteran shirt",
      "freedom shirt"
    ],
    platformNotes: {
      amazon: "November timing is strong; include veteran gift and branch terms carefully.",
      etsy: "Family and personalized branch variants are useful.",
      redbubble: "Bold patriotic stickers and posters can reuse shield assets."
    }
  },
  coffee: {
    whyNow:
      "Coffee is evergreen with an extra September lift around National Coffee Day and strong gift demand for baristas and caffeine humor.",
    targetBuyer: "Coffee lovers, baristas, office gift buyers, moms, students, and caffeine-humor shoppers.",
    designStyle: "Retro Vintage Coffee",
    safetyVerdict: "safe",
    safetyNotes: [],
    phraseVariations: [
      { phrase: "Coffee Is My Love Language", angle: "Giftable lifestyle", risk: "low" },
      { phrase: "Espresso Yourself", angle: "Coffee pun", risk: "low" },
      { phrase: "Life Begins After Coffee", angle: "Morning humor", risk: "low" }
    ],
    designPrompts: [
      {
        title: "But First Coffee",
        prompt:
          "Graphic design - retro vintage coffee badge reading 'BUT FIRST COFFEE - ALWAYS' with steaming mug, sunburst, and small stars, brown cream and teal on black, flat artwork only, NO mockup, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["retro", "coffee", "badge"]
      },
      {
        title: "Love Language",
        prompt:
          "Graphic design - warm hand-lettered phrase 'COFFEE IS MY LOVE LANGUAGE' with heart-shaped latte art in a mug, cream brown and soft pink on black, flat illustration only, ar 4:5",
        platformFit: ["amazon", "etsy"],
        styleTags: ["latte", "gift", "script"]
      },
      {
        title: "Espresso Yourself",
        prompt:
          "Graphic design - playful espresso cup mascot with sunglasses and 'ESPRESSO YOURSELF' in groovy 70s lettering, espresso brown mustard and cream on black, flat artwork only, ar 4:5",
        platformFit: ["etsy", "redbubble"],
        styleTags: ["pun", "mascot", "groovy"]
      },
      {
        title: "Life Begins Coffee",
        prompt:
          "Graphic design - minimalist steaming mug silhouette with 'LIFE BEGINS AFTER COFFEE' in refined serif type, cream and coffee brown on black, clean flat artwork only, ar 4:5",
        platformFit: ["amazon", "redbubble"],
        styleTags: ["minimal", "serif", "morning"]
      },
      {
        title: "Caffeine Club",
        prompt:
          "Graphic design - vintage club-style crest with crossed coffee beans, steaming cup, and 'CAFFEINE CLUB' in bold collegiate lettering, brown gold and cream on black, flat artwork only, ar 4:5",
        platformFit: ["amazon", "etsy", "redbubble"],
        styleTags: ["collegiate", "crest", "caffeine"]
      }
    ],
    listingKeywords: [
      "coffee shirt",
      "coffee lover shirt",
      "coffee gift",
      "coffee mom shirt",
      "but first coffee shirt",
      "coffee addict",
      "coffee lover gift",
      "caffeine shirt",
      "coffee humor shirt",
      "barista shirt"
    ],
    platformNotes: {
      amazon: "National Coffee Day adds lift, but evergreen coffee humor stays useful.",
      etsy: "Gift tags for barista, mom, and office buyers help.",
      redbubble: "Sticker-friendly mug and mascot variants are a natural fit."
    }
  }
} satisfies Record<string, TrendAiInsight>;

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
  },
  {
    id: "trend-007",
    phrase: "It's OK Not To Be OK",
    niche: "Mental Health Awareness",
    subcategory: "Emotional Support",
    temperature: "hot",
    score: 78,
    momentum: 75,
    competition: "Low",
    uploadWindow: "May peak",
    action: "Test",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.mentalHealth.whyNow,
    platformMetrics: [
      metric("Amazon", "It's OK Not To Be OK", 80, 24, 75),
      metric("Etsy", "It's OK Not To Be OK", 78, 22, 72),
      metric("Redbubble", "It's OK Not To Be OK", 70, 42, 68)
    ],
    designPrompts: dashboardPrompts("dp-007", awarenessAi.mentalHealth.designPrompts),
    listingKeywords: awarenessAi.mentalHealth.listingKeywords,
    firstSeenAt: "2026-05-01",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 78,
      temperature: "hot",
      demand: 80,
      competition: 72,
      velocity: 75,
      timing: 90,
      platformFit: 82,
      ipSafety: 98,
      confidence: 78
    },
    platformCompetition: {
      amazon: platformLabels.low,
      etsy: platformLabels.low,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.mentalHealth,
    sources: 4,
    awarenessId: "mental-health"
  },
  {
    id: "trend-008",
    phrase: "Fight Like A Girl - Breast Cancer Warrior",
    niche: "Breast Cancer Awareness",
    subcategory: "Pink Ribbon",
    temperature: "hot",
    score: 82,
    momentum: 78,
    competition: "Low-medium",
    uploadWindow: "October peak",
    action: "Test",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.breastCancer.whyNow,
    platformMetrics: [
      metric("Amazon", "Fight Like A Girl Breast Cancer Warrior", 84, 32, 78),
      metric("Etsy", "Fight Like A Girl Breast Cancer Warrior", 82, 28, 76),
      metric("Redbubble", "Fight Like A Girl Breast Cancer Warrior", 74, 42, 70)
    ],
    designPrompts: dashboardPrompts("dp-008", awarenessAi.breastCancer.designPrompts),
    listingKeywords: awarenessAi.breastCancer.listingKeywords,
    firstSeenAt: "2026-05-12",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 82,
      temperature: "hot",
      demand: 84,
      competition: 66,
      velocity: 78,
      timing: 95,
      platformFit: 86,
      ipSafety: 98,
      confidence: 82
    },
    platformCompetition: {
      amazon: platformLabels.medium,
      etsy: platformLabels.low,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.breastCancer,
    sources: 4,
    awarenessId: "breast-cancer"
  },
  {
    id: "trend-009",
    phrase: "Different Not Less - Autism Awareness",
    niche: "Autism Awareness",
    subcategory: "Neurodiversity",
    temperature: "hot",
    score: 76,
    momentum: 72,
    competition: "Low-medium",
    uploadWindow: "April peak",
    action: "Test",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.autism.whyNow,
    platformMetrics: [
      metric("Amazon", "Different Not Less Autism Awareness", 78, 34, 72),
      metric("Etsy", "Different Not Less Autism Awareness", 76, 30, 70),
      metric("Redbubble", "Different Not Less Autism Awareness", 72, 38, 68)
    ],
    designPrompts: dashboardPrompts("dp-009", awarenessAi.autism.designPrompts),
    listingKeywords: awarenessAi.autism.listingKeywords,
    firstSeenAt: "2026-05-12",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 76,
      temperature: "hot",
      demand: 78,
      competition: 68,
      velocity: 72,
      timing: 92,
      platformFit: 80,
      ipSafety: 96,
      confidence: 76
    },
    platformCompetition: {
      amazon: platformLabels.medium,
      etsy: platformLabels.low,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.autism,
    sources: 4,
    awarenessId: "autism"
  },
  {
    id: "trend-010",
    phrase: "Nursing Is A Work Of Heart",
    niche: "Nurse / Medical Professional",
    subcategory: "Nurse Appreciation",
    temperature: "hot",
    score: 85,
    momentum: 80,
    competition: "Low",
    uploadWindow: "Nurses Week",
    action: "Test",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.nurse.whyNow,
    platformMetrics: [
      metric("Amazon", "Nursing Is A Work Of Heart", 86, 24, 80),
      metric("Etsy", "Nursing Is A Work Of Heart", 84, 26, 76),
      metric("Redbubble", "Nursing Is A Work Of Heart", 74, 36, 70)
    ],
    designPrompts: dashboardPrompts("dp-010", awarenessAi.nurse.designPrompts),
    listingKeywords: awarenessAi.nurse.listingKeywords,
    firstSeenAt: "2026-05-06",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 85,
      temperature: "hot",
      demand: 86,
      competition: 76,
      velocity: 80,
      timing: 88,
      platformFit: 90,
      ipSafety: 98,
      confidence: 84
    },
    platformCompetition: {
      amazon: platformLabels.low,
      etsy: platformLabels.low,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.nurse,
    sources: 4,
    awarenessId: "nurse-medical"
  },
  {
    id: "trend-011",
    phrase: "Teaching Is My Superpower",
    niche: "Teacher / Education",
    subcategory: "Teacher Appreciation",
    temperature: "warm",
    score: 74,
    momentum: 68,
    competition: "Medium",
    uploadWindow: "Back-to-school",
    action: "Test",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.teacher.whyNow,
    platformMetrics: [
      metric("Amazon", "Teaching Is My Superpower", 76, 38, 68),
      metric("Etsy", "Teaching Is My Superpower", 74, 34, 66),
      metric("Redbubble", "Teaching Is My Superpower", 66, 44, 58)
    ],
    designPrompts: dashboardPrompts("dp-011", awarenessAi.teacher.designPrompts),
    listingKeywords: awarenessAi.teacher.listingKeywords,
    firstSeenAt: "2026-05-05",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 74,
      temperature: "warm",
      demand: 76,
      competition: 60,
      velocity: 68,
      timing: 84,
      platformFit: 80,
      ipSafety: 98,
      confidence: 74
    },
    platformCompetition: {
      amazon: platformLabels.medium,
      etsy: platformLabels.medium,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.teacher,
    sources: 4,
    awarenessId: "teacher"
  },
  {
    id: "trend-012",
    phrase: "Dog Mom - My Kids Have Paws",
    niche: "Pet / Dog Owner",
    subcategory: "Dog Mom",
    temperature: "hot",
    score: 88,
    momentum: 82,
    competition: "Low-medium",
    uploadWindow: "evergreen",
    action: "Test",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.dogMom.whyNow,
    platformMetrics: [
      metric("Amazon", "Dog Mom My Kids Have Paws", 90, 36, 82),
      metric("Etsy", "Dog Mom My Kids Have Paws", 88, 32, 80),
      metric("Redbubble", "Dog Mom My Kids Have Paws", 78, 42, 72)
    ],
    designPrompts: dashboardPrompts("dp-012", awarenessAi.dogMom.designPrompts),
    listingKeywords: awarenessAi.dogMom.listingKeywords,
    firstSeenAt: "2026-05-01",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 88,
      temperature: "hot",
      demand: 90,
      competition: 64,
      velocity: 82,
      timing: 86,
      platformFit: 92,
      ipSafety: 98,
      confidence: 86
    },
    platformCompetition: {
      amazon: platformLabels.medium,
      etsy: platformLabels.low,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.dogMom,
    sources: 4,
    awarenessId: "dog-mom"
  },
  {
    id: "trend-013",
    phrase: "Veteran Proud - Freedom Isn't Free",
    niche: "Military / Veteran",
    subcategory: "Veterans Awareness",
    temperature: "warm",
    score: 72,
    momentum: 66,
    competition: "Medium",
    uploadWindow: "November peak",
    action: "Watch",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.veterans.whyNow,
    platformMetrics: [
      metric("Amazon", "Veteran Proud Freedom Isn't Free", 74, 40, 66),
      metric("Etsy", "Veteran Proud Freedom Isn't Free", 70, 36, 62),
      metric("Redbubble", "Veteran Proud Freedom Isn't Free", 64, 44, 58)
    ],
    designPrompts: dashboardPrompts("dp-013", awarenessAi.veterans.designPrompts),
    listingKeywords: awarenessAi.veterans.listingKeywords,
    firstSeenAt: "2026-05-12",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 72,
      temperature: "warm",
      demand: 74,
      competition: 58,
      velocity: 66,
      timing: 88,
      platformFit: 76,
      ipSafety: 96,
      confidence: 72
    },
    platformCompetition: {
      amazon: platformLabels.medium,
      etsy: platformLabels.medium,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.veterans,
    sources: 4,
    awarenessId: "veterans"
  },
  {
    id: "trend-014",
    phrase: "But First Coffee - Always",
    niche: "Coffee Lover / Lifestyle",
    subcategory: "Coffee Humor",
    temperature: "warm",
    score: 70,
    momentum: 64,
    competition: "Medium",
    uploadWindow: "Sep 29",
    action: "Watch",
    source: "Awareness calendar",
    platforms: ["Amazon", "Etsy", "Redbubble"],
    safetyVerdict: "safe",
    aiSummary: awarenessAi.coffee.whyNow,
    platformMetrics: [
      metric("Amazon", "But First Coffee Always", 72, 44, 64),
      metric("Etsy", "But First Coffee Always", 70, 40, 62),
      metric("Redbubble", "But First Coffee Always", 66, 46, 58)
    ],
    designPrompts: dashboardPrompts("dp-014", awarenessAi.coffee.designPrompts),
    listingKeywords: awarenessAi.coffee.listingKeywords,
    firstSeenAt: "2026-05-12",
    lastSeenAt: "2026-05-12",
    scoreBreakdown: {
      total: 70,
      temperature: "warm",
      demand: 72,
      competition: 56,
      velocity: 64,
      timing: 80,
      platformFit: 78,
      ipSafety: 98,
      confidence: 70
    },
    platformCompetition: {
      amazon: platformLabels.medium,
      etsy: platformLabels.medium,
      redbubble: platformLabels.medium
    },
    ai: awarenessAi.coffee,
    sources: 4,
    awarenessId: "coffee"
  }
];

// ─── Calendar opportunities ───────────────────────────────────────────────────

export const AWARENESS_NICHES: AwarenessNiche[] = [
  {
    id: "mental-health",
    name: "Mental Health Awareness",
    month: "May",
    monthNumber: 5,
    ribbon: "🎗️",
    color: "green",
    phraseAngles: ["It's OK Not To Be OK", "Semicolon Warrior", "Mental Health Matters"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Botanical Floral Minimal",
    daysUntilPeak: 0
  },
  {
    id: "breast-cancer",
    name: "Breast Cancer Awareness",
    month: "October",
    monthNumber: 10,
    ribbon: "🎗️",
    color: "pink",
    phraseAngles: ["Fight Like A Girl", "Pink Ribbon Strong", "Warrior Not Worrier"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Bold Pink Ribbon",
    daysUntilPeak: 142
  },
  {
    id: "autism",
    name: "Autism Awareness",
    month: "April",
    monthNumber: 4,
    ribbon: "🎗️",
    color: "blue",
    phraseAngles: ["Autism Dad", "Autism Mom Strong", "Different Not Less"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Colorful Puzzle Piece Modern",
    daysUntilPeak: 0
  },
  {
    id: "nurse-medical",
    name: "Nurse / Medical Professional",
    month: "May",
    monthNumber: 5,
    ribbon: "🎗️",
    color: "teal",
    phraseAngles: ["Nurse Life", "Nursing Is A Work Of Heart", "ICU Nurse Strong"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Clean Medical Professional",
    daysUntilPeak: 0
  },
  {
    id: "teacher",
    name: "Teacher / Education",
    month: "September",
    monthNumber: 9,
    ribbon: "🎗️",
    color: "yellow",
    phraseAngles: ["Teaching Is My Superpower", "Fueled By Coffee And Dry Erase", "World's Okayest Teacher"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Bold Collegiate Fun",
    daysUntilPeak: 112
  },
  {
    id: "dog-mom",
    name: "Dog Mom",
    month: "May / August",
    monthNumber: 5,
    ribbon: "🎗️",
    color: "orange",
    phraseAngles: ["Dog Mom", "Rescue Dog Dad", "My Dog Is My Therapist"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Cute Cartoon Mascot",
    daysUntilPeak: 0
  },
  {
    id: "veterans",
    name: "Veterans",
    month: "November",
    monthNumber: 11,
    ribbon: "🎗️",
    color: "red-white-blue",
    phraseAngles: ["Veteran Proud", "Freedom Isn't Free", "Home Of The Brave"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Bold American Patriotic",
    daysUntilPeak: 173
  },
  {
    id: "coffee",
    name: "Coffee Lover",
    month: "September 29",
    monthNumber: 9,
    ribbon: "🎗️",
    color: "brown",
    phraseAngles: ["But First Coffee", "Coffee Is My Love Language", "Espresso Yourself"],
    platforms: ["amazon", "etsy", "redbubble"],
    designStyle: "Retro Vintage Coffee",
    daysUntilPeak: 140
  }
];

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

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = "hot-trend" | "upload-window" | "scan-complete";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  href?: string;
};

export const seedNotifications: AppNotification[] = [
  {
    id: "notif-001",
    type: "hot-trend",
    title: "New hot trend",
    body: '"Professional Plant Murderer" crossed score 80 — upload window is 24h',
    timestamp: "2026-05-10T08:31:00Z",
    read: false,
    href: "/trends/trend-006",
  },
  {
    id: "notif-002",
    type: "upload-window",
    title: "Upload window open",
    body: "Graduation Season deadline is May 18 — 7 days remaining",
    timestamp: "2026-05-10T06:00:00Z",
    read: false,
    href: "/calendar",
  },
  {
    id: "notif-003",
    type: "scan-complete",
    title: "Scan completed",
    body: "Daily scan found 18 trends · 30 calendar events",
    timestamp: "2026-05-10T01:12:00Z",
    read: false,
    href: "/scan-runs",
  },
  {
    id: "notif-004",
    type: "hot-trend",
    title: "New hot trend",
    body: '"Living My Best Chaotic Life" momentum at 74 — test now',
    timestamp: "2026-05-09T09:15:00Z",
    read: true,
    href: "/trends/trend-001",
  },
  {
    id: "notif-005",
    type: "upload-window",
    title: "Upload window open",
    body: "Pride Month deadline is May 20 — design assets ready",
    timestamp: "2026-05-09T06:00:00Z",
    read: true,
    href: "/calendar",
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────────────────

export function getTrendById(id: string): TrendSignal | undefined {
  return trendSignals.find((t) => t.id === id);
}

export function getTrends(): TrendSignal[] {
  return trendSignals;
}

export function getCalendarEventById(id: string): CalendarOpportunity | undefined {
  return calendarOpportunities.find((e) => e.id === id);
}
