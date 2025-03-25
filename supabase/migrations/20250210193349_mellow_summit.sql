/*
  # Fix duplicates and add unique constraints

  1. Changes
    - Remove duplicate entries from repository_metrics table
    - Remove duplicate entries from repository_metrics_realtime table
    - Add unique constraints on name column for both tables
    
  2. Purpose
    - Clean up duplicate repository entries
    - Enable proper upsert operations
    - Maintain data integrity
    
  3. Impact
    - Keeps only the most recent entry for each repository
    - Ensures repository names remain unique
    - Enables ON CONFLICT operations
*/

-- First, remove duplicates from repository_metrics by keeping only the most recent entry
DELETE FROM repository_metrics a USING (
  SELECT name, MAX(created_at) as max_date
  FROM repository_metrics
  GROUP BY name
  HAVING COUNT(*) > 1
) b
WHERE a.name = b.name
AND a.created_at < b.max_date;

-- Then, remove duplicates from repository_metrics_realtime
DELETE FROM repository_metrics_realtime a USING (
  SELECT name, MAX(created_at) as max_date
  FROM repository_metrics_realtime
  GROUP BY name
  HAVING COUNT(*) > 1
) b
WHERE a.name = b.name
AND a.created_at < b.max_date;

-- Now add the unique constraints
ALTER TABLE repository_metrics
ADD CONSTRAINT repository_metrics_name_key UNIQUE (name);

ALTER TABLE repository_metrics_realtime
ADD CONSTRAINT repository_metrics_realtime_name_key UNIQUE (name);