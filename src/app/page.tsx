'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { RepoCard } from '@/components/RepoCard';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

// Tipos para os dados da API
interface RawOnchainData {
  metadata: {
    period: {
      start_date: string;
      end_date: string;
    };
    account_id: string;
    timestamp: string;
  };
  transactions: Array<{
    hash: string;
    timestamp: string;
    type: string;
    amount: number;
  }>;
}

interface ProjectData {
  project: string;
  wallet: string;
  github: string;
  website?: string;
  repositorie: string;
  period: string;
  timestamp: string;
  metrics_onchain: OnchainMetrics;
  rewards_onchain: OnchainRewards;
  rawdata_onchain: RawOnchainData;
  metrics_offchain: OffchainMetrics;
  rewards_offchain: OffchainRewards;
  rawdata_offchain: RawOffchainData;
  rewards_total: TotalRewards;
}

interface OnchainMetrics {
  transaction_volume: number;
  contract_interactions: number;
  unique_wallets: number;
}

interface OnchainRewards {
  score: ScoreWithNormalization;
  level: RewardLevel;
  total_reward: number;
}

interface OffchainMetrics {
  commits: {
    count: number;
    authors: AuthorCount[];
  };
  pull_requests: {
    open: number;
    merged: number;
    closed: number;
    authors: string[];
  };
  reviews: {
    count: number;
    authors: string[];
  };
  issues: {
    open: number;
    closed: number;
    participants: string[];
  };
}

interface OffchainRewards {
  score: Score;
  level: RewardLevel;
  total_reward: number;
}

interface RawOffchainData {
  commits: {
    count: number;
    authors: AuthorCount[];
  };
  pull_requests: {
    open: number;
    merged: number;
    closed: number;
    authors: string[];
  };
  reviews: {
    count: number;
    authors: string[];
  };
  issues: {
    open: number;
    closed: number;
    participants: string[];
  };
}

interface TotalRewards {
  score: {
    total: number;
    breakdown: {
      onchain: number;
      offchain: number;
    };
  };
  level: RewardLevel;
  total_reward: number;
}

interface Score {
  total: number;
  breakdown: {
    commits: number;
    pullRequests: number;
    reviews: number;
    issues: number;
  };
}

interface ScoreWithNormalization {
  total: number;
  normalized: number;
  breakdown: {
    transactionVolume: number;
    contractInteractions: number;
    uniqueWallets: number;
  };
}

interface RewardLevel {
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
}

interface AuthorCount {
  login: string;
  count: number;
}

interface ApiResponse {
  projects: ProjectData[];
  dashboard: {
    total_commits: number;
    total_projects: number;
    total_monetary_rewards: number;
  };
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
          const response = await fetch('https://near-protocol-rewards-tracking.com/dashboard', {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API Response:', data);
          setApiData(data);
          setError(null);
        } catch (fetchError) {
          console.error('Error fetching API data:', fetchError);
          setError(new Error('Unable to load Dashboard data. Please try again later.'));
          setApiData(null);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setApiData(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Transform API data to our application format
  const repositories = useMemo(() => {
    console.log('apiData:', apiData);
    if (!apiData || !Array.isArray(apiData)) {
      console.log('No projects data available');
      return [];
    }
    
    try {
      const transformedRepos = apiData.map(project => {
        console.log('Processing project:', project);
        
        // Criar objeto Repository com a nova estrutura
        return {
          project: project.project || 'Unknown Project',
          wallet: project.wallet || '',
          github: project.github || '',
          website: project.website || '',
          repository: Array.isArray(project.repository) ? project.repository : [],
          period: project.period || '',
          timestamp: project.timestamp || '',
          totalScore: project.rewards_total?.score?.total || 0,
          rewardLevel: project.rewards_total?.level?.name || 'Unknown',
          metrics_onchain: project.metrics_onchain || {
            transaction_volume: 0,
            contract_interactions: 0,
            unique_wallets: 0
          },
          rewards_onchain: project.rewards_onchain || {
            total_reward: 0
          },
          rewards_offchain: project.rewards_offchain || {
            total_reward: 0
          },
          metrics_offchain: project.metrics_offchain || {
            commits: { count: 0 },
            pull_requests: { open: 0, merged: 0 },
            reviews: { count: 0 },
            issues: { open: 0, closed: 0 }
          },
          rewards_total: project.rewards_total || {
            total_reward: 0
          }
        };
      });
      
      console.log('All transformed repos:', transformedRepos);
      return transformedRepos;
    } catch (err) {
      console.error('Error processing API data:', err);
      return [];
    }
  }, [apiData]);

  // Ensure unique repositories by wallet
  const uniqueRepositories = useMemo(() => {
    const repoMap = new Map();
    repositories.forEach(repo => {
      if (!repoMap.has(repo.wallet)) {
        repoMap.set(repo.wallet, repo);
      }
    });
    return Array.from(repoMap.values());
  }, [repositories]);

  const filteredAndSortedRepos = useMemo(() => {
    return uniqueRepositories
      .filter(repo => 
        repo.project.toLowerCase().includes(search.toLowerCase()) ||
        repo.rewardLevel.toLowerCase().includes(search.toLowerCase()) ||
        (repo.wallet && repo.wallet.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [uniqueRepositories, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading repository metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading data</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <p className="text-sm text-gray-500">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        search={search}
        setSearch={setSearch}
        view={view}
        setView={setView}
      />

      <main className="flex-grow max-w-[2000px] mx-auto px-6 py-12 w-full">
        {view === 'dashboard' ? (
          <DashboardStats 
            repositories={uniqueRepositories} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
            {filteredAndSortedRepos.map((repo) => (
              <RepoCard key={repo.wallet || repo.project} repo={repo} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-[2000px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">NEAR Protocol Rewards</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                A transparent, metric-based rewards system for NEAR projects that directly ties incentives to development activity and user adoption.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Developer Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://docs.near.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a 
                    href="https://near.org/developers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Developer Portal
                  </a>
                </li>
                <li>
                  <a 
                    href="https://near.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    NEAR Website
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Protocol Rewards</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Program Overview
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Quick Start Guide
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Troubleshooting
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Program Updates</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>Current reward period: {uniqueRepositories[0]?.period || 'N/A'}</p>
                <p>Active repositories: {uniqueRepositories.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500">
                © {new Date().getFullYear()} NEAR Protocol. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a 
                  href="/terms-and-conditions"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Terms & Conditions
                </a>
                <a 
                  href="/privacy-policy"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
