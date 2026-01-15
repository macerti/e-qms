import { Outlet } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop: Side navigation */}
      <SideNav />
      
      {/* Main content area */}
      <main className="flex-1 min-w-0 pb-safe lg:pb-0">
        <Outlet />
      </main>
      
      {/* Mobile: Bottom navigation */}
      <MobileNav />
    </div>
  );
}
