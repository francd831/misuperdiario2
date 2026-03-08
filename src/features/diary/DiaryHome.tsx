import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { dbListByIndex } from "@/core/storage/indexeddb";
import { useProfile } from "@/core/auth/ProfileContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Mic, Lock, Search, PenLine, LogOut, Camera, Sparkles } from "lucide-react";
import type { ExtendedEntry } from "./types";
import { isUnlocked } from "./types";
import { DiaryCalendar, type DailyPhotoItem } from "./DiaryCalendar";
import { useAchievements } from "@/features/achievements/useAchievements";
import { StreakIndicator } from "@/features/achievements/StreakIndicator";
import { AchievementBadges } from "@/features/achievements/AchievementBadges";
import { AchievementCelebration } from "@/features/achievements/AchievementCelebration";

const ACTION_CARDS = [
  {
    id: "video",
    label: "Grabar vídeo",
    emoji: "🎬",
    description: "Cuenta tu día en vídeo",
    route: "/record/video",
    gradient: "from-[hsl(265,70%,58%)] to-[hsl(290,60%,50%)]",
  },
  {
    id: "audio",
    label: "Mensaje de voz",
    emoji: "🎙️",
    description: "Graba lo que sientes",
    route: "/record/audio",
    gradient: "from-[hsl(25,95%,55%)] to-[hsl(38,92%,50%)]",
  },
  {
    id: "text",
    label: "Escribir",
    emoji: "✏️",
    description: "Escribe tus pensamientos",
    route: "/record/text",
    gradient: "from-[hsl(174,62%,40%)] to-[hsl(160,60%,46%)]",
  },
  {
    id: "photo",
    label: "Mi foto diaria",
    emoji: "📸",
    description: "Tu foto de hoy",
    route: "/daily-photo/capture",
    gradient: "from-[hsl(340,70%,55%)] to-[hsl(320,60%,50%)]",
  },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 7) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function DiaryHome() {
  const [entries, setEntries] = useState<ExtendedEntry[]>([]);
  const [dailyPhotos, setDailyPhotos] = useState<DailyPhotoItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showEntries, setShowEntries] = useState(false);
  const navigate = useNavigate();
  const { activeProfile, logout } = useProfile();
  const { streak, unlocked, celebration, dismissCelebration } = useAchievements();

  useEffect(() => {
    if (!activeProfile) return;
    entryRepository.getByProfile(activeProfile.id).then((e) => {
      setEntries(e as ExtendedEntry[]);
    });
    dbListByIndex("daily_photos", "by-profile", activeProfile.id).then((p) => {
      setDailyPhotos(
        (p as Array<{ id: string; date: string; caption?: string; createdAt: string }>)
      );
    });
  }, [activeProfile]);

  const filtered = useMemo(() => {
    let list = entries;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => (e.title || e.note || "").toLowerCase().includes(q));
    }
    if (filter === "video") list = list.filter((e) => e.type === "video");
    if (filter === "audio") list = list.filter((e) => e.type === "audio");
    if (filter === "text") list = list.filter((e) => e.type === "text");
    if (filter === "capsule") list = list.filter((e) => e.isLocked);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [entries, search, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, ExtendedEntry[]>();
    for (const e of filtered) {
      const day = e.date || e.createdAt.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(e);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="flex flex-col gap-5 px-4 pb-24 pt-4">
      {/* Celebration modal */}
      {celebration && (
        <AchievementCelebration achievement={celebration} onDismiss={dismissCelebration} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-foreground">
              {activeProfile?.name ?? "Mi Diario"} ✨
            </h1>
          </div>
          <StreakIndicator streak={streak} />
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Hero question */}
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Mi diario</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">
          ¿Qué quieres hacer hoy?
        </h2>
      </div>

      {/* Action cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {ACTION_CARDS.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(action.route)}
            className="group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] hover:shadow-lg"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-90`} />
            <div className="relative z-10 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{action.emoji}</span>
                <p className="text-lg font-bold text-white leading-tight">{action.label}</p>
              </div>
              <p className="text-[11px] text-white/70 leading-tight">{action.description}</p>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-125" />
          </button>
        ))}
      </div>

      {/* Calendar */}
      <DiaryCalendar entries={entries} dailyPhotos={dailyPhotos} />

      {/* Entries section */}
      {entries.length > 0 && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowEntries(!showEntries)}
            className="flex items-center justify-between py-1"
          >
            <h3 className="text-base font-bold text-foreground">
              📓 Ver todo ({entries.length})
            </h3>
            <span className="text-xs font-medium text-primary">
              {showEntries ? "Ocultar" : "Mostrar"}
            </span>
          </button>

          {showEntries && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar entradas…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">Todo</TabsTrigger>
                  <TabsTrigger value="video" className="flex-1">Vídeo</TabsTrigger>
                  <TabsTrigger value="audio" className="flex-1">Voz</TabsTrigger>
                  <TabsTrigger value="text" className="flex-1">Texto</TabsTrigger>
                  <TabsTrigger value="capsule" className="flex-1">🔒</TabsTrigger>
                </TabsList>
              </Tabs>

              {grouped.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No se encontraron entradas
                </p>
              )}

              {grouped.map(([day, items]) => (
                <div key={day}>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    {new Date(day).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <div className="flex flex-col gap-2">
                    {items.map((entry) => (
                      <Card
                        key={entry.id}
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => navigate(`/entry/${entry.id}`)}
                      >
                        <CardContent className="flex items-center gap-3 p-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            {entry.isLocked && !isUnlocked(entry) ? (
                              <Lock className="h-5 w-5 text-primary" />
                            ) : entry.type === "text" ? (
                              <PenLine className="h-5 w-5 text-primary" />
                            ) : entry.type === "audio" ? (
                              <Mic className="h-5 w-5 text-primary" />
                            ) : (
                              <Video className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate font-medium">{entry.title || entry.note || "Sin título"}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.duration ? `${Math.floor(entry.duration / 60)}:${String(Math.floor(entry.duration % 60)).padStart(2, "0")} · ` : ""}
                              {entry.type === "video" ? "Vídeo" : entry.type === "audio" ? "Audio" : "Texto"}
                            </p>
                          </div>
                          {entry.isLocked && !isUnlocked(entry) && (
                            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                              🔒 {entry.unlockAt ? new Date(entry.unlockAt).toLocaleDateString("es") : ""}
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Show latest 3 entries as preview when collapsed */}
          {!showEntries && (
            <div className="flex flex-col gap-2">
              {entries.slice(0, 3).map((entry) => (
                <Card
                  key={entry.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => navigate(`/entry/${entry.id}`)}
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {entry.type === "text" ? (
                        <PenLine className="h-4 w-4 text-primary" />
                      ) : entry.type === "audio" ? (
                        <Mic className="h-4 w-4 text-primary" />
                      ) : (
                        <Video className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{entry.title || entry.note || "Sin título"}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.type === "video" ? "Vídeo" : entry.type === "audio" ? "Audio" : "Texto"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state for no entries */}
      {entries.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            ¡Empieza tu diario eligiendo una opción! 🚀
          </p>
        </div>
      )}
    </div>
  );
}
