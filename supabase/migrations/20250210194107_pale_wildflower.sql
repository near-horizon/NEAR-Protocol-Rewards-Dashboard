/*
  # Fix Database Schema Issues

  1. Changes
    - Add last_github_sync column to repository_metrics table
    - Add last_github_sync column to repository_metrics_realtime table
    - Add indexes for performance optimization
    - Add trigger to update last_github_sync timestamp

  2. Security
    - Maintain existing RLS policies
*/

-- Add last_github_sync column to repository_metrics
ALTER TABLE repository_metrics
ADD COLUMN IF NOT EXISTS last_github_sync timestamptz;

-- Add last_github_sync column to repository_metrics_realtime
ALTER TABLE repository_metrics_realtime
ADD COLUMN IF NOT EXISTS last_github_sync timestamptz;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repository_metrics_last_sync
ON repository_metrics(last_github_sync);

CREATE INDEX IF NOT EXISTS idx_repository_metrics_realtime_last_sync
ON repository_metrics_realtime(last_github_sync);

-- Create function to update last_github_sync timestamp
CREATE OR REPLACE FUNCTION update_last_github_sync()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_github_sync = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both tables
DROP TRIGGER IF EXISTS update_repository_metrics_last_sync ON repository_metrics;
CREATE TRIGGER update_repository_metrics_last_sync
  BEFORE UPDATE ON repository_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_last_github_sync();

DROP TRIGGER IF EXISTS update_repository_metrics_realtime_last_sync ON repository_metrics_realtime;
CREATE TRIGGER update_repository_metrics_realtime_last_sync
  BEFORE UPDATE ON repository_metrics_realtime
  FOR EACH ROW
  EXECUTE FUNCTION update_last_github_sync();