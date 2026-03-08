import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Settings, BarChart3, LogOut } from "lucide-react";
import { profileRepository } from "@/core/storage/repositories/profileRepository";
import { entryRepository } from "@/core/storage/repositories/entryRepository";
import { dbList } from "@/core/storage/indexeddb";
import { useProfile } from "@/core/auth/ProfileContext";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useProfile();
  const [stats, setStats] = useState({ profiles: 0, entries: 0, photos: 0 });

  useEffect(() => {
    const load = async () => {
      const profiles = await profileRepository.getAll();
      const entries = await entryRepository.getAll();
      const photos = await dbList("daily_photos");
      setStats({ profiles: profiles.length, entries: entries.length, photos: photos.length });
    };
    load();
  }, []);

  const cards = [
    { icon: Users, label: "Perfiles", value: stats.profiles, route: "/admin/profiles" },
    { icon: FileText, label: "Entradas", value: stats.entries, route: "/admin/content" },
    { icon: BarChart3, label: "Fotos diarias", value: stats.photos, route: "/admin/content" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛡️ Admin</h1>
        <Button variant="ghost" size="sm" className="gap-1" onClick={logout}><LogOut className="h-4 w-4" /> Salir</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ icon: Icon, label, value, route }) => (
          <Card key={label} className="cursor-pointer" onClick={() => navigate(route)}>
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <Icon className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/admin/profiles")}>
          <Users className="h-4 w-4" /> Gestionar perfiles
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/admin/content")}>
          <FileText className="h-4 w-4" /> Todo el contenido
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/admin/settings")}>
          <Settings className="h-4 w-4" /> Ajustes avanzados
        </Button>
      </div>
    </div>
  );
}
