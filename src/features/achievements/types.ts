export type AchievementCategory = "streak" | "milestone" | "special";

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  emoji: string;
  /** For streaks: required consecutive days */
  streakDays?: number;
  /** For milestones: required count */
  requiredCount?: number;
}

export interface UnlockedAchievement {
  id: string;
  profileId: string;
  achievementId: string;
  unlockedAt: string;
}

// ── Streak definitions ──
export const STREAK_ACHIEVEMENTS: AchievementDef[] = [
  { id: "streak-3", category: "streak", name: "¡Buen comienzo!", description: "3 días seguidos", emoji: "🌱", streakDays: 3 },
  { id: "streak-5", category: "streak", name: "Semana casi completa", description: "5 días seguidos", emoji: "⭐", streakDays: 5 },
  { id: "streak-7", category: "streak", name: "¡Semana perfecta!", description: "7 días seguidos", emoji: "🔥", streakDays: 7 },
  { id: "streak-14", category: "streak", name: "Súper constante", description: "14 días seguidos", emoji: "💎", streakDays: 14 },
  { id: "streak-30", category: "streak", name: "¡Un mes entero!", description: "30 días seguidos", emoji: "🏆", streakDays: 30 },
  { id: "streak-60", category: "streak", name: "Imparable", description: "60 días seguidos", emoji: "🚀", streakDays: 60 },
  { id: "streak-100", category: "streak", name: "Leyenda del diario", description: "100 días seguidos", emoji: "👑", streakDays: 100 },
  { id: "streak-365", category: "streak", name: "¡Un año completo!", description: "365 días seguidos", emoji: "🎂", streakDays: 365 },
];

// ── Milestone definitions ──
export const MILESTONE_ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-entry", category: "milestone", name: "¡Tu primera vez!", description: "Crea tu primera entrada", emoji: "🎉", requiredCount: 1 },
  { id: "entries-10", category: "milestone", name: "Coleccionista", description: "10 entradas en tu diario", emoji: "📚", requiredCount: 10 },
  { id: "entries-50", category: "milestone", name: "Medio centenar", description: "50 entradas en tu diario", emoji: "🌟", requiredCount: 50 },
  { id: "entries-100", category: "milestone", name: "Centenario", description: "100 entradas en tu diario", emoji: "💯", requiredCount: 100 },
  { id: "photos-25", category: "milestone", name: "Fotógrafo dedicado", description: "25 fotos diarias", emoji: "📸", requiredCount: 25 },
  { id: "all-types", category: "milestone", name: "Todoterreno", description: "Usa vídeo, audio y texto", emoji: "🎨" },
  { id: "capsules-10", category: "milestone", name: "Viajero del tiempo", description: "10 cápsulas del tiempo", emoji: "⏳", requiredCount: 10 },
];

// ── Special events ──
export const SPECIAL_ACHIEVEMENTS: AchievementDef[] = [
  { id: "birthday", category: "special", name: "¡Feliz cumple!", description: "Entrada en tu cumpleaños", emoji: "🎂" },
];

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  ...STREAK_ACHIEVEMENTS,
  ...MILESTONE_ACHIEVEMENTS,
  ...SPECIAL_ACHIEVEMENTS,
];
