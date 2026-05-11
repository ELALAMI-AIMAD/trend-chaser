/** The top-level category grouping for a niche. */
export type NicheCategory =
  | "calendar-seasonal"
  | "viral"
  | "hobby"
  | "profession"
  | "family"
  | "sports-adjacent"
  | "pet-animal"
  | "food-drink"
  | "wellness"
  | "internet-culture"
  | "local-pride"
  | "travel"
  | "school-college";

/** A single niche entry in the taxonomy. */
export interface Niche {
  slug: string;
  name: string;
  category: NicheCategory;
  subcategories: string[];
}

/** Full niche taxonomy — 80+ entries covering all major POD market segments. */
export const NICHE_TAXONOMY: Niche[] = [
  // ── Calendar / Seasonal ──────────────────────────────────────────────
  {
    slug: "christmas", name: "Christmas", category: "calendar-seasonal",
    subcategories: ["ugly sweater", "elf", "santa", "reindeer", "snowman", "nutcracker", "christmas eve"],
  },
  {
    slug: "halloween", name: "Halloween", category: "calendar-seasonal",
    subcategories: ["witch", "skeleton", "vampire", "ghost", "pumpkin", "spooky season", "trick or treat", "black cat"],
  },
  {
    slug: "valentines-day", name: "Valentine's Day", category: "calendar-seasonal",
    subcategories: ["love", "galentines", "anti-valentine", "couples", "hearts", "chocolate"],
  },
  {
    slug: "mothers-day", name: "Mother's Day", category: "calendar-seasonal",
    subcategories: ["mama", "new mom", "girl mom", "boy mom", "dog mom", "bonus mom", "grandma"],
  },
  {
    slug: "fathers-day", name: "Father's Day", category: "calendar-seasonal",
    subcategories: ["dad jokes", "grill dad", "bonus dad", "dog dad", "new dad", "girl dad"],
  },
  {
    slug: "easter", name: "Easter", category: "calendar-seasonal",
    subcategories: ["bunny", "eggs", "spring", "religious easter", "chick"],
  },
  {
    slug: "thanksgiving", name: "Thanksgiving", category: "calendar-seasonal",
    subcategories: ["grateful", "turkey", "fall vibes", "pie lover", "harvest"],
  },
  {
    slug: "new-years", name: "New Year's", category: "calendar-seasonal",
    subcategories: ["new year new me", "cheers", "midnight", "resolutions", "countdown"],
  },
  {
    slug: "fourth-of-july", name: "4th of July", category: "calendar-seasonal",
    subcategories: ["patriotic", "fireworks", "merica", "freedom", "red white blue"],
  },
  {
    slug: "st-patricks-day", name: "St. Patrick's Day", category: "calendar-seasonal",
    subcategories: ["lucky", "shamrock", "irish", "clover", "green beer"],
  },
  {
    slug: "back-to-school", name: "Back to School", category: "calendar-seasonal",
    subcategories: ["first day", "grade level", "school supplies", "teacher"],
  },
  {
    slug: "graduation", name: "Graduation", category: "calendar-seasonal",
    subcategories: ["class of year", "senior", "college grad", "high school grad", "proud parent", "cap and gown"],
  },
  {
    slug: "cinco-de-mayo", name: "Cinco de Mayo", category: "calendar-seasonal",
    subcategories: ["fiesta", "taco", "margarita", "salsa", "festive"],
  },
  {
    slug: "memorial-day", name: "Memorial Day", category: "calendar-seasonal",
    subcategories: ["honor", "veteran tribute", "freedom", "summer kickoff"],
  },
  {
    slug: "labor-day", name: "Labor Day", category: "calendar-seasonal",
    subcategories: ["end of summer", "union", "workers", "long weekend"],
  },
  // ── Viral ─────────────────────────────────────────────────────────────
  {
    slug: "bookish", name: "Bookish / BookTok", category: "viral",
    subcategories: ["reader girl", "dark romance", "fantasy reader", "enemies to lovers", "kindle addict", "booktok"],
  },
  {
    slug: "cottagecore", name: "Cottagecore", category: "viral",
    subcategories: ["mushroom", "fairy garden", "cottage witch", "wildflower", "frog", "forest"],
  },
  {
    slug: "dark-academia", name: "Dark Academia", category: "viral",
    subcategories: ["ancient history", "library aesthetic", "poetry", "oxford", "philosophy"],
  },
  {
    slug: "goblincore", name: "Goblincore", category: "viral",
    subcategories: ["frog", "mushroom", "snail", "forest creature", "shiny things", "rocks"],
  },
  {
    slug: "witchy", name: "Witchy / Mystical", category: "viral",
    subcategories: ["tarot", "astrology", "moon phases", "crystals", "spell book", "coven", "herbalist"],
  },
  {
    slug: "retro-nostalgia", name: "Retro / Nostalgia", category: "viral",
    subcategories: ["90s kid", "80s baby", "vintage vibes", "retro aesthetic", "cassette tape", "vhs"],
  },
  // ── Hobby ─────────────────────────────────────────────────────────────
  {
    slug: "gaming", name: "Gaming", category: "hobby",
    subcategories: ["pc gamer", "console gamer", "retro gaming", "rpg", "fps", "indie game", "streamer"],
  },
  {
    slug: "crafting", name: "Crafting", category: "hobby",
    subcategories: ["crochet", "knitting", "cross stitch", "scrapbooking", "sewing", "yarn lover", "quilting"],
  },
  {
    slug: "reading", name: "Reading / Books", category: "hobby",
    subcategories: ["fiction lover", "nonfiction", "mystery reader", "sci-fi reader", "book club"],
  },
  {
    slug: "photography", name: "Photography", category: "hobby",
    subcategories: ["film photography", "nature photography", "portrait", "hobbyist", "golden hour"],
  },
  {
    slug: "gardening", name: "Gardening", category: "hobby",
    subcategories: ["plant parent", "herb garden", "vegetable garden", "flower lover", "succulent", "propagation"],
  },
  {
    slug: "cooking", name: "Cooking / Baking", category: "hobby",
    subcategories: ["home baker", "sourdough", "pasta lover", "meal prep", "bbq", "air fryer"],
  },
  {
    slug: "hiking", name: "Hiking / Outdoor", category: "hobby",
    subcategories: ["trail life", "camping lover", "national parks", "wilderness", "mountain life", "ultralight"],
  },
  {
    slug: "music", name: "Music", category: "hobby",
    subcategories: ["guitar player", "piano player", "drummer", "vinyl collector", "concert lover", "band mom"],
  },
  {
    slug: "yoga", name: "Yoga / Meditation", category: "hobby",
    subcategories: ["namaste", "mindfulness", "zen", "chakra", "breathe", "flow state"],
  },
  {
    slug: "fishing", name: "Fishing", category: "hobby",
    subcategories: ["bass fishing", "fly fishing", "gone fishing", "reel life", "catch and release", "ice fishing"],
  },
  {
    slug: "hunting", name: "Hunting", category: "hobby",
    subcategories: ["deer hunting", "duck hunting", "turkey season", "bow hunting", "outdoorsman", "gun dog"],
  },
  {
    slug: "diy-woodworking", name: "DIY / Woodworking", category: "hobby",
    subcategories: ["maker", "workshop life", "sawdust is my glitter", "craftsman", "power tools"],
  },
  // ── Profession ────────────────────────────────────────────────────────
  {
    slug: "nurse", name: "Nurse / Nursing", category: "profession",
    subcategories: ["rn life", "er nurse", "icu nurse", "labor and delivery", "travel nurse", "nurse practitioner", "cna"],
  },
  {
    slug: "teacher", name: "Teacher", category: "profession",
    subcategories: ["kindergarten", "elementary", "middle school", "high school", "art teacher", "pe teacher", "substitute"],
  },
  {
    slug: "doctor", name: "Doctor / Physician", category: "profession",
    subcategories: ["medical resident", "surgeon", "pediatrician", "dentist", "pharmacist", "emt", "paramedic"],
  },
  {
    slug: "engineer", name: "Engineer", category: "profession",
    subcategories: ["software engineer", "civil engineer", "mechanical engineer", "electrical engineer", "aerospace"],
  },
  {
    slug: "firefighter", name: "Firefighter", category: "profession",
    subcategories: ["fire wife", "fire mom", "first responder", "volunteer firefighter", "ladder company"],
  },
  {
    slug: "police", name: "Police / Law Enforcement", category: "profession",
    subcategories: ["police wife", "cop life", "detective", "first responder", "deputy"],
  },
  {
    slug: "military", name: "Military", category: "profession",
    subcategories: ["army", "navy", "marines", "air force", "coast guard", "military wife", "veteran", "national guard"],
  },
  {
    slug: "chef", name: "Chef / Cook", category: "profession",
    subcategories: ["line cook", "pastry chef", "restaurant life", "culinary student", "sous chef"],
  },
  {
    slug: "accountant", name: "Accountant / CPA", category: "profession",
    subcategories: ["tax season", "bookkeeper", "finance life", "spreadsheet lover", "cpa"],
  },
  {
    slug: "real-estate", name: "Real Estate", category: "profession",
    subcategories: ["realtor life", "house flipping", "property manager", "real estate agent", "mortgage"],
  },
  {
    slug: "social-worker", name: "Social Worker / Counselor", category: "profession",
    subcategories: ["mental health counselor", "school counselor", "case manager", "therapist"],
  },
  // ── Family ────────────────────────────────────────────────────────────
  {
    slug: "mom-life", name: "Mom Life", category: "family",
    subcategories: ["toddler mom", "sports mom", "tired mom", "wine mom", "chaos coordinator", "hockey mom"],
  },
  {
    slug: "dad-life", name: "Dad Life", category: "family",
    subcategories: ["girl dad", "toddler dad", "sports dad", "cool dad", "dog dad", "hockey dad"],
  },
  {
    slug: "grandparent", name: "Grandparent", category: "family",
    subcategories: ["grandma", "grandpa", "nana", "papa", "granny", "gramps", "mimi"],
  },
  {
    slug: "aunt-uncle", name: "Aunt / Uncle", category: "family",
    subcategories: ["cool aunt", "fun uncle", "auntie", "promoted to aunt", "promoted to uncle"],
  },
  {
    slug: "sibling", name: "Sibling", category: "family",
    subcategories: ["big sister", "little sister", "big brother", "little brother", "only child", "twins"],
  },
  {
    slug: "baby-newborn", name: "Baby / Newborn", category: "family",
    subcategories: ["new baby", "baby shower", "gender reveal", "pregnancy announcement", "new parent", "onesie"],
  },
  {
    slug: "wedding", name: "Wedding / Marriage", category: "family",
    subcategories: ["bride", "groom", "maid of honor", "bridesmaid", "just married", "wifey", "hubby"],
  },
  // ── Sports-Adjacent ───────────────────────────────────────────────────
  {
    slug: "running", name: "Running", category: "sports-adjacent",
    subcategories: ["marathon", "5k", "trail runner", "half marathon", "morning runner", "26.2"],
  },
  {
    slug: "cycling", name: "Cycling", category: "sports-adjacent",
    subcategories: ["road cycling", "mountain bike", "gravel bike", "spin class", "cyclist life"],
  },
  {
    slug: "swimming", name: "Swimming", category: "sports-adjacent",
    subcategories: ["swim team", "open water", "pool life", "swim mom", "lap swimmer", "master swimmer"],
  },
  {
    slug: "crossfit", name: "CrossFit / Weightlifting", category: "sports-adjacent",
    subcategories: ["wod life", "barbell club", "powerlifting", "gym rat", "lifting heavy", "box life"],
  },
  {
    slug: "soccer", name: "Soccer / Football", category: "sports-adjacent",
    subcategories: ["soccer mom", "soccer dad", "goalkeeper", "striker", "youth soccer", "futbol"],
  },
  {
    slug: "baseball", name: "Baseball / Softball", category: "sports-adjacent",
    subcategories: ["baseball mom", "softball mom", "catcher", "pitcher", "dugout life", "little league"],
  },
  {
    slug: "basketball", name: "Basketball", category: "sports-adjacent",
    subcategories: ["hoop life", "basketball mom", "point guard", "ball is life", "court life"],
  },
  {
    slug: "golf", name: "Golf", category: "sports-adjacent",
    subcategories: ["golf dad", "weekend golfer", "golf wife", "par life", "birdie", "disc golf"],
  },
  {
    slug: "volleyball", name: "Volleyball", category: "sports-adjacent",
    subcategories: ["volleyball mom", "beach volleyball", "setter", "libero", "spike"],
  },
  {
    slug: "cheer-dance", name: "Cheer / Dance", category: "sports-adjacent",
    subcategories: ["cheer mom", "dance mom", "competition season", "tumbling", "recital"],
  },
  // ── Pet / Animal ──────────────────────────────────────────────────────
  {
    slug: "dog-mom-dad", name: "Dog Mom / Dog Dad", category: "pet-animal",
    subcategories: ["golden retriever", "labrador", "dachshund", "french bulldog", "pittie mom", "husky", "rescue dog", "german shepherd"],
  },
  {
    slug: "cat-mom-dad", name: "Cat Mom / Cat Dad", category: "pet-animal",
    subcategories: ["tabby", "black cat", "maine coon", "rescue cat", "cat lady", "crazy cat lady", "orange cat"],
  },
  {
    slug: "horse-equestrian", name: "Horse / Equestrian", category: "pet-animal",
    subcategories: ["barrel racing", "show jumping", "dressage", "horse girl", "barn life", "western riding"],
  },
  {
    slug: "reptile", name: "Reptile / Exotic Pet", category: "pet-animal",
    subcategories: ["bearded dragon", "gecko", "ball python", "turtle", "lizard mom"],
  },
  {
    slug: "bird-parrot", name: "Bird / Parrot", category: "pet-animal",
    subcategories: ["cockatiel", "parakeet", "macaw", "bird mom", "parrot lover", "chicken keeper"],
  },
  // ── Food / Drink ──────────────────────────────────────────────────────
  {
    slug: "coffee", name: "Coffee / Espresso", category: "food-drink",
    subcategories: ["cold brew", "iced coffee", "latte art", "coffee addict", "but first coffee", "coffee snob"],
  },
  {
    slug: "wine", name: "Wine", category: "food-drink",
    subcategories: ["wine mom", "rose all day", "red wine lover", "white wine", "vineyard", "wine wednesday"],
  },
  {
    slug: "whiskey-bourbon", name: "Whiskey / Bourbon", category: "food-drink",
    subcategories: ["bourbon lover", "whiskey dad", "scotch", "barrel aged", "on the rocks", "neat"],
  },
  {
    slug: "pizza-tacos", name: "Pizza / Tacos", category: "food-drink",
    subcategories: ["pizza addict", "taco tuesday", "taco lover", "nacho", "foodie", "street tacos"],
  },
  {
    slug: "vegan-vegetarian", name: "Vegan / Vegetarian", category: "food-drink",
    subcategories: ["plant based", "veggie lover", "tofu", "meatless monday", "animal lover"],
  },
  {
    slug: "bbq-grilling", name: "BBQ / Grilling", category: "food-drink",
    subcategories: ["grill master", "pit master", "smoke bbq", "brisket", "backyard bbq", "low and slow"],
  },
  // ── Wellness ──────────────────────────────────────────────────────────
  {
    slug: "mental-health", name: "Mental Health Awareness", category: "wellness",
    subcategories: ["anxiety warrior", "self care", "therapy", "mental health matters", "it is okay", "breathe"],
  },
  {
    slug: "sobriety", name: "Sobriety / Recovery", category: "wellness",
    subcategories: ["sober life", "recovery", "clean and sober", "one day at a time", "soberversary"],
  },
  {
    slug: "fitness-wellness", name: "Fitness / Healthy Living", category: "wellness",
    subcategories: ["clean eating", "meal prep", "step count", "walk more", "wellness journey"],
  },
  // ── Internet Culture ──────────────────────────────────────────────────
  {
    slug: "astrology", name: "Astrology / Zodiac", category: "internet-culture",
    subcategories: ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"],
  },
  {
    slug: "frog-mushroom", name: "Frog & Mushroom Aesthetic", category: "internet-culture",
    subcategories: ["frog lover", "mushroom forager", "fairy core", "forest spirit", "cottagecore frog"],
  },
  {
    slug: "true-crime", name: "True Crime / Mystery", category: "internet-culture",
    subcategories: ["podcast listener", "murderino", "crime junkie", "cold case", "mystery lover"],
  },
  // ── Local Pride ───────────────────────────────────────────────────────
  {
    slug: "state-pride", name: "State Pride", category: "local-pride",
    subcategories: ["texas proud", "florida life", "california dreaming", "new york", "colorado mountains", "southern girl", "midwest"],
  },
  {
    slug: "country-rural", name: "Country / Rural Pride", category: "local-pride",
    subcategories: ["country girl", "farm life", "small town", "rural living", "cowgirl", "cowboy", "ranch life"],
  },
  {
    slug: "southern-culture", name: "Southern Culture", category: "local-pride",
    subcategories: ["yall", "sweet tea", "bless your heart", "southern belle", "dixie"],
  },
  // ── Travel ────────────────────────────────────────────────────────────
  {
    slug: "beach-ocean", name: "Beach / Ocean", category: "travel",
    subcategories: ["beach life", "ocean lover", "surfer", "mermaid vibes", "salty air", "coastal grandmother"],
  },
  {
    slug: "mountains", name: "Mountains", category: "travel",
    subcategories: ["mountain life", "elevation", "peak bagger", "ski bum", "altitude", "fourteener"],
  },
  {
    slug: "camping", name: "Camping / RV Life", category: "travel",
    subcategories: ["tent life", "rv life", "glamping", "campfire", "smores", "campground"],
  },
  {
    slug: "national-parks", name: "National Parks", category: "travel",
    subcategories: ["park lover", "yellowstone", "grand canyon", "yosemite", "trails", "junior ranger"],
  },
  // ── School / College ─────────────────────────────────────────────────
  {
    slug: "college-life", name: "College Life", category: "school-college",
    subcategories: ["freshman", "senior year", "dorm life", "greek life", "study grind", "finals week"],
  },
  {
    slug: "school-student", name: "Student Life", category: "school-college",
    subcategories: ["honor roll", "homework", "study life", "pencil case", "notebook lover"],
  },
];

/** Look up a niche by its slug identifier. */
export function getNicheBySlug(slug: string): Niche | undefined {
  return NICHE_TAXONOMY.find((n) => n.slug === slug);
}

/** Return every niche in the taxonomy. */
export function getAllNiches(): Niche[] {
  return NICHE_TAXONOMY;
}

/** Return the subcategories for a given niche slug. Returns [] if slug not found. */
export function getSubcategories(nicheSlug: string): string[] {
  return getNicheBySlug(nicheSlug)?.subcategories ?? [];
}

/** Return all niches belonging to a specific category. */
export function getNichesByCategory(category: NicheCategory): Niche[] {
  return NICHE_TAXONOMY.filter((n) => n.category === category);
}
