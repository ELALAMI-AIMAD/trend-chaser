import { subWeeks } from "date-fns"
import { urgency } from "@trend-chaser/core"
import type { UrgencyLevel } from "@trend-chaser/core"
import type { CollectInput, CollectorConfig, SourceCollector, SourceEventInput } from "../types"

// ── types ─────────────────────────────────────────────────────────────────────

export type EventCategory =
  | "holiday"
  | "awareness"
  | "health"
  | "social_cause"
  | "environment"
  | "seasonal"
  | "pop_culture"
  | "food"
  | "animal"
  | "profession"
  | "family"
  | "religious"

type CalendarEventDef = {
  name: string
  date: Date
  region: "US"
  category: EventCategory
  recurs: boolean
}

// ── events ────────────────────────────────────────────────────────────────────

const EVENTS: CalendarEventDef[] = [
  // JANUARY
  { name: "New Year's Day",             date: new Date(Date.UTC(2026, 0,  1)), region: "US", category: "holiday",     recurs: true },
  { name: "Dry January",                date: new Date(Date.UTC(2026, 0,  1)), region: "US", category: "health",      recurs: true },
  { name: "Martin Luther King Jr. Day", date: new Date(Date.UTC(2026, 0, 19)), region: "US", category: "holiday",     recurs: true },
  { name: "National Handwriting Day",   date: new Date(Date.UTC(2026, 0, 23)), region: "US", category: "awareness",   recurs: true },

  // FEBRUARY
  { name: "Black History Month",        date: new Date(Date.UTC(2026, 1,  1)), region: "US", category: "social_cause", recurs: true },
  { name: "Heart Disease Awareness Month", date: new Date(Date.UTC(2026, 1,  1)), region: "US", category: "health",   recurs: true },
  { name: "Groundhog Day",              date: new Date(Date.UTC(2026, 1,  2)), region: "US", category: "pop_culture", recurs: true },
  { name: "World Cancer Day",           date: new Date(Date.UTC(2026, 1,  4)), region: "US", category: "health",      recurs: true },
  { name: "National Pizza Day",         date: new Date(Date.UTC(2026, 1,  9)), region: "US", category: "food",        recurs: true },
  { name: "Valentine's Day",            date: new Date(Date.UTC(2026, 1, 14)), region: "US", category: "holiday",     recurs: true },
  { name: "Presidents Day",             date: new Date(Date.UTC(2026, 1, 16)), region: "US", category: "holiday",     recurs: true },
  { name: "National Love Your Pet Day", date: new Date(Date.UTC(2026, 1, 20)), region: "US", category: "animal",      recurs: true },
  { name: "Rare Disease Day",           date: new Date(Date.UTC(2026, 1, 28)), region: "US", category: "health",      recurs: true },

  // MARCH
  { name: "Endometriosis Awareness Month", date: new Date(Date.UTC(2026, 2,  1)), region: "US", category: "health",   recurs: true },
  { name: "Social Workers Month",       date: new Date(Date.UTC(2026, 2,  1)), region: "US", category: "profession",  recurs: true },
  { name: "Women's History Month",      date: new Date(Date.UTC(2026, 2,  1)), region: "US", category: "social_cause", recurs: true },
  { name: "World Wildlife Day",         date: new Date(Date.UTC(2026, 2,  3)), region: "US", category: "environment", recurs: true },
  { name: "St. Patrick's Day",  date: new Date(Date.UTC(2026, 2, 17)), region: "US", category: "holiday",   recurs: true },
  { name: "Spring Equinox",     date: new Date(Date.UTC(2026, 2, 20)), region: "US", category: "seasonal",  recurs: true },
  { name: "National Puppy Day", date: new Date(Date.UTC(2026, 2, 23)), region: "US", category: "animal",    recurs: true },
  { name: "Earth Hour",         date: new Date(Date.UTC(2026, 2, 28)), region: "US", category: "awareness", recurs: true },
  { name: "National Doctors Day", date: new Date(Date.UTC(2026, 2, 30)), region: "US", category: "profession", recurs: true },

  // APRIL
  { name: "April Fools Day",               date: new Date(Date.UTC(2026, 3,  1)), region: "US", category: "pop_culture", recurs: true },
  { name: "Autism Awareness Month",        date: new Date(Date.UTC(2026, 3,  1)), region: "US", category: "health",      recurs: true },
  { name: "Earth Month",                   date: new Date(Date.UTC(2026, 3,  1)), region: "US", category: "environment", recurs: true },
  { name: "World Autism Day",              date: new Date(Date.UTC(2026, 3,  2)), region: "US", category: "health",      recurs: true },
  { name: "National Librarians Day",       date: new Date(Date.UTC(2026, 3,  4)), region: "US", category: "profession",  recurs: true },
  { name: "Easter Sunday",                 date: new Date(Date.UTC(2026, 3,  5)), region: "US", category: "religious",   recurs: true },
  { name: "National Beer Day",             date: new Date(Date.UTC(2026, 3,  7)), region: "US", category: "food",        recurs: true },
  { name: "Earth Day",                     date: new Date(Date.UTC(2026, 3, 22)), region: "US", category: "awareness",   recurs: true },
  { name: "Administrative Professionals Day", date: new Date(Date.UTC(2026, 3, 22)), region: "US", category: "awareness", recurs: true },
  { name: "Arbor Day",                     date: new Date(Date.UTC(2026, 3, 24)), region: "US", category: "awareness",   recurs: true },

  // MAY
  { name: "ALS Awareness Month",           date: new Date(Date.UTC(2026, 4,  1)), region: "US", category: "health",       recurs: true },
  { name: "Asian Pacific Heritage Month",  date: new Date(Date.UTC(2026, 4,  1)), region: "US", category: "social_cause", recurs: true },
  { name: "Fibromyalgia Awareness Month",  date: new Date(Date.UTC(2026, 4,  1)), region: "US", category: "health",       recurs: true },
  { name: "Lupus Awareness Month",         date: new Date(Date.UTC(2026, 4,  1)), region: "US", category: "health",       recurs: true },
  { name: "Mental Health Awareness Month", date: new Date(Date.UTC(2026, 4,  1)), region: "US", category: "health",       recurs: true },
  { name: "National Pet Month",            date: new Date(Date.UTC(2026, 4,  1)), region: "US", category: "animal",       recurs: true },
  { name: "Star Wars Day",       date: new Date(Date.UTC(2026, 4,  4)), region: "US", category: "pop_culture", recurs: true },
  { name: "National Firefighters Day", date: new Date(Date.UTC(2026, 4,  4)), region: "US", category: "profession", recurs: true },
  { name: "National Teachers Day", date: new Date(Date.UTC(2026, 4,  5)), region: "US", category: "profession", recurs: true },
  { name: "National Nurses Week", date: new Date(Date.UTC(2026, 4,  6)), region: "US", category: "profession",  recurs: true },
  { name: "National Dog Mom Day",date: new Date(Date.UTC(2026, 4,  9)), region: "US", category: "animal",      recurs: true },
  { name: "Mother's Day",        date: new Date(Date.UTC(2026, 4, 10)), region: "US", category: "family",      recurs: true },
  { name: "National Police Week", date: new Date(Date.UTC(2026, 4, 11)), region: "US", category: "profession",  recurs: true },
  { name: "Armed Forces Day",    date: new Date(Date.UTC(2026, 4, 16)), region: "US", category: "holiday",     recurs: true },
  { name: "National Wine Day",   date: new Date(Date.UTC(2026, 4, 25)), region: "US", category: "food",        recurs: true },
  { name: "Memorial Day",        date: new Date(Date.UTC(2026, 4, 25)), region: "US", category: "holiday",     recurs: true },
  { name: "National Burger Day", date: new Date(Date.UTC(2026, 4, 28)), region: "US", category: "food",        recurs: true },

  // JUNE
  { name: "Adopt a Cat Month",     date: new Date(Date.UTC(2026, 5,  1)), region: "US", category: "animal",      recurs: true },
  { name: "Graduation Season",     date: new Date(Date.UTC(2026, 5,  1)), region: "US", category: "seasonal",    recurs: true },
  { name: "LGBTQ+ Pride Month",    date: new Date(Date.UTC(2026, 5,  1)), region: "US", category: "social_cause", recurs: true },
  { name: "Ocean Month",           date: new Date(Date.UTC(2026, 5,  1)), region: "US", category: "environment", recurs: true },
  { name: "World Environment Day", date: new Date(Date.UTC(2026, 5,  5)), region: "US", category: "awareness",   recurs: true },
  { name: "World Ocean Day",       date: new Date(Date.UTC(2026, 5,  8)), region: "US", category: "awareness",   recurs: true },
  { name: "Juneteenth",            date: new Date(Date.UTC(2026, 5, 19)), region: "US", category: "holiday",     recurs: true },
  { name: "Father's Day",          date: new Date(Date.UTC(2026, 5, 21)), region: "US", category: "family",      recurs: true },
  { name: "Summer Solstice",       date: new Date(Date.UTC(2026, 5, 21)), region: "US", category: "seasonal",    recurs: true },

  // JULY
  { name: "Independence Day",    date: new Date(Date.UTC(2026, 6,  4)), region: "US", category: "holiday",     recurs: true },
  { name: "World Chocolate Day", date: new Date(Date.UTC(2026, 6,  7)), region: "US", category: "food",        recurs: true },
  { name: "Shark Awareness Day", date: new Date(Date.UTC(2026, 6, 14)), region: "US", category: "environment", recurs: true },
  { name: "National Hot Dog Day",date: new Date(Date.UTC(2026, 6, 16)), region: "US", category: "food",        recurs: true },
  { name: "World Emoji Day",     date: new Date(Date.UTC(2026, 6, 17)), region: "US", category: "pop_culture", recurs: true },
  { name: "National Ice Cream Day", date: new Date(Date.UTC(2026, 6, 19)), region: "US", category: "food",      recurs: true },
  { name: "Moon Day",            date: new Date(Date.UTC(2026, 6, 20)), region: "US", category: "pop_culture", recurs: true },

  // AUGUST
  { name: "International Friendship Day", date: new Date(Date.UTC(2026, 7,  1)), region: "US", category: "awareness", recurs: true },
  { name: "Back to School Season",        date: new Date(Date.UTC(2026, 7, 15)), region: "US", category: "seasonal",  recurs: true },
  { name: "National Dog Day",             date: new Date(Date.UTC(2026, 7, 26)), region: "US", category: "animal",    recurs: true },
  { name: "Women's Equality Day",         date: new Date(Date.UTC(2026, 7, 26)), region: "US", category: "awareness", recurs: true },

  // SEPTEMBER
  { name: "Suicide Prevention Month",             date: new Date(Date.UTC(2026, 8,  1)), region: "US", category: "health",      recurs: true },
  { name: "Labor Day",                            date: new Date(Date.UTC(2026, 8,  7)), region: "US", category: "holiday",     recurs: true },
  { name: "Grandparents Day",                     date: new Date(Date.UTC(2026, 8, 13)), region: "US", category: "family",      recurs: true },
  { name: "Hispanic Heritage Month",              date: new Date(Date.UTC(2026, 8, 15)), region: "US", category: "social_cause", recurs: true },
  { name: "International Talk Like a Pirate Day", date: new Date(Date.UTC(2026, 8, 19)), region: "US", category: "pop_culture", recurs: true },
  { name: "Fall Equinox",                         date: new Date(Date.UTC(2026, 8, 23)), region: "US", category: "seasonal",    recurs: true },
  { name: "World Heart Day",                      date: new Date(Date.UTC(2026, 8, 29)), region: "US", category: "health",      recurs: true },
  { name: "National Coffee Day",                  date: new Date(Date.UTC(2026, 8, 29)), region: "US", category: "food",        recurs: true },

  // OCTOBER
  { name: "ADHD Awareness Month",          date: new Date(Date.UTC(2026, 9,  1)), region: "US", category: "health",       recurs: true },
  { name: "Adopt a Dog Month",             date: new Date(Date.UTC(2026, 9,  1)), region: "US", category: "animal",       recurs: true },
  { name: "Breast Cancer Awareness Month", date: new Date(Date.UTC(2026, 9,  1)), region: "US", category: "health",       recurs: true },
  { name: "Disability Awareness Month",    date: new Date(Date.UTC(2026, 9,  1)), region: "US", category: "social_cause", recurs: true },
  { name: "Sober October",                 date: new Date(Date.UTC(2026, 9,  1)), region: "US", category: "health",       recurs: true },
  { name: "World Animal Day",              date: new Date(Date.UTC(2026, 9,  4)), region: "US", category: "animal",    recurs: true },
  { name: "National Taco Day",             date: new Date(Date.UTC(2026, 9,  4)), region: "US", category: "food",      recurs: true },
  { name: "World Mental Health Day",       date: new Date(Date.UTC(2026, 9, 10)), region: "US", category: "awareness", recurs: true },
  { name: "Halloween",                     date: new Date(Date.UTC(2026, 9, 31)), region: "US", category: "holiday",   recurs: true },

  // NOVEMBER
  { name: "Alzheimer's Awareness Month",   date: new Date(Date.UTC(2026, 10,  1)), region: "US", category: "health",       recurs: true },
  { name: "Diabetes Awareness Month",      date: new Date(Date.UTC(2026, 10,  1)), region: "US", category: "health",       recurs: true },
  { name: "Movember",                      date: new Date(Date.UTC(2026, 10,  1)), region: "US", category: "health",       recurs: true },
  { name: "Native American Heritage Month", date: new Date(Date.UTC(2026, 10,  1)), region: "US", category: "social_cause", recurs: true },
  { name: "No Shave November",             date: new Date(Date.UTC(2026, 10,  1)), region: "US", category: "health",       recurs: true },
  { name: "Veterans Awareness Month",      date: new Date(Date.UTC(2026, 10,  1)), region: "US", category: "social_cause", recurs: true },
  { name: "Day of the Dead",  date: new Date(Date.UTC(2026, 10,  2)), region: "US", category: "religious",   recurs: true },
  { name: "Veterans Day",     date: new Date(Date.UTC(2026, 10, 11)), region: "US", category: "holiday",     recurs: true },
  { name: "World Diabetes Day", date: new Date(Date.UTC(2026, 10, 14)), region: "US", category: "health",    recurs: true },
  { name: "Thanksgiving",     date: new Date(Date.UTC(2026, 10, 26)), region: "US", category: "holiday",     recurs: true },
  { name: "Black Friday",     date: new Date(Date.UTC(2026, 10, 27)), region: "US", category: "pop_culture", recurs: true },
  { name: "National Cat Day", date: new Date(Date.UTC(2026, 10, 29)), region: "US", category: "animal",      recurs: true },

  // DECEMBER
  { name: "Crohn's & Colitis Awareness Week", date: new Date(Date.UTC(2026, 11,  1)), region: "US", category: "health", recurs: true },
  { name: "Hanukkah",         date: new Date(Date.UTC(2026, 11, 14)), region: "US", category: "religious",   recurs: true },
  { name: "Ugly Sweater Day", date: new Date(Date.UTC(2026, 11, 19)), region: "US", category: "pop_culture", recurs: true },
  { name: "Winter Solstice",  date: new Date(Date.UTC(2026, 11, 21)), region: "US", category: "seasonal",    recurs: true },
  { name: "Christmas Day",    date: new Date(Date.UTC(2026, 11, 25)), region: "US", category: "religious",   recurs: true },
  { name: "New Year's Eve",   date: new Date(Date.UTC(2026, 11, 31)), region: "US", category: "holiday",     recurs: true },
]

