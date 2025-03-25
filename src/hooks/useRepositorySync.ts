import { useState, useEffect, useCallback } from 'react';
import { syncData, getSyncStatus } from '../lib/sync';

export function useRepositorySync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Constants
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000;

  // Load initial sync status
  useEffect(() => {
    const status = getSyncStatus();
    setLastSync(status.lastSync);
    setError(status.error);
  }, []);

  // Manual sync function
  const sync = useCallback(async () => {
    if (syncing) return;

    let retryCount = 0;
    setSyncing(true);
    setError(null);

    try {
      while (retryCount < MAX_RETRIES) {
        try {
          const result = await syncData();
          if (!result.success) {
            throw new Error(result.errors.join(', '));
          }
          setLastSync(new Date());
          break;
        } catch (err: any) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown sync error';
          console.error(`Sync attempt ${retryCount + 1} failed:`, errorMessage);
          retryCount++;
          if (retryCount === MAX_RETRIES) {
            throw new Error(`Sync failed after ${MAX_RETRIES} attempts: ${errorMessage}`);
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Sync failed');
      setError(error);
      console.error('Final sync error:', error.message);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  return {
    sync,
    syncing,
    lastSync,
    error
  };
}