import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/layout/AppLayout";
import { LoadingScreen } from "./shared/ui/LoadingScreen";

const WelcomePage = lazy(() => import("./features/onboarding/WelcomePage"));
const ProfileSelectPage = lazy(() => import("./features/profiles/ProfileSelectPage"));
const HomePage = lazy(() => import("./features/home/HomePage"));
const DiaryPage = lazy(() => import("./features/diary/DiaryPage"));
const RecordPage = lazy(() => import("./features/diary/RecordPage"));
const DailyPhotoPage = lazy(() => import("./features/daily-photo/DailyPhotoPage"));
const TimelapsePage = lazy(() => import("./features/daily-photo/TimelapsePage"));
const StorePage = lazy(() => import("./features/store/StorePage"));
const SettingsPage = lazy(() => import("./features/settings/SettingsPage"));
const AdminPage = lazy(() => import("./features/admin/AdminPage"));
const NotFoundPage = lazy(() => import("./features/system/NotFoundPage"));

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="profiles" element={<ProfileSelectPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="diary" element={<DiaryPage />} />
          <Route path="record/:type?" element={<RecordPage />} />
          <Route path="daily-photo" element={<DailyPhotoPage />} />
          <Route path="daily-photo/timelapse" element={<TimelapsePage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="start" element={<Navigate to="/profiles" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
