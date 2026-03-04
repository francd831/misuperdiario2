import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

// Feature pages — stubbed for now
const CameraPage = () => (
  <div className="flex min-h-screen items-center justify-center pb-16">
    <p className="text-muted-foreground">📷 Cámara — próximamente</p>
  </div>
);

const TimelapsePage = () => (
  <div className="flex min-h-screen items-center justify-center pb-16">
    <p className="text-muted-foreground">⏱ Timelapse — próximamente</p>
  </div>
);

const SettingsPage = () => (
  <div className="flex min-h-screen items-center justify-center pb-16">
    <p className="text-muted-foreground">⚙️ Ajustes — próximamente</p>
  </div>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/camera" element={<CameraPage />} />
    <Route path="/timelapse" element={<TimelapsePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
