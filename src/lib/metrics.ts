export function calculateScore(metrics: {
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
}): number {
  const weights = {
    commits: 0.35,
    pullRequests: 0.25,
    reviews: 0.20,
    issues: 0.20
  };

  const thresholds = {
    commits: 100,
    pullRequests: 20,
    reviews: 30,
    issues: 30
  };

  return (
    (Math.min(metrics.commits / thresholds.commits, 1) * weights.commits * 100) +
    (Math.min(metrics.pullRequests / thresholds.pullRequests, 1) * weights.pullRequests * 100) +
    (Math.min(metrics.reviews / thresholds.reviews, 1) * weights.reviews * 100) +
    (Math.min(metrics.issues / thresholds.issues, 1) * weights.issues * 100)
  );
}

export function calculateRewardLevel(score: number): { level: string; weeklyReward: number } {
  if (score >= 90) return { level: 'Diamond', weeklyReward: 5000 };
  if (score >= 70) return { level: 'Gold', weeklyReward: 2000 };
  if (score >= 50) return { level: 'Silver', weeklyReward: 1500 };
  if (score >= 30) return { level: 'Bronze', weeklyReward: 1000 };
  return { level: 'Member', weeklyReward: 0 };
}

export function calculateContributionBreakdown(
  metrics: {
    commits: number;
    pullRequests: number;
    reviews: number;
    issues: number;
  },
  total: number
): Record<string, number> {
  if (total === 0) return { commits: 0, prs: 0, reviews: 0, issues: 0 };
  
  return {
    commits: (metrics.commits / total) * 100,
    prs: (metrics.pullRequests / total) * 100,
    reviews: (metrics.reviews / total) * 100,
    issues: (metrics.issues / total) * 100
  };
}