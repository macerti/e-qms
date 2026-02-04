import { History, User } from "lucide-react";
import { format } from "date-fns";
import { RevisionEntry } from "@/types/management-system";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RevisionHistoryProps {
  currentVersion: number;
  currentDate: string;
  currentNote?: string;
  history?: RevisionEntry[];
}

const MAX_VISIBLE_REVISIONS = 4;
const REVISION_ITEM_HEIGHT = 56; // Approximate height per revision entry

export function RevisionHistory({ 
  currentVersion, 
  currentDate, 
  currentNote,
  history = [] 
}: RevisionHistoryProps) {
  // Combine current revision with history, sort by date descending
  const allRevisions: RevisionEntry[] = [
    {
      id: "current",
      version: currentVersion,
      date: currentDate,
      note: currentNote || "Current version",
    },
    ...history.filter(h => h.version !== currentVersion),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allRevisions.length === 0) {
    return null;
  }

  const showScrollArea = allRevisions.length > MAX_VISIBLE_REVISIONS;
  const maxHeight = MAX_VISIBLE_REVISIONS * REVISION_ITEM_HEIGHT;

  const RevisionList = () => (
    <ol className="space-y-3 relative">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
      
      {allRevisions.map((revision, index) => (
        <li key={revision.id} className="relative flex gap-3 pl-6">
          {/* Timeline dot */}
          <div 
            className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 bg-background ${
              index === 0 
                ? "border-primary" 
                : "border-muted-foreground/30"
            }`}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">
                v{revision.version}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(revision.date), "dd MMM yyyy, HH:mm")}
              </span>
              {revision.userName && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  {revision.userName}
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5 text-foreground">
              {revision.note}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <section className="mobile-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Revision History
          </h3>
        </div>
        {showScrollArea && (
          <span className="text-xs text-muted-foreground">
            {allRevisions.length} revisions
          </span>
        )}
      </div>
      
      {showScrollArea ? (
        <ScrollArea className="pr-4" style={{ maxHeight }}>
          <RevisionList />
        </ScrollArea>
      ) : (
        <RevisionList />
      )}
      
      {allRevisions.length === 1 && (
        <p className="text-xs text-muted-foreground mt-3 italic">
          This is the initial version. Revision history will appear here as changes are made.
        </p>
      )}
    </section>
  );
}
