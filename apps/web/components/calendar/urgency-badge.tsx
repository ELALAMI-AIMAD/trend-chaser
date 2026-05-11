import type { Urgency } from "@/lib/seed-data";
import { urgencyLabel } from "@/lib/format";

const styles: Record<Urgency, string> = {
  "design now": "urgency-badge--now",
  "coming soon": "urgency-badge--soon",
  "plan ahead": "urgency-badge--ahead"
};

type UrgencyBadgeProps = {
  urgency: Urgency;
};

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  return (
    <span className={`urgency-badge ${styles[urgency]}`}>
      {urgencyLabel[urgency]}
    </span>
  );
}
