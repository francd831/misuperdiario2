import { Routes, Route } from "react-router-dom";
import { DiaryHome } from "@/features/diary/DiaryHome";
import { RecordSelector } from "@/features/diary/RecordSelector";
import { RecordVideo } from "@/features/diary/RecordVideo";
import { RecordAudio } from "@/features/diary/RecordAudio";
import { RecordText } from "@/features/diary/RecordText";
import { EntryDetail } from "@/features/diary/EntryDetail";
import { PhotoList } from "@/features/dailyPhoto/PhotoList";
import { PhotoCapture } from "@/features/dailyPhoto/PhotoCapture";
import { PhotoDetail } from "@/features/dailyPhoto/PhotoDetail";
import { TimelapsePlayer } from "@/features/dailyPhoto/TimelapsePlayer";
import { PackStore } from "@/features/store/PackStore";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { AdminLock } from "@/features/admin/AdminLock";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { AdminProfiles } from "@/features/admin/AdminProfiles";
import { AdminContent } from "@/features/admin/AdminContent";
import { AdminSettings } from "@/features/admin/AdminSettings";
import NotFound from "@/pages/NotFound";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<DiaryHome />} />
    <Route path="/record" element={<RecordSelector />} />
    <Route path="/record/video" element={<RecordVideo />} />
    <Route path="/record/audio" element={<RecordAudio />} />
    <Route path="/record/text" element={<RecordText />} />
    <Route path="/entry/:id" element={<EntryDetail />} />
    <Route path="/daily-photo" element={<PhotoList />} />
    <Route path="/daily-photo/capture" element={<PhotoCapture />} />
    <Route path="/daily-photo/timelapse" element={<TimelapsePlayer />} />
    <Route path="/daily-photo/:id" element={<PhotoDetail />} />
    <Route path="/store" element={<PackStore />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/admin-lock" element={<AdminLock />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/profiles" element={<AdminProfiles />} />
    <Route path="/admin/content" element={<AdminContent />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
