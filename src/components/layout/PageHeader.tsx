import { ChevronLeft, MoreVertical, ChevronRight, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/layout/UserMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline";
    icon?: React.ReactNode;
  }[];
  versionInfo?: {
    version: number;
    revisionDate: string;
  };
  breadcrumbs?: { label: string; to?: string }[];
}

const SECTION_LABELS: Record<string, string> = {
  processes: "Processes",
  issues: "Issues",
  actions: "Actions",
  documents: "Documents",
  settings: "Settings",
  help: "Help",
  "activity-log": "Activity Log",
};

const SEARCH_TARGETS = [
  { label: "Processes", path: "/processes" },
  { label: "Issues", path: "/issues" },
  { label: "Actions", path: "/actions" },
  { label: "Documents", path: "/documents" },
  { label: "Settings", path: "/settings" },
  { label: "User details", path: "/settings/user-details" },
  { label: "Standard requirements", path: "/settings/standard-requirements" },
  { label: "Activity log", path: "/activity-log" },
  { label: "Help", path: "/help" },
];

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  actions,
  versionInfo,
  breadcrumbs,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const autoBreadcrumbs = (() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [] as { label: string; to?: string }[];

    const items: { label: string; to?: string }[] = [];
    let pathAcc = "";

    segments.forEach((segment, index) => {
      pathAcc += `/${segment}`;

      if (index === 0) {
        items.push({ label: SECTION_LABELS[segment] ?? segment, to: pathAcc });
        return;
      }

      if (segment === "new") {
        items.push({ label: "New" });
        return;
      }

      if (segment === "edit") {
        items.push({ label: "Edit" });
        return;
      }

      items.push({ label: "Detail" });
    });

    return items;
  })();

  const breadcrumbItems = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : autoBreadcrumbs;

  const filteredSearchTargets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEARCH_TARGETS;
    return SEARCH_TARGETS.filter((target) => target.label.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleSearchNavigate = (path: string) => {
    const q = searchQuery.trim();
    const supportsQuery = ["/processes", "/issues", "/actions", "/documents"].includes(path);
    navigate(supportsQuery && q ? `${path}?q=${encodeURIComponent(q)}` : path);
    setSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0 -ml-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="min-w-0">
              {breadcrumbItems.length > 0 && (
                <div className="flex flex-nowrap items-center gap-1 text-[11px] leading-none text-muted-foreground mb-0.5 overflow-x-auto no-scrollbar whitespace-nowrap [&_*]:!min-h-0 [&_*]:!min-w-0">
                  {breadcrumbItems.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1 shrink-0 align-middle">
                      {index > 0 && <ChevronRight className="w-3 h-3" />}
                      {item.to && index < breadcrumbItems.length - 1 ? (
                        <Link to={item.to} className="inline-flex items-center hover:text-foreground transition-colors">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center">{item.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold truncate">{title}</h1>
                {versionInfo && (
                  <span className="version-badge shrink-0">
                    v{versionInfo.version}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            {actions && actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className={action.variant === "destructive" ? "text-destructive" : ""}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Search for processes, issues, documents..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
            />
            <div className="max-h-[320px] overflow-y-auto space-y-1">
              {filteredSearchTargets.map((target) => (
                <button
                  key={target.path}
                  type="button"
                  onClick={() => handleSearchNavigate(target.path)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{target.label}</span>
                  <p className="text-xs text-muted-foreground">{target.path}</p>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
