import type { CalendarOpportunity } from "@/lib/seed-data";
import { CalendarEventCard } from "./calendar-event-card";

type CalendarMonthProps = {
  events: CalendarOpportunity[];
  title?: string;
};

export function CalendarMonth({ events, title }: CalendarMonthProps) {
  if (events.length === 0) {
    return (
      <div className="empty-state">No events for this period.</div>
    );
  }

  return (
    <section className="section-block">
      {title && (
        <div className="section-heading">
          <h2>{title}</h2>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        </div>
      )}
      <div className="calendar-grid-full">
        {events.map((event) => (
          <CalendarEventCard event={event} key={event.id} />
        ))}
      </div>
    </section>
  );
}
