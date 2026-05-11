import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SafetyVerdict } from "@/lib/seed-data";
import { safetyLabel } from "@/lib/format";

const icons: Record<SafetyVerdict, typeof ShieldCheck> = {
  safe: ShieldCheck,
  review: ShieldAlert,
  blocked: ShieldOff
};

const styles: Record<SafetyVerdict, string> = {
  safe: "safety-badge--safe",
  review: "safety-badge--review",
  blocked: "safety-badge--blocked"
};

type SafetyBadgeProps = {
  verdict: SafetyVerdict;
  notes?: string;
};

export function SafetyBadge({ verdict, notes }: SafetyBadgeProps) {
  const Icon = icons[verdict];
  const badge = (
    <span className={`safety-badge ${styles[verdict]}`}>
      <Icon size={13} aria-hidden />
      {safetyLabel[verdict]}
    </span>
  );

  if (!notes) return badge;

  return (
    <Tooltip>
      <TooltipTrigger render={badge} />
      <TooltipContent side="top" className="tooltip-dark">
        {notes}
      </TooltipContent>
    </Tooltip>
  );
}
