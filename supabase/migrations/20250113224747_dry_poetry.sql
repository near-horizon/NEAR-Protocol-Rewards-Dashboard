/*
  # Add Real-time Metrics Tables

  1. New Tables
    - `repository_metrics_realtime`
      - Same structure as repository_metrics but for real-time data
    - `repository_metrics_history`
      - Historical snapshots with timestamp tracking
    - `repository_activity_log`
      - Detailed activity tracking for auditing
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for public read access
    
  3. Changes
    - Add indexes for efficient querying
    - Add constraints for data integrity
*/

-- Real-time metrics table
CREATE TABLE IF NOT EXISTS repository_metrics_realtime (
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
  updated_at timestamp with time zone DEFAULT now(),
  github_workflow_file_path text,
  last_github_sync timestamp with time zone
);

-- Historical metrics table
CREATE TABLE IF NOT EXISTS repository_metrics_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repository_metrics_realtime(id),
  snapshot_date timestamp with time zone NOT NULL,
  metrics jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS repository_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repository_metrics_realtime(id),
  activity_type text NOT NULL,
  activity_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE repository_metrics_realtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for reading metrics
CREATE POLICY "Allow public read access to real-time metrics"
  ON repository_metrics_realtime
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to historical metrics"
  ON repository_metrics_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to activity logs"
  ON repository_activity_log
  FOR SELECT
  TO public
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_name ON repository_metrics_realtime(name);
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_reward_level ON repository_metrics_realtime(reward_level);
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_total_score ON repository_metrics_realtime(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_realtime_last_updated ON repository_metrics_realtime(last_updated);

CREATE INDEX IF NOT EXISTS idx_metrics_history_repository_date ON repository_metrics_history(repository_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_repository_date ON repository_activity_log(repository_id, created_at DESC);

-- Add trigger for automatic history tracking
CREATE OR REPLACE FUNCTION record_metrics_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO repository_metrics_history (
    repository_id,
    snapshot_date,
    metrics
  ) VALUES (
    NEW.id,
    NEW.last_updated,
    jsonb_build_object(
      'total_score', NEW.total_score,
      'score_trend', NEW.score_trend,
      'weekly_reward', NEW.weekly_reward,
      'monthly_reward', NEW.monthly_reward,
      'activity_count', NEW.activity_count,
      'commit_score', NEW.commit_score,
      'pr_score', NEW.pr_score,
      'review_score', NEW.review_score,
      'issue_score', NEW.issue_score,
      'contribution_breakdown', NEW.contribution_breakdown,
      'consistency_score', NEW.consistency_score
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_metrics_history_trigger
AFTER INSERT OR UPDATE ON repository_metrics_realtime
FOR EACH ROW
EXECUTE FUNCTION record_metrics_history();