import { Outlet } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { SideNav } from "./SideNav";

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-background flex">
      {/* Desktop: Side navigation */}
      <SideNav />

      {/* Main content area */}
      <main className="flex-1 min-w-0 pb-safe lg:pb-0 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>

        <footer className="px-4 lg:px-6 py-4 text-center text-xs text-muted-foreground border-t border-border/60 bg-background/80">
          Brought to you by{" "}
          <a
            href="https://macerti.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            Macerti.com
          </a>
        </footer>
      </main>

      {/* Mobile: Bottom navigation */}
      <MobileNav />
    </div>
  );
}
