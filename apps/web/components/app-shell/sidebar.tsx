import { Flame } from "lucide-react";
import { NavList } from "./nav-list";

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="brand-lockup">
        <div className="brand-mark">
          <Flame size={20} aria-hidden />
        </div>
        <div>
          <p className="brand-eyebrow">Trend Chaser</p>
          <strong>POD Radar</strong>
        </div>
      </div>

      <NavList />

      <div className="sidebar-footer">
        <div className="scan-badge">
          <span className="scan-dot" aria-hidden />
          <span>Last scan: today 00:49</span>
        </div>
      </div>
    </aside>
  );
}
