import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Workflow,
  AlertTriangle,
  CheckSquare,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/processes", label: "Processes", icon: Workflow },
  { path: "/issues", label: "Issues", icon: AlertTriangle },
  { path: "/actions", label: "Actions", icon: CheckSquare },
  { path: "/documents", label: "Documents", icon: FileText },
];

export function SideNav() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 self-stretch min-h-dvh bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo/Brand */}
      <div className={cn("border-b border-sidebar-border", collapsed ? "p-3" : "p-6")}>
        <div className="flex items-center justify-between gap-2">
          <h1 className={cn("font-serif font-semibold", collapsed ? "text-sm" : "text-xl")}>{collapsed ? "Q" : "eQMS"}</h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((prev) => !prev)}
            className="h-8 w-8 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
        {!collapsed && <p className="text-xs text-sidebar-foreground/70 mt-1">ISO 9001 Management</p>}
      </div>

      {/* Navigation Links */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-4")}>
        {navItems.map((item) => {
          const isCurrentPath = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg transition-colors",
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                isCurrentPath
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isCurrentPath && "text-sidebar-primary")} />
              {!collapsed && <span className="font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-sidebar-border", collapsed ? "p-2" : "p-4")}>
        {!collapsed ? (
          <p className="text-xs text-sidebar-foreground/50 text-center">v1.0.0 • ISO 9001:2015</p>
        ) : (
          <p className="text-[10px] text-sidebar-foreground/50 text-center">v1</p>
        )}
      </div>
    </aside>
  );
}
