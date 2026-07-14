import { Crown, Heart, Palette, Rocket, Smile, Sparkles, Star, Trophy, type LucideIcon } from "lucide-react";
import type { Profile, ProfileAvatarPreset } from "../../core/profiles/types";

export const profileAvatarPresets: Array<{ id: ProfileAvatarPreset; label: string; Icon: LucideIcon }> = [
  { id: "star", label: "Estrella", Icon: Star },
  { id: "heart", label: "Corazon", Icon: Heart },
  { id: "rocket", label: "Cohete", Icon: Rocket },
  { id: "smile", label: "Sonrisa", Icon: Smile },
  { id: "palette", label: "Pintura", Icon: Palette },
  { id: "crown", label: "Corona", Icon: Crown },
  { id: "sparkles", label: "Brillos", Icon: Sparkles },
  { id: "trophy", label: "Trofeo", Icon: Trophy },
];

const presetIcons = Object.fromEntries(profileAvatarPresets.map(({ id, Icon }) => [id, Icon])) as Record<ProfileAvatarPreset, LucideIcon>;

interface ProfileAvatarProps {
  profile: Pick<Profile, "name" | "avatarColor" | "avatarPreset" | "avatarPhotoDataUrl">;
  className: string;
  size?: number;
}

export function ProfileAvatar({ profile, className, size = 30 }: ProfileAvatarProps) {
  if (profile.avatarPhotoDataUrl) {
    return (
      <span className={className} style={{ background: profile.avatarColor, overflow: "hidden" }}>
        <img
          src={profile.avatarPhotoDataUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </span>
    );
  }

  const Icon = presetIcons[profile.avatarPreset ?? "star"];

  return (
    <span className={className} style={{ background: profile.avatarColor }}>
      <Icon aria-label={`Icono de ${profile.name}`} size={size} strokeWidth={2.5} />
    </span>
  );
}