// ── slugify ───────────────────────────────────────────────────────────────────

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, "")             // apostrophes → nothing ("Father's" → "fathers")
    .replace(/[^a-z0-9\s]/g, " ") // remaining special chars → space
    .trim()
    .replace(/\s+/g, "-")          // whitespace runs → single hyphen
}

// ── collector ─────────────────────────────────────────────────────────────────

export class CalendarCollector implements SourceCollector {
  readonly id = "calendar"
  readonly config: CollectorConfig = {
    id: "calendar",
    enabled: true,
    rateLimit: 0,
    timeout: 5000,
    retries: 0,
  }

  async collect(input: CollectInput): Promise<SourceEventInput[]> {
    const now = new Date()
    const total = EVENTS.length
    const futureEvents = EVENTS.filter((e) => e.date >= now)
    const future = futureEvents.length

    console.log(
      `[calendar.collector] Starting — ${total} events, ${future} upcoming`
    )
    const startTime = Date.now()

    const DAY_MS = 1000 * 60 * 60 * 24

    const mapped: SourceEventInput[] = futureEvents.map((event) => {
      const daysUntilEvent = Math.ceil(
        (event.date.getTime() - now.getTime()) / DAY_MS
      )
      const urgencyLevel: UrgencyLevel = urgency(daysUntilEvent)
      const uploadWindows = {
        amazon: {
          start: subWeeks(event.date, 8),
          end: subWeeks(event.date, 4),
        },
        etsy: {
          start: subWeeks(event.date, 10),
          end: subWeeks(event.date, 6),
        },
        redbubble: {
          start: subWeeks(event.date, 9),
          end: subWeeks(event.date, 5),
        },
      }

      return {
        source: "calendar",
        externalId: `${slugify(event.name)}-2026`,
        sourceUrl: undefined,
        title: event.name,
        body: undefined,
        observedAt: now,
        metrics: {
          date: event.date.toISOString(),
          daysUntilEvent,
          urgency: urgencyLevel,
          category: event.category,
          region: event.region,
          uploadWindows: {
            amazon: {
              start: uploadWindows.amazon.start.toISOString(),
              end: uploadWindows.amazon.end.toISOString(),
            },
            etsy: {
              start: uploadWindows.etsy.start.toISOString(),
              end: uploadWindows.etsy.end.toISOString(),
            },
            redbubble: {
              start: uploadWindows.redbubble.start.toISOString(),
              end: uploadWindows.redbubble.end.toISOString(),
            },
          },
        },
        raw: { ...event, daysUntilEvent },
      }
    })

    // Sort ascending by daysUntilEvent (nearest event first)
    mapped.sort(
      (a, b) =>
        (a.metrics["daysUntilEvent"] as number) -
        (b.metrics["daysUntilEvent"] as number)
    )

    const limited = input.limit ? mapped.slice(0, input.limit) : mapped

    console.log(
      `[calendar.collector] Complete — ${limited.length} source events in ${
        Date.now() - startTime
      }ms`
    )
    return limited
  }
}
