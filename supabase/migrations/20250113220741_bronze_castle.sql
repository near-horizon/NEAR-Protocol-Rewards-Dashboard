/*
  # Repository Metrics Schema

  1. New Tables
    - `repository_metrics`
      - `id` (uuid, primary key)
      - `name` (text, repository name)
      - `url` (text, repository URL)
      - `reward_level` (text, reward tier)
      - `total_score` (numeric, total activity score)
      - `score_trend` (numeric, score trend percentage)
      - `weekly_reward` (numeric, weekly reward amount)
      - `monthly_reward` (numeric, monthly reward amount)
      - `monthly_projection` (numeric, projected monthly reward)
      - `total_period_reward` (numeric, total reward for period)
      - `activity_count` (integer, total activities)
      - `commit_score` (numeric, commit activity score)
      - `pr_score` (numeric, pull request score)
      - `review_score` (numeric, review score)
      - `issue_score` (numeric, issue score)
      - `contribution_breakdown` (jsonb, percentage breakdown)
      - `last_updated` (timestamp, last update time)
      - `period_start` (timestamp, period start)
      - `period_end` (timestamp, period end)
      - `consistency_score` (numeric, consistency percentage)
      - `created_at` (timestamp, record creation)
      - `updated_at` (timestamp, record update)

  2. Security
    - Enable RLS on repository_metrics table
    - Add policy for authenticated users to read metrics
*/

CREATE TABLE IF NOT EXISTS repository_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
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
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE repository_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for reading metrics
CREATE POLICY "Allow public read access to repository metrics"
  ON repository_metrics
  FOR SELECT
  TO public
  USING (true);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_repository_metrics_reward_level ON repository_metrics(reward_level);
CREATE INDEX IF NOT EXISTS idx_repository_metrics_total_score ON repository_metrics(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_repository_metrics_monthly_reward ON repository_metrics(monthly_reward DESC);