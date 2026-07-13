import type { AchievementDefinition } from "./types";

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-entry",
    title: "Primer recuerdo",
    description: "Guarda tu primera entrada de diario.",
    rewardStars: 10,
  },
  {
    id: "first-photo",
    title: "Primera foto diaria",
    description: "Guarda tu primera foto diaria.",
    rewardStars: 10,
  },
  {
    id: "all-entry-types",
    title: "Explorador creativo",
    description: "Crea al menos un texto, un audio y un video.",
    rewardStars: 30,
  },
  {
    id: "entries-10",
    title: "Diez recuerdos",
    description: "Guarda diez entradas en tu diario.",
    rewardStars: 25,
  },
  {
    id: "photos-7",
    title: "Semana en fotos",
    description: "Guarda siete fotos diarias.",
    rewardStars: 20,
  },
  {
    id: "first-capsule",
    title: "Capsula secreta",
    description: "Crea tu primera capsula del tiempo.",
    rewardStars: 15,
  },
];

export function getAchievementDefinition(id: string) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}
