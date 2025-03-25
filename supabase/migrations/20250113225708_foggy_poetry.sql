/*
  # Add real-time metrics table

  1. New Tables
    - `repository_metrics_realtime`
      - Mirrors structure of repository_metrics table
      - Additional fields for GitHub sync tracking
  
  2. Security
    - Enable RLS
    - Add policy for public read access (if not exists)
    - Add indexes for performance
*/

-- Real-time metrics table
CREATE TABLE IF NOT EXISTS repository_metrics_realtime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  url text NOT NULL,
  reward_level text NOT NULL,
  total_score numeric NOT NULL DEFAULT 0,
  score_trend numeric NOT NULL DEFAULT 0,
  weekly_reward numeric NOT NULL DEFAULT 0,
  monthly_reward numeric NOT NULL DEFAULT 0,
  monthly_projection numeric NOT NULL DEFAULT 0,
  total_period_reward numeric NOT NULL DEFAULT 0,
  activity_count integer NOT NULL DEFAULT 0,
  commit_score numeric NOT NULL DEFAULT 0,
  pr_score numeric NOT NULL DEFAULT 0,
  review_score numeric NOT NULL DEFAULT 0,
  issue_score numeric NOT NULL DEFAULT 0,
  contribution_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  consistency_score numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_github_sync timestamp with time zone
);

-- Enable RLS
ALTER TABLE repository_metrics_realtime ENABLE ROW LEVEL SECURITY;

-- Create policy for reading metrics if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'repository_metrics_realtime' 
    AND policyname = 'Allow public read access to real-time metrics'
  ) THEN
    CREATE POLICY "Allow public read access to real-time metrics"
      ON repository_metrics_realtime
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_name ON repository_metrics_realtime(name);
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_reward_level ON repository_metrics_realtime(reward_level);
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_total_score ON repository_metrics_realtime(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_last_updated ON repository_metrics_realtime(last_updated);