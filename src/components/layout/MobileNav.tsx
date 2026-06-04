import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Workflow, ClipboardCheck, ShieldCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: LayoutDashboard },
  { path: "/processes", label: "Processes", icon: Workflow },
  { path: "/audits", label: "Audits", icon: ClipboardCheck },
  { path: "/tools", label: "Tools", icon: ShieldCheck },
  { path: "/documents", label: "Docs", icon: FileText },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around max-w-lg mx-auto list-stagger" style={{ paddingBottom: "var(--safe-area-bottom)" }}>
        {navItems.map((item) => {
          const isToolsPath = ["/tools", "/issues", "/actions"].some((path) => location.pathname.startsWith(path));
          const isCBPath = location.pathname.startsWith("/cb");
          const isCurrentPath =
            item.path === "/tools"
              ? isToolsPath
              : item.path === "/cb"
              ? isCBPath
              : location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "joy relative flex flex-col items-center justify-center py-2 px-3 min-h-[4.5rem] flex-1 transition-colors no-select",
                isCurrentPath ? "text-accent" : "text-muted-foreground active:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1 transition-transform duration-300", isCurrentPath ? "scale-110 anim-breathe" : "")} />
              <span className="text-xs font-medium">{item.label}</span>
              {isCurrentPath && (
                <span
                  aria-hidden
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent anim-glow"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
