export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  rewardStars: number;
}

export interface ProfileAchievement {
  id: string;
  profileId: string;
  achievementId: string;
  rewardStars: number;
  unlockedAt: string;
}
