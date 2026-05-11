export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Desktop shell */}
      <div className="app-shell">
        <Sidebar />
        <div className="workspace">{children}</div>
      </div>

      {/* Mobile shell — shown via CSS media query, hidden on desktop */}
      <div className="mobile-shell">
        <MobileNav />
        <div className="workspace">{children}</div>
      </div>
    </>
  );
}
