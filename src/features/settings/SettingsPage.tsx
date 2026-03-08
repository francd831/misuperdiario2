import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Palette, Volume2, HardDrive, Shield, LogOut, UserPlus } from "lucide-react";
import { LongPress } from "@/app/components/LongPress";
import { profileRepository } from "@/core/storage/repositories/profileRepository";
import { profileService } from "@/core/auth/profileService";
import { usePack } from "@/core/packs/PackContext";
import { useProfile } from "@/core/auth/ProfileContext";
import { dbList } from "@/core/storage/indexeddb";
import { useToast } from "@/hooks/use-toast";

export function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeProfile, logout } = useProfile();
  const [profileName, setProfileName] = useState("");
  const { activePack: activePackObj } = usePack();
  const [activePack, setActivePack] = useState("");
  const [storageInfo, setStorageInfo] = useState("");
  const [newPin, setNewPin] = useState("");
  const [ambientSound, setAmbientSound] = useState(false);

  const isAdmin = activeProfile?.role === "admin";

  useEffect(() => {
    if (activePackObj) setActivePack(activePackObj.name);
  }, [activePackObj]);

  useEffect(() => {
    if (!activeProfile) return;
    setProfileName(activeProfile.name);
    const load = async () => {
      const entries = await dbList("entries");
      const photos = await dbList("daily_photos");
      const myEntries = entries.filter((e: any) => e.profileId === activeProfile.id);
      const myPhotos = photos.filter((p: any) => p.profileId === activeProfile.id);
      setStorageInfo(`${myEntries.length} entradas · ${myPhotos.length} fotos`);
    };
    load();
  }, [activeProfile]);

  const savePin = async () => {
    if (!activeProfile) return;
    if (newPin.length !== 4) { toast({ title: "El PIN debe tener 4 dígitos", variant: "destructive" }); return; }
    await profileService.resetPin(activeProfile.id, newPin);
    toast({ title: "PIN actualizado" });
    setNewPin("");
  };

  const saveName = async () => {
    if (!activeProfile) return;
    await profileRepository.save({ ...activeProfile, name: profileName });
    toast({ title: "Nombre guardado" });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">⚙️ Ajustes</h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Cambiar perfil
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Settings className="h-4 w-4" />Perfil</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nombre" className="flex-1" />
            <Button onClick={saveName} size="sm">Guardar</Button>
          </div>
          <div className="flex gap-2">
            <Input type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} placeholder="Nuevo PIN (4 dígitos)" className="flex-1" />
            <Button onClick={savePin} size="sm" variant="outline">Cambiar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4" />Tema</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Pack activo: <span className="font-medium text-foreground">{activePack}</span></p>
          <Button variant="outline" size="sm" onClick={() => navigate("/store")}>Cambiar en tienda</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Volume2 className="h-4 w-4" />Audio</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={ambientSound} onCheckedChange={setAmbientSound} id="ambient" />
            <Label htmlFor="ambient">Sonido ambiente</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><HardDrive className="h-4 w-4" />Almacenamiento</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{storageInfo}</p>
        </CardContent>
      </Card>

      {/* Hidden admin access */}
      {isAdmin ? (
        <Button variant="outline" className="gap-2" onClick={() => navigate("/admin")}>
          <Shield className="h-4 w-4" /> Panel de administración
        </Button>
      ) : (
        <LongPress onLongPress={() => navigate("/admin-lock")} duration={2500}>
          <div className="flex items-center justify-center py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </LongPress>
      )}
    </div>
  );
}
