export interface RankInfo {
  title: string;
  minPoints: number;
  nextPoints: number | null;
  progressPercentage: number;
  color: string;
  emoji: string;
}

export function getRankInfo(lifetimePoints: number): RankInfo {
  if (lifetimePoints < 50) {
    const min = 0;
    const next = 50;
    const progress = Math.min(100, Math.round(((lifetimePoints - min) / (next - min)) * 100));
    return {
      title: 'Freshie',
      minPoints: min,
      nextPoints: next,
      progressPercentage: progress,
      color: 'bg-yellow',
      emoji: '🎒',
    };
  }

  if (lifetimePoints < 100) {
    const min = 50;
    const next = 100;
    const progress = Math.min(100, Math.round(((lifetimePoints - min) / (next - min)) * 100));
    return {
      title: 'Explorer',
      minPoints: min,
      nextPoints: next,
      progressPercentage: progress,
      color: 'bg-sky',
      emoji: '🧭',
    };
  }

  if (lifetimePoints < 200) {
    const min = 100;
    const next = 200;
    const progress = Math.min(100, Math.round(((lifetimePoints - min) / (next - min)) * 100));
    return {
      title: 'Trailblazer',
      minPoints: min,
      nextPoints: next,
      progressPercentage: progress,
      color: 'bg-mint',
      emoji: '⚡',
    };
  }

  return {
    title: 'Campus Legend',
    minPoints: 200,
    nextPoints: null,
    progressPercentage: 100,
    color: 'bg-pink text-ink',
    emoji: '👑',
  };
}
