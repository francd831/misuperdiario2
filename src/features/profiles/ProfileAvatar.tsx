import { useState, useEffect } from "react";
import { dbGet } from "@/core/storage/indexeddb";
import { packLoader } from "@/core/packs/packLoader";

const COLORS = [
  "bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-sky-400",
  "bg-violet-400", "bg-pink-400", "bg-teal-400", "bg-orange-400",
];

interface Props {
  avatar?: string;
  name: string;
  colorIndex?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "h-12 w-12 text-lg",
  md: "h-20 w-20 text-3xl",
  lg: "h-24 w-24 text-4xl",
};

/**
 * Renders a profile avatar. Supports:
 * - `emoji:🦁` → emoji
 * - `pack:packId/stickerIdx` → pack sticker image
 * - `custom:<blobKey>` → custom photo from IndexedDB
 * - undefined → colored initial letter (fallback)
 */
export function ProfileAvatar({ avatar, name, colorIndex = 0, size = "md", className = "" }: Props) {
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const sizeClass = SIZES[size];

  useEffect(() => {
    if (!avatar?.startsWith("custom:")) return;
    const key = avatar.replace("custom:", "");
    dbGet("avatar_blobs", key).then((record: any) => {
      if (record?.blob) setCustomUrl(URL.createObjectURL(record.blob));
    });
    return () => { if (customUrl) URL.revokeObjectURL(customUrl); };
  }, [avatar]);

  // Custom photo
  if (avatar?.startsWith("custom:") && customUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shadow-lg ${className}`}>
        <img src={customUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  // Emoji
  if (avatar?.startsWith("emoji:")) {
    const emoji = avatar.replace("emoji:", "");
    return (
      <div className={`${sizeClass} flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-lg ${className}`}>
        <span className="leading-none">{emoji}</span>
      </div>
    );
  }

  // Pack sticker
  if (avatar?.startsWith("pack:")) {
    const [packId, idx] = avatar.replace("pack:", "").split("/");
    const stickers = packLoader.getPackStickers(packId);
    const url = stickers[parseInt(idx, 10)];
    if (url) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-lg p-2 ${className}`}>
          <img src={url} alt={name} className="h-full w-full object-contain" />
        </div>
      );
    }
  }

  // Fallback: colored initial
  const color = COLORS[colorIndex % COLORS.length];
  return (
    <div className={`${sizeClass} flex items-center justify-center rounded-full font-bold text-white shadow-lg ${color} ${className}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
