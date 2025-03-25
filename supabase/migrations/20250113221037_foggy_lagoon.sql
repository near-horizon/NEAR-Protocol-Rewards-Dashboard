/*
  # Seed initial repository metrics data
  
  1. Data Population
    - Inserts initial repository metrics data
    - Includes all fields from the CSV dataset
    - Preserves exact values and relationships
  
  2. Data Structure
    - Maintains proper data types and formats
    - Ensures consistency with schema
*/

INSERT INTO repository_metrics (
  name,
  url,
  reward_level,
  total_score,
  score_trend,
  weekly_reward,
  monthly_reward,
  monthly_projection,
  total_period_reward,
  activity_count,
  commit_score,
  pr_score,
  review_score,
  issue_score,
  contribution_breakdown,
  last_updated,
  period_start,
  period_end,
  consistency_score
) VALUES
  (
    'derek2403/near',
    'https://github.com/derek2403/near',
    'Diamond',
    675.00,
    0.0,
    5000,
    20000,
    20000,
    20000,
    95,
    150.00,
    250.00,
    248.00,
    27.00,
    '{"commits": 22.2, "prs": 37.0, "reviews": 36.7, "issues": 4.0}'::jsonb,
    '2025-01-13',
    '2024-12-01T00:00:00.000Z',
    '2024-12-31T23:59:59.999Z',
    0.0
  ),
  (
    'finowl-near/finowl-app',
    'https://github.com/finowl-near/finowl-app',
    'Diamond',
    561.00,
    0.0,
    5000,
    20000,
    20000,
    20000,
    86,
    150.00,
    140.00,
    232.00,
    39.00,
    '{"commits": 26.7, "prs": 25.0, "reviews": 41.4, "issues": 7.0}'::jsonb,
    '2025-01-13',
    '2024-12-01T00:00:00.000Z',
    '2024-12-31T23:59:59.999Z',
    0.0
  )
  -- Add more repository data here...
;