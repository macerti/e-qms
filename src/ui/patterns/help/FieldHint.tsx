import type { PropsWithChildren } from "react";

export function FieldHint({ children }: PropsWithChildren) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
