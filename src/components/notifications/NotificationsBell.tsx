import { useEffect, useState } from "react";
import { Bell, BellRing, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link_path: string | null;
  read_at: string | null;
  created_at: string;
}

const KIND_LABEL: Record<string, string> = {
  action_due: "Action due",
  review_due: "Review due",
  audit_scheduled: "Audit scheduled",
  audit_starting: "Audit starting",
  signature_requested: "Signature requested",
  kpi_failed: "KPI failed",
  finding_assigned: "Finding assigned",
  mention: "Mention",
};

export function NotificationsBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as Notification[]);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel("notif")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        load
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unread = items.filter((i) => !i.read_at).length;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  };

  const markAll = async () => {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          {unread > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
              {unread > 0 && <Badge variant="secondary">{unread}</Badge>}
            </SheetTitle>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAll} className="h-7 text-xs">
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
          {items.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Inbox className="h-8 w-8 mx-auto mb-3 opacity-40" />
              You're all caught up
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const content = (
                  <div className={`p-3 ${!n.read_at ? "bg-primary/[0.03]" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {KIND_LABEL[n.kind] ?? n.kind}
                      </div>
                      <div className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="font-medium text-sm mt-0.5">{n.title}</div>
                    {n.body && <div className="text-xs text-muted-foreground mt-1">{n.body}</div>}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link_path ? (
                      <Link
                        to={n.link_path}
                        onClick={() => {
                          markRead(n.id);
                          setOpen(false);
                        }}
                        className="block hover:bg-muted/40 transition"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        onClick={() => markRead(n.id)}
                        className="block w-full text-left hover:bg-muted/40 transition"
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
