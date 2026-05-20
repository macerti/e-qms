import { Link, useNavigate } from "react-router-dom";
import { HelpCircle, Settings, Activity, User, BookOpen, LogOut, ShieldCheck, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTour } from "@/context/TourContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

const ROLE_LABEL: Record<string, string> = {
  rmq: "RMQ",
  top_management: "Top Management",
  process_owner: "Process Owner",
  auditor_internal: "Internal Auditor",
  auditor_external: "External Auditor",
  contributor: "Contributor",
};

export function UserMenu() {
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();
  const { start } = useTour();

  const initials = (profile?.display_name ?? "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1.5">
          <div className="font-medium">{profile?.display_name ?? "—"}</div>
          {profile?.job_title && (
            <div className="text-xs text-muted-foreground">{profile.job_title}</div>
          )}
          <div className="flex flex-wrap gap-1 pt-1">
            {roles.length > 0 ? (
              roles.map((r) => (
                <Badge key={r} variant="secondary" className="text-[10px] gap-1">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  {ROLE_LABEL[r] ?? r}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-[10px]">No role</Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/user-details" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            User details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/activity-log" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity log
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => start()} className="gap-2">
          <Compass className="h-4 w-4" />
          Take a tour of this page
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/standard-requirements" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Standard requirements
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate("/auth", { replace: true });
          }}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
