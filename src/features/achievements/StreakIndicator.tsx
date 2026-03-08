interface Props {
  streak: number;
}

export function StreakIndicator({ streak }: Props) {
  if (streak < 1) return null;

  const emoji = streak >= 30 ? "🏆" : streak >= 7 ? "🔥" : streak >= 3 ? "⭐" : "✨";

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
      <span>{emoji}</span>
      <span>{streak} {streak === 1 ? "día" : "días"}</span>
    </div>
  );
}
