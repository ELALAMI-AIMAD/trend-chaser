import { TopBar } from "@/components/app-shell/top-bar";
import { CalendarMonth } from "@/components/calendar/calendar-month";
import { calendarOpportunities } from "@/lib/seed-data";

export default function CalendarPage() {
  const designNow = calendarOpportunities.filter((e) => e.urgency === "design now");
  const comingSoon = calendarOpportunities.filter((e) => e.urgency === "coming soon");
  const planAhead = calendarOpportunities.filter((e) => e.urgency === "plan ahead");

  return (
    <>
      <TopBar title="Niche calendar" eyebrow="Upload windows" />

      <CalendarMonth title="Design now" events={designNow} />
      <CalendarMonth title="Coming soon" events={comingSoon} />
      <CalendarMonth title="Plan ahead" events={planAhead} />
    </>
  );
}
