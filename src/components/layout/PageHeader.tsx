import { ChevronLeft, MoreVertical, ChevronRight, Search, CircleHelp } from "lucide-react";
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


type ContextualHelp = {
  title: string;
  why: string;
  how: string[];
};

const CONTEXTUAL_HELP: Record<string, ContextualHelp> = {
  dashboard: {
    title: "Dashboard overview",
    why: "Use this page to understand QMS health at a glance and quickly spot priorities.",
    how: [
      "Start with compliance and risk cards to identify urgent gaps.",
      "Tap any card metric to drill down into its underlying list.",
      "Review trends before opening detail pages to act with context.",
    ],
  },
  processes: {
    title: "Processes",
    why: "Processes are the backbone of compliance tracking and requirement allocation.",
    how: [
      "Create or edit process activities and allocate ISO requirements.",
      "Link risks, actions, documents, and regulations to each process.",
      "Use process detail to monitor evidence and close compliance gaps.",
    ],
  },
  documents: {
    title: "Documents",
    why: "Documents and procedures provide compliance evidence for requirements and processes.",
    how: [
      "Open a procedure and verify linked processes and ISO clauses.",
      "Use related docs to organize forms, records, and instructions.",
      "Keep statuses and revisions updated to maintain traceability.",
    ],
  },
  issues: {
    title: "Issues and risks",
    why: "Risks, opportunities, and issues drive preventive and corrective action planning.",
    how: [
      "Evaluate impact/probability and set treatment strategy.",
      "Link each issue to the right process and responsible owner.",
      "Track residual risk after actions are implemented.",
    ],
  },
  actions: {
    title: "Actions",
    why: "Actions are execution evidence proving risk treatment and continuous improvement.",
    how: [
      "Create actions from issues or process findings.",
      "Assign owners, due dates, and monitor status transitions.",
      "Evaluate effectiveness before final closure.",
    ],
  },
  settings: {
    title: "Settings",
    why: "Settings centralize account, standards, and system-level preferences.",
    how: [
      "Update user profile and reference configuration pages.",
      "Check standard requirement settings for allocation consistency.",
      "Use activity views to audit key changes over time.",
    ],
  },
  "activity-log": {
    title: "Activity log",
    why: "The log provides auditability of key actions performed in the system.",
    how: [
      "Filter by user/date to investigate historical changes.",
      "Use entries as evidence during internal audits.",
      "Correlate log events with revisions in process/doc detail.",
    ],
  },
  help: {
    title: "Help",
    why: "This area explains workflows and best practices for using the QMS tool.",
    how: [
      "Read module guidance before onboarding new users.",
      "Use examples to standardize naming and linking patterns.",
      "Refer back when designing new compliance workflows.",
    ],
  },
};

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
  const [helpOpen, setHelpOpen] = useState(false);
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



  const helpContent = useMemo(() => {
    const section = location.pathname.split("/").filter(Boolean)[0] ?? "dashboard";
    return CONTEXTUAL_HELP[section] ?? {
      title,
      why: subtitle || "Use this page to manage related QMS data and maintain compliance evidence.",
      how: [
        "Review the main content and complete required fields.",
        "Link related entities so traceability and compliance status remain meaningful.",
        "Use filters and search to quickly find and update records.",
      ],
    };
  }, [location.pathname, subtitle, title]);

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
                <nav aria-label="Breadcrumb" className="mb-0.5 overflow-x-auto no-scrollbar">
                  <ol className="flex flex-nowrap items-center gap-1 whitespace-nowrap text-[11px] leading-none text-muted-foreground [&_*]:!min-h-0 [&_*]:!min-w-0">
                    {breadcrumbItems.map((item, index) => (
                      <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1 shrink-0 align-middle whitespace-nowrap">
                        {index > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                        {item.to && index < breadcrumbItems.length - 1 ? (
                          <Link to={item.to} className="inline-flex items-center whitespace-nowrap hover:text-foreground transition-colors">
                            {item.label}
                          </Link>
                        ) : (
                          <span className="inline-flex items-center whitespace-nowrap">{item.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
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
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setHelpOpen(true)} aria-label="Open help">
              <CircleHelp className="h-5 w-5" />
            </Button>
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


      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{helpContent.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">{helpContent.why}</p>
            <div>
              <p className="font-medium mb-2">What to do here</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {helpContent.how.map((tip, index) => (
                  <li key={`${tip}-${index}`}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
