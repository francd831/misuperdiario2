import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings, Palette, Volume2, HardDrive, LogOut, Camera, RefreshCw, KeyRound } from "lucide-react";
import { profileRepository } from "@/core/storage/repositories/profileRepository";
import { profileService } from "@/core/auth/profileService";
import { usePack } from "@/core/packs/PackContext";
import { useProfile } from "@/core/auth/ProfileContext";
import { dbList } from "@/core/storage/indexeddb";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "@/features/profiles/ProfileAvatar";
import { AvatarPicker } from "@/features/profiles/AvatarPicker";
import { ambientEngine } from "@/core/media/ambient/ambientEngine";

const AMBIENT_KEY = "vd_ambient_enabled";
const AMBIENT_VOL_KEY = "vd_ambient_volume";

export function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeProfile, logout, refresh } = useProfile();
  const [profileName, setProfileName] = useState("");
  const { activePack: activePackObj } = usePack();
  const [activePack, setActivePack] = useState("");
  const [storageInfo, setStorageInfo] = useState("");
  const [newPin, setNewPin] = useState("");
  const [ambientSound, setAmbientSound] = useState(() => localStorage.getItem(AMBIENT_KEY) === "1");
  const [ambientVolume, setAmbientVolume] = useState(() => parseInt(localStorage.getItem(AMBIENT_VOL_KEY) || "60", 10));
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

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
    refresh();
  };

  const handleAvatarSelect = async (avatar: string) => {
    if (!activeProfile) return;
    await profileRepository.save({ ...activeProfile, avatar: avatar || undefined });
    toast({ title: "Avatar actualizado" });
    refresh();
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
        <CardContent className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="relative group"
            >
              <ProfileAvatar
                avatar={activeProfile?.avatar}
                name={activeProfile?.name ?? ""}
                size="lg"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="text-xs text-primary font-medium"
            >
              Cambiar avatar
            </button>
          </div>
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
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={ambientSound}
              onCheckedChange={(checked) => {
                setAmbientSound(checked);
                localStorage.setItem(AMBIENT_KEY, checked ? "1" : "0");
                if (checked && activePackObj) {
                  ambientEngine.start(activePackObj.id);
                  ambientEngine.setVolume(ambientVolume / 100);
                } else {
                  ambientEngine.stop();
                }
              }}
              id="ambient"
            />
            <Label htmlFor="ambient">Sonido ambiente</Label>
          </div>
          {ambientSound && (
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                min={10}
                max={100}
                step={5}
                value={[ambientVolume]}
                onValueChange={([v]) => {
                  setAmbientVolume(v);
                  localStorage.setItem(AMBIENT_VOL_KEY, String(v));
                  ambientEngine.setVolume(v / 100);
                }}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">{ambientVolume}%</span>
            </div>
          )}
          {ambientSound && activePackObj && (
            <p className="text-xs text-muted-foreground">
              🎵 Sonido: <span className="font-medium text-foreground">{activePackObj.name}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><HardDrive className="h-4 w-4" />Almacenamiento</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{storageInfo}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><RefreshCw className="h-4 w-4" />Actualización</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Si hay una nueva versión disponible, pulsa para forzar la actualización.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={async () => {
              try {
                if ("serviceWorker" in navigator) {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  for (const reg of registrations) {
                    await reg.unregister();
                  }
                }
                const keys = await caches.keys();
                for (const key of keys) {
                  await caches.delete(key);
                }
                toast({ title: "Actualización aplicada. Recargando…" });
                setTimeout(() => window.location.reload(), 800);
              } catch {
                window.location.reload();
              }
            }}
          >
            <RefreshCw className="h-4 w-4" /> Buscar actualización
          </Button>
        </CardContent>
      </Card>


      {activeProfile && (
        <AvatarPicker
          open={showAvatarPicker}
          currentAvatar={activeProfile.avatar}
          profileName={activeProfile.name}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
}
