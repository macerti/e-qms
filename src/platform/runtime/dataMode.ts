export type AppDataMode = "demo" | "real";

export const appDataMode: AppDataMode = import.meta.env.VITE_APP_DATA_MODE === "real" ? "real" : "demo";
export const isDemoMode = appDataMode === "demo";
