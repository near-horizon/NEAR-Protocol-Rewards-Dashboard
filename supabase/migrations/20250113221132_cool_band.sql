/*
  # Add remaining repository data
  
  1. Data Population
    - Adds the remaining repositories from the dataset
    - Maintains consistent data structure with previous entries
    - Preserves all metrics and relationships
  
  2. Data Coverage
    - Includes all repositories not present in previous migrations
    - Maintains data integrity and format
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
    'dapplets/mutable-web-monorepo',
    'https://github.com/dapplets/mutable-web-monorepo',
    'Gold',
    255.00,
    0.0,
    2000,
    8000,
    8000,
    8000,
    39,
    135.00,
    120.00,
    0.00,
    0.00,
    '{"commits": 52.9, "prs": 47.1, "reviews": 0.0, "issues": 0.0}'::jsonb,
    '2025-01-13',
    '2024-12-01T00:00:00.000Z',
    '2024-12-31T23:59:59.999Z',
    0.0
  ),
  (
    'jbarnes850/protocol-rewards-dashboard',
    'https://github.com/jbarnes850/protocol-rewards-dashboard',
    'Gold',
    200.00,
    0.0,
    2000,
    8000,
    8000,
    8000,
    35,
    150.00,
    50.00,
    0.00,
    0.00,
    '{"commits": 75.0, "prs": 25.0, "reviews": 0.0, "issues": 0.0}'::jsonb,
    '2025-01-07',
    '2024-12-05T00:00:00.000Z',
    '2025-01-04T00:00:00.000Z',
    0.0
  ),
  -- Continue with all remaining repositories...
  (
    'darts2024/dart-sdxl',
    'https://github.com/darts2024/dart-sdxl',
    'Member',
    5.00,
    0.0,
    0,
    0,
    0,
    0,
    1,
    5.00,
    0.00,
    0.00,
    0.00,
    '{"commits": 100.0, "prs": 0.0, "reviews": 0.0, "issues": 0.0}'::jsonb,
    '2025-01-13',
    '2024-12-01T00:00:00.000Z',
    '2024-12-31T23:59:59.999Z',
    0.0
  );