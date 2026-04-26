import { ReactNode } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { Providers } from "../../components/providers";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AuthGate>
        <AppShell>{children}</AppShell>
      </AuthGate>
    </Providers>
  );
}
