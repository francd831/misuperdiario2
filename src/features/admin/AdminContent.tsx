import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { profileRepository, type Profile } from "@/core/storage/repositories/profileRepository";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Video, Mic, Lock, Play } from "lucide-react";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import type { ExtendedEntry } from "@/features/diary/types";
import { useToast } from "@/hooks/use-toast";

export function AdminContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ExtendedEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setEntries((await entryRepository.getAll()) as ExtendedEntry[]);
    setProfiles(await profileRepository.getAll());
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterProfile !== "all") list = list.filter((e) => e.profileId === filterProfile);
    if (filterType === "video") list = list.filter((e) => e.type === "video");
    if (filterType === "audio") list = list.filter((e) => e.type === "audio");
    if (filterType === "locked") list = list.filter((e) => e.isLocked);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [entries, filterProfile, filterType]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await entryRepository.remove(deleteId);
    setDeleteId(null);
    load();
    toast({ title: "Entrada eliminada" });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="flex-1 text-xl font-bold">Contenido ({filtered.length})</h1>
      </div>

      <div className="flex gap-2">
        <Select value={filterProfile} onValueChange={setFilterProfile}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="Perfil" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="locked">🔒</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.map((entry) => {
        const mediaUrl = entry.mediaBlob ? URL.createObjectURL(entry.mediaBlob) : null;
        return (
          <Card key={entry.id}>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {entry.isLocked ? <Lock className="h-5 w-5 text-primary" /> : entry.type === "audio" ? <Mic className="h-5 w-5 text-primary" /> : <Video className="h-5 w-5 text-primary" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{entry.title || entry.note || "Sin título"}</p>
                <p className="text-xs text-muted-foreground">{entry.date} · {entry.profileId}</p>
              </div>
              {/* Admin can always play */}
              {mediaUrl && (
                <Button variant="ghost" size="icon" onClick={() => navigate(`/entry/${entry.id}`)}>
                  <Play className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(entry.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">Sin contenido</p>}

      <ConfirmDialog open={!!deleteId} title="Eliminar entrada" confirmLabel="Eliminar" destructive onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
