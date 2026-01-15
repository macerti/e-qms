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
  { path: "/documents", label: "Documents", icon: FileText },
];

export function SideNav() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="font-serif text-xl font-semibold">eQMS</h1>
        <p className="text-xs text-sidebar-foreground/70 mt-1">ISO 9001 Management</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isCurrentPath = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isCurrentPath 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isCurrentPath && "text-sidebar-primary"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          v1.0.0 • ISO 9001:2015
        </p>
      </div>
    </aside>
  );
}
