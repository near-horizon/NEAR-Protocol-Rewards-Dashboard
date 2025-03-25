export interface Repository {
  name: string;
  url: string;
  rewardLevel: string;
  totalScore: number;
  scoreTrend: number;
  weeklyReward: number;
  monthlyReward: number;
  monthlyProjection: number;
  totalPeriodReward: number;
  activityCount: number;
  commitScore: number;
  prScore: number;
  reviewScore: number;
  issueScore: number;
  contributionBreakdown: {
    commits: number;
    prs: number;
    reviews: number;
    issues: number;
  };
  lastUpdated: string;
  periodStart: string;
  periodEnd: string;
  consistencyScore: number;
}