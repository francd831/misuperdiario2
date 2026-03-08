import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { usePack } from "@/core/packs/PackContext";
import { packLoader } from "@/core/packs/packLoader";
import { packRegistry } from "@/core/packs/packRegistry";
import { dbSet } from "@/core/storage/indexeddb";
import { ProfileAvatar } from "./ProfileAvatar";

const DEFAULT_EMOJIS = [
  "🦁", "🐻", "🦊", "🐼", "🐸", "🦄", "🐶", "🐱",
  "🐰", "🐨", "🦋", "🌟", "🎈", "🌈", "🚀", "⚽",
  "🎸", "🎨", "👑", "💎", "🌺", "🍕", "🎮", "🤖",
];

interface Props {
  open: boolean;
  currentAvatar?: string;
  profileName: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

type Tab = "emojis" | "packs" | "photo";

export function AvatarPicker({ open, currentAvatar, profileName, onSelect, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("emojis");
  const fileRef = useRef<HTMLInputElement>(null);
  const { packs, stickers: activeStickers, activePack } = usePack();

  const allPacks = packRegistry.listPacks();

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resize to 256x256
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 256, 256);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const key = `avatar-${Date.now()}`;
        await dbSet("avatar_blobs", { id: key, blob });
        onSelect(`custom:${key}`);
        onClose();
      }, "image/webp", 0.85);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "emojis", label: "Emojis" },
    { id: "packs", label: "Packs" },
    { id: "photo", label: "Foto" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Elige tu avatar</DialogTitle>
        </DialogHeader>

        {/* Current avatar preview */}
        <div className="flex justify-center py-2">
          <ProfileAvatar avatar={currentAvatar} name={profileName} size="lg" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-secondary/50 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[40vh] overflow-y-auto">
          {tab === "emojis" && (
            <div className="grid grid-cols-6 gap-2 p-1">
              {DEFAULT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onSelect(`emoji:${emoji}`); onClose(); }}
                  className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition-all hover:bg-secondary active:scale-90 ${
                    currentAvatar === `emoji:${emoji}` ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/40"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {tab === "packs" && (
            <div className="space-y-4 p-1">
              {allPacks.map((pack) => {
                const packStickers = packLoader.getPackStickers(pack.id);
                if (packStickers.length === 0) return null;
                return (
                  <div key={pack.id}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {pack.name}
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {packStickers.map((url, i) => {
                        const val = `pack:${pack.id}/${i}`;
                        return (
                          <button
                            key={i}
                            onClick={() => { onSelect(val); onClose(); }}
                            className={`flex aspect-square items-center justify-center rounded-xl overflow-hidden transition-all hover:bg-secondary active:scale-90 p-1.5 ${
                              currentAvatar === val ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/40"
                            }`}
                          >
                            <img src={url} alt="" className="h-full w-full object-contain" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "photo" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary transition-colors"
              >
                <Camera className="h-10 w-10 text-muted-foreground" />
              </button>
              <p className="text-sm text-muted-foreground">Sube una foto desde tu dispositivo</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handlePhoto}
              />
            </div>
          )}
        </div>

        {/* Remove avatar button */}
        {currentAvatar && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => { onSelect(""); onClose(); }}
          >
            Quitar avatar
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
