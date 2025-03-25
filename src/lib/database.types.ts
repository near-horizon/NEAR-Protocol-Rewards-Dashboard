export interface Database {
  public: {
    Tables: {
      repository_metrics: {
        Row: {
          id: string;
          name: string;
          url: string;
          reward_level: string;
          total_score: number;
          score_trend: number;
          weekly_reward: number;
          monthly_reward: number;
          monthly_projection: number;
          total_period_reward: number;
          activity_count: number;
          commit_score: number;
          pr_score: number;
          review_score: number;
          issue_score: number;
          contribution_breakdown: {
            commits: number;
            prs: number;
            reviews: number;
            issues: number;
          };
          last_updated: string;
          period_start: string;
          period_end: string;
          consistency_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['repository_metrics']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['repository_metrics']['Insert']>;
      };
    };
  };
}