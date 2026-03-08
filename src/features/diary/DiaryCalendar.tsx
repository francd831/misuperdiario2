import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Mic, PenLine, Lock, Camera } from "lucide-react";
import type { ExtendedEntry } from "./types";
import { isUnlocked } from "./types";
import { cn } from "@/lib/utils";
import type { DayContentProps } from "react-day-picker";

/** Format a Date as "YYYY-MM-DD" in local time (avoids UTC shift) */
function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Color dot config per entry type */
const TYPE_COLORS: Record<string, string> = {
  video: "bg-[hsl(265,70%,58%)]",
  audio: "bg-[hsl(25,95%,55%)]",
  text: "bg-[hsl(174,62%,46%)]",
  photo: "bg-[hsl(340,70%,55%)]",
  capsule: "bg-[hsl(45,93%,58%)]",
};

export interface DailyPhotoItem {
  id: string;
  date: string;
  caption?: string;
  createdAt: string;
}

interface Props {
  entries: ExtendedEntry[];
  dailyPhotos?: DailyPhotoItem[];
}

export function DiaryCalendar({ entries, dailyPhotos = [] }: Props) {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>();

  // Map: "YYYY-MM-DD" → set of types present that day
  const dayTypesMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of entries) {
      // For locked capsules, mark on the unlock date instead of creation date
      if (e.isLocked && e.unlockAt) {
        const unlockDay = e.unlockAt.slice(0, 10);
        if (!map.has(unlockDay)) map.set(unlockDay, new Set());
        map.get(unlockDay)!.add("capsule");
      } else {
        const day = e.date || e.createdAt.slice(0, 10);
        if (!map.has(day)) map.set(day, new Set());
        const types = map.get(day)!;
        if (e.type) types.add(e.type);
      }
    }
    for (const p of dailyPhotos) {
      const day = p.date;
      if (!map.has(day)) map.set(day, new Set());
      map.get(day)!.add("photo");
    }
    return map;
  }, [entries, dailyPhotos]);

  // Days that have content
  const daysWithContent = useMemo(() => {
    return Array.from(dayTypesMap.keys()).map((d) => new Date(d + "T00:00:00"));
  }, [dayTypesMap]);

  // Entries + photos for selected day
  const selectedDayEntries = useMemo(() => {
    if (!selectedDay) return [];
    const key = toLocalDateKey(selectedDay);
    return entries
      .filter((e) => (e.date || e.createdAt.slice(0, 10)) === key)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [selectedDay, entries]);

  const selectedDayPhotos = useMemo(() => {
    if (!selectedDay) return [];
    const key = toLocalDateKey(selectedDay);
    return dailyPhotos.filter((p) => p.date === key);
  }, [selectedDay, dailyPhotos]);

  const selectedDayKey = selectedDay ? toLocalDateKey(selectedDay) : undefined;

  // Custom day content with colored dots
  function DayWithDots(props: DayContentProps) {
    const dayKey = toLocalDateKey(props.date);
    const types = dayTypesMap.get(dayKey);

    return (
      <div className="relative flex flex-col items-center">
        <span>{props.date.getDate()}</span>
        {types && types.size > 0 && (
          <div className="absolute -bottom-1 flex gap-[2px]">
            {Array.from(types).slice(0, 4).map((t) => (
              <span
                key={t}
                className={cn("h-1.5 w-1.5 rounded-full", TYPE_COLORS[t] ?? "bg-primary")}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-bold text-foreground">📅 Calendario</h3>

      <div className="flex flex-col md:flex-row gap-3 md:items-start">
        {/* Calendar card — only as wide as needed */}
        <Card className="shrink-0 md:w-auto">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              className="pointer-events-auto"
              modifiers={{ hasContent: daysWithContent }}
              modifiersClassNames={{
                hasContent: "font-bold",
              }}
              components={{
                DayContent: DayWithDots,
              }}
            />

            {/* Legend */}
            <div className="flex flex-wrap gap-3 px-3 pb-2 pt-1">
              {[
                { key: "video", label: "Vídeo" },
                { key: "audio", label: "Voz" },
                { key: "text", label: "Texto" },
                { key: "photo", label: "Foto" },
                { key: "capsule", label: "Cápsula" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-1">
                  <span className={cn("h-2 w-2 rounded-full", TYPE_COLORS[item.key])} />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected day entries — right side on desktop, below on mobile */}
        {selectedDay && (
          <div key={toLocalDateKey(selectedDay)} className="flex flex-1 flex-col gap-2 animate-fade-in min-w-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground animate-fade-in">
              {selectedDay.toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            {selectedDayEntries.length === 0 && selectedDayPhotos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 animate-fade-in">
                Sin entradas este día
              </p>
            ) : (
              <>
                {/* Daily photos */}
                {selectedDayPhotos.map((photo, i) => (
                  <Card
                    key={photo.id}
                    className="cursor-pointer transition-shadow hover:shadow-md animate-scale-in"
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
                    onClick={() => navigate(`/daily-photo/${photo.id}`)}
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(340,70%,55%)]/10">
                        <Camera className="h-5 w-5 text-[hsl(340,70%,55%)]" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">
                          {photo.caption || "Foto diaria"}
                        </p>
                        <p className="text-xs text-muted-foreground">Foto diaria</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Diary entries */}
                {selectedDayEntries.map((entry, i) => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer transition-shadow hover:shadow-md animate-scale-in"
                    style={{ animationDelay: `${(selectedDayPhotos.length + i) * 60}ms`, animationFillMode: "backwards" }}
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
                        <p className="truncate font-medium">
                          {entry.title || entry.note || "Sin título"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.duration
                            ? `${Math.floor(entry.duration / 60)}:${String(
                                Math.floor(entry.duration % 60)
                              ).padStart(2, "0")} · `
                            : ""}
                          {entry.type === "video"
                            ? "Vídeo"
                            : entry.type === "audio"
                            ? "Audio"
                            : "Texto"}
                        </p>
                      </div>
                      {entry.isLocked && !isUnlocked(entry) && (
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          🔒{" "}
                          {entry.unlockAt
                            ? new Date(entry.unlockAt).toLocaleDateString("es")
                            : ""}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
