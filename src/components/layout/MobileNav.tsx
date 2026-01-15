import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Workflow, 
  AlertTriangle, 
  CheckSquare, 
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { path: "/documents", label: "Docs", icon: FileText },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div 
        className="flex items-center justify-around max-w-lg mx-auto"
        style={{ paddingBottom: "var(--safe-area-bottom)" }}
      >
        {navItems.map((item) => {
          const isCurrentPath = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-h-[4.5rem] flex-1 transition-colors no-select",
                isCurrentPath 
                  ? "text-accent" 
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1 transition-transform",
                isCurrentPath && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
