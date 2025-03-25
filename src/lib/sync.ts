import { supabase } from './supabase';
import type { Repository } from '../types';

// Constants
const SYNC_TIMEOUT = 30000; // 30 second timeout for sync operations
const MAX_BATCH_SIZE = 50; // Maximum number of records to process at once

interface SyncStatus {
  lastSync: Date | null;
  inProgress: boolean;
  error: Error | null;
}

interface SyncResult {
  success: boolean;
  timestamp: Date;
  newRecords: number;
  updatedRecords: number;
  errors: string[];
}

// In-memory cache for sync status
let syncStatus: SyncStatus = {
  lastSync: null,
  inProgress: false,
  error: null
};

// Initialize sync status from localStorage
try {
  const stored = localStorage.getItem('syncStatus');
  if (stored) {
    const parsed = JSON.parse(stored);
    syncStatus.lastSync = parsed.lastSync ? new Date(parsed.lastSync) : null;
  }
} catch (error) {
  console.error('Error loading sync status:', error);
}

// Update sync status and persist to localStorage
function updateSyncStatus(updates: Partial<SyncStatus>) {
  syncStatus = { ...syncStatus, ...updates };
  try {
    localStorage.setItem('syncStatus', JSON.stringify({
      lastSync: syncStatus.lastSync?.toISOString(),
      inProgress: syncStatus.inProgress
    }));
  } catch (error) {
    console.error('Error saving sync status:', error);
  }
}

// Get current sync status
export function getSyncStatus(): SyncStatus {
  return { ...syncStatus };
}

// Merge local and remote data, handling conflicts
function mergeData(local: Repository[], remote: Repository[]): Repository[] {
  const merged = new Map<string, Repository>();
  
  // Add all local records to map
  local.forEach(repo => merged.set(repo.name, repo));
  
  // Merge remote records, newer data takes precedence
  remote.forEach(repo => {
    const existing = merged.get(repo.name);
    if (!existing || new Date(repo.lastUpdated) > new Date(existing.lastUpdated)) {
      merged.set(repo.name, repo);
    }
  });
  
  return Array.from(merged.values());
}

// Sync data with remote database
export async function syncData(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    timestamp: new Date(),
    newRecords: 0,
    updatedRecords: 0,
    errors: []
  };

  // Prevent multiple syncs
  if (syncStatus.inProgress) {
    throw new Error('Sync already in progress');
  }

  const syncTimeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Sync timeout')), SYNC_TIMEOUT);
  });

  try {
    updateSyncStatus({ inProgress: true, error: null });

    // Race between sync operation and timeout
    await Promise.race([
      (async () => {
        // Get local data
        const localData = await getLocalData();
        
        // Fetch new records from Supabase
        const { data: remoteData, error } = await supabase
          .from('repository_metrics')
          .select('*')
          .gt('last_updated', syncStatus.lastSync?.toISOString() || '1970-01-01')
          .order('last_updated', { ascending: true })
          .limit(MAX_BATCH_SIZE);

        if (error) {
          throw error;
        }

        if (!remoteData) {
          throw new Error('No data received from remote database');
        }

        // Merge data
        const mergedData = mergeData(localData, remoteData);

        // Update local storage
        await saveLocalData(mergedData);

        // Update sync status
        const now = new Date();
        updateSyncStatus({
          lastSync: now,
          inProgress: false,
          error: null
        });

        result.success = true;
        result.timestamp = now;
        result.newRecords = remoteData.length;
        result.updatedRecords = mergedData.length - localData.length;
      })(),
      syncTimeout
    ]);

    return result;
  } catch (error) {
    console.error('Sync failed:', error);
    updateSyncStatus({
      inProgress: false,
      error: error instanceof Error ? error : new Error('Unknown sync error')
    });
    result.timestamp = new Date();
    result.errors.push(error.message);
    return result;
  }
}

// Get data from local storage
async function getLocalData(): Promise<Repository[]> {
  try {
    const stored = localStorage.getItem('repositoryData');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading local data:', error);
    return [];
  }
}

// Save data to local storage
async function saveLocalData(data: Repository[]): Promise<void> {
  try {
    localStorage.setItem('repositoryData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving local data:', error);
    throw error;
  }
}