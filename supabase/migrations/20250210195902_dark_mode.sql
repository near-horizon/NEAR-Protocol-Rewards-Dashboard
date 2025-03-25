/*
  # Fix RLS Policies

  1. Security Changes
    - Update RLS policies to allow upsert operations
    - Add policies for insert and update operations
    - Maintain read-only access for public users
  
  2. Error Handling
    - Add constraints and validation
    - Improve sync tracking
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to repository metrics" ON repository_metrics;
DROP POLICY IF EXISTS "Allow public read access to real-time metrics" ON repository_metrics_realtime;

-- Create comprehensive RLS policies for repository_metrics
CREATE POLICY "Allow public read access to repository metrics"
  ON repository_metrics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to insert repository metrics"
  ON repository_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update repository metrics"
  ON repository_metrics
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create comprehensive RLS policies for repository_metrics_realtime
CREATE POLICY "Allow public read access to real-time metrics"
  ON repository_metrics_realtime
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to insert real-time metrics"
  ON repository_metrics_realtime
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update real-time metrics"
  ON repository_metrics_realtime
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add validation checks
ALTER TABLE repository_metrics
ADD CONSTRAINT valid_score CHECK (total_score >= 0 AND total_score <= 1000),
ADD CONSTRAINT valid_reward CHECK (weekly_reward >= 0),
ADD CONSTRAINT valid_activity CHECK (activity_count >= 0);

ALTER TABLE repository_metrics_realtime
ADD CONSTRAINT valid_score_realtime CHECK (total_score >= 0 AND total_score <= 1000),
ADD CONSTRAINT valid_reward_realtime CHECK (weekly_reward >= 0),
ADD CONSTRAINT valid_activity_realtime CHECK (activity_count >= 0);

-- Add sync status tracking
ALTER TABLE repository_metrics
ADD COLUMN IF NOT EXISTS sync_status text CHECK (sync_status IN ('pending', 'success', 'error')),
ADD COLUMN IF NOT EXISTS sync_error text;

ALTER TABLE repository_metrics_realtime
ADD COLUMN IF NOT EXISTS sync_status text CHECK (sync_status IN ('pending', 'success', 'error')),
ADD COLUMN IF NOT EXISTS sync_error text;