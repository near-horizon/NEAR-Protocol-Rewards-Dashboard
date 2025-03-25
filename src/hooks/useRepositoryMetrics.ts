import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { syncGitHubMetrics } from '../lib/github';
import type { Repository } from '../types';

const SYNC_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;
const DATA_FRESHNESS_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

function transformRepositoryData(data: any[]): Repository[] {
  if (!Array.isArray(data)) {
    console.error('Expected array of repositories, got:', data);
    return [];
  }
  
  return data.map(repo => ({
    name: repo.name || '',
    url: repo.url || '',
    rewardLevel: repo.reward_level || 'Member',
    totalScore: Number(repo.total_score) || 0,
    scoreTrend: Number(repo.score_trend) || 0,
    weeklyReward: Number(repo.weekly_reward) || 0,
    monthlyReward: Number(repo.monthly_reward) || 0,
    monthlyProjection: Number(repo.monthly_projection) || 0,
    totalPeriodReward: Number(repo.total_period_reward) || 0,
    activityCount: Number(repo.activity_count) || 0,
    commitScore: Number(repo.commit_score) || 0,
    prScore: Number(repo.pr_score) || 0,
    reviewScore: Number(repo.review_score) || 0,
    issueScore: Number(repo.issue_score) || 0,
    contributionBreakdown: repo.contribution_breakdown || {
      commits: 0,
      prs: 0,
      reviews: 0,
      issues: 0
    },
    lastUpdated: repo.last_updated || new Date().toISOString(),
    periodStart: repo.period_start || new Date().toISOString(),
    periodEnd: repo.period_end || new Date().toISOString(),
    consistencyScore: Number(repo.consistency_score) || 0
  }));
}

export function useRepositoryMetrics(dataView: 'historical' | 'realtime' = 'historical') {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(
    () => {
      const stored = localStorage.getItem('lastSync');
      return stored ? new Date(stored) : null;
    }
  );

  // Check data freshness
  const isDataStale = (lastUpdated: string) => {
    const lastUpdate = new Date(lastUpdated).getTime();
    return Date.now() - lastUpdate > DATA_FRESHNESS_THRESHOLD;
  };

  // Calculate current period dates
  const getPeriodDates = () => {
    const now = new Date();
    
    // Set period start to first day of current month
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Set period end to last day of current month
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString()
    };
  };

  useEffect(() => {
    let isMounted = true;
    let syncInterval: NodeJS.Timeout;
    let retryCount = 0;
    
    // Force historical view until real-time is ready
    const effectiveDataView = 'historical';

    async function syncData() {
      if (syncing) return;
      
      try {
        setSyncing(true);
        await syncGitHubMetrics();
        const now = new Date();
        setLastSync(now);
        localStorage.setItem('lastSync', now.toISOString());
        retryCount = 0;
      } catch (error) {
        console.error('Sync error:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(syncData, RETRY_DELAY * retryCount);
        }
      } finally {
        if (isMounted) {
          setSyncing(false);
        }
      }
    }

    async function fetchRepositories() {
      try {
        const tableName = effectiveDataView === 'historical' ? 'repository_metrics' : 'repository_metrics_realtime';
        console.log(`Fetching data from ${tableName}...`);
        
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        const { data, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .order('total_score', { ascending: false });

        if (fetchError) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retry attempt ${retryCount} of ${MAX_RETRIES}`);
            setTimeout(fetchRepositories, 1000 * retryCount);
            return;
          }
          throw new Error(`Failed to fetch ${dataView} data: ${fetchError.message}`);
        }
        
        if (!data) {
          console.log(`No ${dataView} data available`);
          if (isMounted) {
            setRepositories([]);
            setError(new Error('No repository data available'));
          }
          return;
        }

        console.log(`Fetched ${data.length} repositories`);
        
        if (isMounted) {
          const transformedData = transformRepositoryData(data);
          setRepositories(transformedData);
          
          // Update period dates and ensure data consistency
          const period = getPeriodDates();
          const updatedData = transformedData.map(repo => ({
            ...repo,
            periodStart: period.start,
            periodEnd: period.end,
            lastUpdated: new Date().toISOString()
          }));
          
          setRepositories(updatedData);
          setError(null);

          const staleData = transformedData.some(repo => isDataStale(repo.lastUpdated));
          if (staleData) {
            console.log('Some data is stale, triggering sync...');
            syncData();
          }

          console.log(`Loaded ${transformedData.length} repositories from ${tableName}`);
        }
      } catch (err) {
        console.error('Error fetching repositories:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch repositories'));
          // Keep existing data if there's an error
          if (repositories.length === 0) {
            setRepositories([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Initial load and sync
    async function initialize() {
      await fetchRepositories();
      
      // Check if sync is needed (more than 12 hours since last sync)
      const shouldSync = !lastSync || (Date.now() - lastSync.getTime() > SYNC_INTERVAL);
      if (shouldSync) {
        await syncData();
      }
    }

    initialize();

    // Set up real-time subscription if in realtime mode
    let subscription;
    if (dataView === 'realtime') {
      subscription = supabase
        .channel('repository_metrics_realtime')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'repository_metrics_realtime' },
          fetchRepositories
        )
        .subscribe();

      // Set up periodic sync
      syncInterval = setInterval(async () => {
        if (isMounted) {
          await syncData();
        }
      }, SYNC_INTERVAL);
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [dataView, lastSync]);

  return { repositories, loading, syncing, error };
}