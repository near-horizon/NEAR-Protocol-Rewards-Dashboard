import { Octokit } from '@octokit/rest';
import { supabase } from './supabase';
import { calculateScore, calculateRewardLevel, calculateContributionBreakdown } from './metrics';

// API Configuration Constants
const API_TIMEOUT = 10000;
const MAX_ITEMS_PER_PAGE = 100;
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
const MAX_RETRIES = 3;

// Sync Operation Constants
const SYNC_BATCH_SIZE = 5;
const SYNC_DELAY = 1000;
const RETRY_DELAY = 5000;
const SYNC_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Validation Constants
const MIN_PERIOD_DAYS = 7;
const MAX_PERIOD_DAYS = 90;
const MAX_SCORE = 1000;
const MIN_ACTIVITY_COUNT = 1;

// Calculate reward period dates
export function calculateRewardPeriod() {
  const now = new Date();
  
  // Set period start to first day of current month
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Set period end to last day of current month
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: periodStart.toISOString(),
    end: periodEnd.toISOString()
  };
}

// List of known problematic repositories to skip
const SKIP_REPOSITORIES = [
  'sudostake/sudostake_web',
  'keypom/multichain-trial-accounts',
  'keypom/events-account-factory',
  'pzprado/x-interface',
  'petersalomonsen/quickjs-rust-near',
  'ahnafalfariza/scavene',
  'finowl-near/finowl-app',
  'keypom/keypom-js',
  'derek2403/near',
  'dapplets/mutable-web-monorepo',
  'keypom/keypom-events-app',
  'VoteChain/VoteChain',
  'Shitzu-Apes/jlu',
  'jaswinder6991/simple-usdc-bridge',
  'nearcatalog/nearcatalog-iframe-embeded',
  'INTEARnear/oracle',
  'darts2024/ci',
  'MarmaJFoundation/mmj-gaming',
  'kamalbuilds/multichain-near-aiagent',
  'jbarnes850/near-protocol-rewards',
  'keypom/keypom',
  'keypom/keypom-frontend',
  'partagexyz/1000fans',
  'darts2024/dart-sdxl'
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateMetricsData(metricsData: any): ValidationResult {
  const errors: string[] = [];

  // Validate repository name
  if (!metricsData.name || !metricsData.name.includes('/')) {
    errors.push('Invalid repository name format');
  }

  // Validate URL
  try {
    new URL(metricsData.url);
  } catch {
    errors.push('Invalid repository URL');
  }

  // Validate reward level
  const validLevels = ['Diamond', 'Gold', 'Silver', 'Bronze', 'Member'];
  if (!validLevels.includes(metricsData.reward_level)) {
    errors.push('Invalid reward level');
  }

  // Validate scores and rewards
  if (metricsData.total_score < 0 || metricsData.total_score > MAX_SCORE) {
    errors.push(`Total score must be between 0 and ${MAX_SCORE}`);
  }

  if (metricsData.weekly_reward < 0) {
    errors.push('Weekly reward cannot be negative');
  }

  if (metricsData.monthly_reward < 0) {
    errors.push('Monthly reward cannot be negative');
  }

  // Validate activity metrics
  if (metricsData.activity_count < MIN_ACTIVITY_COUNT) {
    errors.push('Activity count must be at least 1');
  }

  // Validate dates
  const periodStart = new Date(metricsData.period_start);
  const periodEnd = new Date(metricsData.period_end);
  const periodDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);

  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
    errors.push('Invalid period dates');
  } else if (periodDays < MIN_PERIOD_DAYS || periodDays > MAX_PERIOD_DAYS) {
    errors.push(`Period must be between ${MIN_PERIOD_DAYS} and ${MAX_PERIOD_DAYS} days`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Validate GitHub token
function validateGitHubToken() {
  if (!GITHUB_TOKEN) {
    throw new Error('Missing VITE_GITHUB_TOKEN environment variable');
  }
  
  if (GITHUB_TOKEN === 'your_github_token_here') {
    throw new Error('Please replace the placeholder GitHub token with a valid token');
  }

  // Check if token is in the correct format (ghp_* for fine-grained tokens or github_pat_* for classic tokens)
  if (!GITHUB_TOKEN.startsWith('ghp_') && !GITHUB_TOKEN.startsWith('github_pat_')) {
    throw new Error('Invalid GitHub token format. Token should start with "ghp_" or "github_pat_"');
  }

  return true;
}

export const octokit = new Octokit({
  auth: GITHUB_TOKEN,
  request: {
    timeout: API_TIMEOUT
  }
});

interface SyncResult {
  repo: string;
  success: boolean;
  error?: Error;
}

interface RepoMetrics {
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
  lastSync?: Date;
}

export async function searchReposWithWorkflow(): Promise<string[]> {
  try {
    const { data } = await octokit.search.code({
      q: 'path:.github/workflows filename:near-protocol-rewards.yml OR filename:near-rewards.yml OR filename:near-rewards.yaml',
      per_page: MAX_ITEMS_PER_PAGE
    });

    return data.items.map(item => item.repository.full_name);
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('Invalid GitHub token or insufficient permissions. Please check your VITE_GITHUB_TOKEN.');
    }
    if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    if (error.status === 404) {
      return []; // No repositories found
    }
    if (error.status === 422) {
      console.warn('Search query too complex, trying alternative search...');
      // Try a simpler search as fallback
      const { data } = await octokit.search.code({
        q: 'org:near path:.github/workflows',
        per_page: MAX_ITEMS_PER_PAGE
      });
      return data.items.map(item => item.repository.full_name);
    }
    console.error('Error searching for repositories:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }
}

export async function getRepoMetrics(repo: string): Promise<RepoMetrics> {
  try {
    // Skip known problematic repositories
    if (SKIP_REPOSITORIES.includes(repo)) {
      console.log(`Skipping known problematic repository: ${repo}`);
      return { commits: 0, pullRequests: 0, reviews: 0, issues: 0 };
    }

    const [owner, name] = repo.split('/');
    const since = new Date();
    since.setDate(since.getDate() - 30); // Last 30 days

    let retryCount = 0;
    const fetchWithRetry = async (request: () => Promise<any>) => {
      while (retryCount < MAX_RETRIES) {
        try {
          const response = await request();
          return response;
        } catch (error) {
          if (error.status === 403) {
            // Rate limit exceeded
            console.log('Rate limit exceeded, waiting...');
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            retryCount++;
            continue;
          }
          throw error;
        }
      }
      throw new Error('Max retries exceeded');
    };

    const [commits, prs, reviews, issues] = await Promise.all([
      fetchWithRetry(() => octokit.repos.listCommits({ 
        owner, 
        repo: name, 
        since: since.toISOString(), 
        per_page: 100 
      })).catch(() => ({ data: [] })),
      
      fetchWithRetry(() => octokit.pulls.list({ 
        owner,
        repo: name,
        state: 'all',
        since: since.toISOString(),
        per_page: 100
      })).catch(() => ({ data: [] })),
      
      fetchWithRetry(() => octokit.pulls.list({
        owner,
        repo: name,
        state: 'all',
        since: since.toISOString(),
        per_page: 100
      }))
      .then(res => Promise.all(
        res.data.map(pr => fetchWithRetry(() => 
          octokit.pulls.listReviews({ owner, repo: name, pull_number: pr.number })
        ).catch(() => ({ data: [] })))
      ))
      .then(reviews => reviews.flat())
      .catch(() => []),
      
      fetchWithRetry(() => octokit.issues.listForRepo({
        owner,
        repo: name,
        state: 'all',
        since: since.toISOString(),
        per_page: 100
      })).catch(() => ({ data: [] }))
    ]);

    return {
      commits: Array.isArray(commits.data) ? commits.data.length : 0,
      pullRequests: prs.data.length,
      reviews: Array.isArray(reviews) ? reviews.flat().length : 0,
      issues: issues.data.length
    };
  } catch (error: any) {
    console.error(`Error getting metrics for ${repo}:`, error);
    
    // Handle specific error cases
    if (error.status === 404 || error.status === 451) {
      console.log(`Repository ${repo} not found or access denied`);
      
      // Remove from database if repository doesn't exist
      const { error: deleteError } = await supabase
        .from('repository_metrics_realtime')
        .delete()
        .eq('name', repo);
      
      if (deleteError) {
        console.error(`Error removing ${repo} from database:`, deleteError);
      }
    }
    
    throw error;
  }
}

export async function syncGitHubMetrics(): Promise<void> {
  try {
    // Validate token before proceeding
    validateGitHubToken();

    console.log('Starting GitHub metrics sync...');
    let syncRetries = 0;
    
    // Find all repositories with the workflow file
    const repos = await searchReposWithWorkflow();
    
    if (repos.length === 0) {
      console.warn('No repositories found with NEAR rewards workflow file');
      return;
    }
    
    console.info(`Found ${repos.length} repositories with workflow file`);

    try {
      // Process repositories in batches
      const results: PromiseSettledResult<SyncResult>[] = [];
      
      for (let i = 0; i < repos.length; i += SYNC_BATCH_SIZE) {
        const batch = repos.slice(i, i + SYNC_BATCH_SIZE);
        console.info(`Processing batch ${i / SYNC_BATCH_SIZE + 1} of ${Math.ceil(repos.length / SYNC_BATCH_SIZE)}`);
        
        const batchPromises = batch.map(async (repo) => {
          try {
            console.info(`Processing repository: ${repo}`);
            
            // Get metrics for each repository
            const metrics = await getRepoMetrics(repo);

            // Skip repositories with no activity
            if (metrics.commits === 0 && metrics.pullRequests === 0 && 
                metrics.reviews === 0 && metrics.issues === 0) {
              console.info(`Repository ${repo} has no activity in current period`);
              return { repo, success: false, error: new Error('Repository not found or empty') };
            }
            
            // Calculate scores and rewards based on metrics
            const totalScore = calculateScore(metrics);
            const { level, weeklyReward } = calculateRewardLevel(totalScore);
            
            const activityCount = metrics.commits + metrics.pullRequests + metrics.reviews + metrics.issues;
            const contributionBreakdown = calculateContributionBreakdown(metrics, activityCount);

            // Get current reward period
            const period = calculateRewardPeriod();

            // Skip update if no activity
            if (activityCount === 0) {
              console.info(`Repository ${repo} has no activity in current period`);
              return { repo, success: false, error: new Error('No activity in current period') };
            }

            // Prepare metrics data
            const metricsData = {
              name: repo,
              url: `https://github.com/${repo}`,
              reward_level: level,
              total_score: totalScore,
              weekly_reward: weeklyReward,
              monthly_reward: weeklyReward * 4,
              monthly_projection: weeklyReward * 4,
              activity_count: activityCount,
              commit_score: metrics.commits,
              pr_score: metrics.pullRequests,
              review_score: metrics.reviews,
              issue_score: metrics.issues,
              contribution_breakdown: contributionBreakdown,
              period_start: period.start,
              period_end: period.end,
              last_github_sync: new Date().toISOString()
            };

            // Validate metrics data
            const validation = validateMetricsData(metricsData);
            if (!validation.isValid) {
              console.error(`Validation failed for ${repo}:`, validation.errors);
              return { repo, success: false, error: new Error(validation.errors.join(', ')) };
            }

            // Update both tables
            const tables = ['repository_metrics', 'repository_metrics_realtime'];
            for (const table of tables) {
              const { error } = await supabase
                .from(table)
                .upsert(metricsData, {
                  onConflict: 'name',
                  ignoreDuplicates: false
                });

              if (error) {
                console.error(`Error upserting metrics for ${repo} to ${table}:`, error);
                throw error;
              }
            }

            console.info(`Successfully updated metrics for ${repo}`);
            return { repo, success: true };
          } catch (error: unknown) {
            console.error(`Failed to process ${repo}:`, error);
            return { repo, success: false, error };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);

        // Add delay between batches
        if (i + SYNC_BATCH_SIZE < repos.length) {
          await new Promise(resolve => setTimeout(resolve, SYNC_DELAY));
        }
      }

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;

      console.info(`GitHub metrics sync completed. Success: ${successful}, Failed: ${failed}`);
    } catch (error) {
      console.error('Error in syncGitHubMetrics:', error);
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during sync';
    console.error('Error in syncGitHubMetrics:', errorMessage);
    throw new Error(errorMessage);
  }
}