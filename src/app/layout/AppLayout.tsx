import { ReactNode } from "react";
import { AppNavigation } from "../navigation/AppNavigation";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">{children}</main>
      <AppNavigation />
    </div>
  );
};
