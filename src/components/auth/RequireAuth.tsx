import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: AppRole[];
}) {
  const { user, loading, roles: userRoles, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Force onboarding when no org yet
  if (!profile?.organization_id && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (roles && roles.length > 0 && !roles.some((r) => userRoles.includes(r))) {
    return (
      <div className="min-h-dvh grid place-items-center p-6 text-center">
        <div className="max-w-sm space-y-2">
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have the required role to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
