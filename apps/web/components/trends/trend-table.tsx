import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { TrendSignal } from "@/lib/seed-data";
import { routes } from "@/lib/routes";
import { temperatureLabel } from "@/lib/format";
import { SafetyBadge } from "./safety-badge";

type TrendTableProps = {
  trends: TrendSignal[];
};

export function TrendTable({ trends }: TrendTableProps) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: "var(--border)" }}>
            <TableHead style={{ color: "var(--text-muted)" }}>Phrase</TableHead>
            <TableHead style={{ color: "var(--text-muted)" }}>Niche</TableHead>
            <TableHead style={{ color: "var(--text-muted)" }}>Temp</TableHead>
            <TableHead style={{ color: "var(--text-muted)" }}>Score</TableHead>
            <TableHead style={{ color: "var(--text-muted)" }}>Momentum</TableHead>
            <TableHead style={{ color: "var(--text-muted)" }}>Window</TableHead>
            <TableHead style={{ color: "var(--text-muted)" }}>Safety</TableHead>
            <TableHead style={{ color: "var(--text-muted)" }}>Platforms</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trends.map((trend) => (
            <TableRow
              key={trend.id}
              style={{ borderColor: "var(--border)", cursor: "pointer" }}
            >
              <TableCell>
                <Link
                  href={routes.trend(trend.id)}
                  style={{ fontWeight: 600 }}
                >
                  {trend.phrase}
                </Link>
              </TableCell>
              <TableCell style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {trend.niche}
              </TableCell>
              <TableCell>
                <span className={`temp-badge ${trend.temperature}`}>
                  {temperatureLabel[trend.temperature]}
                </span>
              </TableCell>
              <TableCell>
                <strong>{trend.score}</strong>
              </TableCell>
              <TableCell style={{ color: "var(--text-muted)" }}>
                {trend.momentum}
              </TableCell>
              <TableCell style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                {trend.uploadWindow}
              </TableCell>
              <TableCell>
                <SafetyBadge verdict={trend.safetyVerdict} notes={trend.safetyNotes} />
              </TableCell>
              <TableCell>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {trend.platforms.map((p) => (
                    <span className="quiet-badge" key={p} style={{ fontSize: "0.7rem" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
