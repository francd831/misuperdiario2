import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { AppRoutes } from "@/app/routes/AppRoutes";
import { PackProvider } from "@/core/packs/PackContext";
import { ProfileProvider } from "@/core/auth/ProfileContext";
import "@/assets/styles/tokens.css";
import "@/assets/styles/themes.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProfileProvider>
          <PackProvider>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </PackProvider>
        </ProfileProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
