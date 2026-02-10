import { createContext, useContext, useMemo, useState } from "react";

const TENANT_STORAGE_KEY = "eqms.tenantId";

interface TenantContextValue {
  tenantId: string;
  setTenantId: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantIdState] = useState(() => {
    return localStorage.getItem(TENANT_STORAGE_KEY) || "";
  });

  const setTenantId = (value: string) => {
    const trimmed = value.trim();
    setTenantIdState(trimmed);
    if (trimmed) {
      localStorage.setItem(TENANT_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(TENANT_STORAGE_KEY);
    }
  };

  const value = useMemo(() => ({ tenantId, setTenantId }), [tenantId]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}
