import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Mic, Lock, Plus, Search, PenLine } from "lucide-react";
import type { ExtendedEntry } from "./types";
import { isUnlocked } from "./types";

export function DiaryHome() {
  const [entries, setEntries] = useState<ExtendedEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    entryRepository.getAll().then((e) => setEntries(e as ExtendedEntry[]));
  }, []);

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
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <h1 className="text-2xl font-bold">📓 Mi Diario</h1>

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
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-4xl">🎬</p>
          <p className="text-muted-foreground">Aún no tienes entradas</p>
          <Button onClick={() => navigate("/record")}>
            <Plus className="mr-1 h-4 w-4" /> Grabar ahora
          </Button>
        </div>
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

      {/* Floating action button */}
      <Button
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
        onClick={() => navigate("/record")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
