import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/core/auth/profileService";
import { profileRepository, type Profile } from "@/core/storage/repositories/profileRepository";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { ArrowLeft, Plus, Trash2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminProfiles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => profileRepository.getAll().then(setProfiles);
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim() || newPin.length < 4) return;
    await profileService.createProfile(newName.trim(), newPin, "user");
    setNewName("");
    setNewPin("");
    setShowCreate(false);
    load();
    toast({ title: "Perfil creado" });
  };

  const remove = async () => {
    if (!deleteId) return;
    const p = await profileRepository.getById(deleteId);
    if (p?.role === "admin") { toast({ title: "No se puede eliminar el admin", variant: "destructive" }); return; }
    await profileRepository.remove(deleteId);
    setDeleteId(null);
    load();
    toast({ title: "Perfil eliminado" });
  };

  const resetPin = async (id: string) => {
    await profileService.removePin(id);
    toast({ title: "PIN reseteado" });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-xl font-bold">Perfiles</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="mr-1 h-4 w-4" />Crear</Button>
      </div>

      {profiles.map((p) => (
        <Card key={p.id}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.role === "admin" ? "👑 Admin" : "👤 Usuario"} · {p.id.slice(0, 8)}…
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => resetPin(p.id)} title="Reset PIN">
              <KeyRound className="h-4 w-4" />
            </Button>
            {p.role !== "admin" && (
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo perfil</DialogTitle></DialogHeader>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">PIN (4 dígitos)</p>
            <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
              <InputOTPGroup>{[0,1,2,3].map(i => <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />)}</InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={create} disabled={!newName.trim() || newPin.length < 4}>Crear</Button>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} title="Eliminar perfil" description="Se borrarán todos sus datos." confirmLabel="Eliminar" destructive onConfirm={remove} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
