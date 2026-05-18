import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "rmq"
  | "top_management"
  | "process_owner"
  | "auditor_internal"
  | "auditor_external"
  | "contributor";

export interface Profile {
  id: string;
  display_name: string;
  job_title: string | null;
  organization_id: string | null;
  onboarded_at: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileAndRoles = async (uid: string) => {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    setProfile(p ?? null);
    if (p?.organization_id) {
      const { data: r } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("organization_id", p.organization_id);
      setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
    } else {
      setRoles([]);
    }
  };

  useEffect(() => {
    // 1. Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer to avoid deadlocks
        setTimeout(() => loadProfileAndRoles(s.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    // 2. Then check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfileAndRoles(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
        hasRole: (r) => roles.includes(r),
        reload: async () => {
          if (user) await loadProfileAndRoles(user.id);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
