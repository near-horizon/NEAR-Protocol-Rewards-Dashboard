'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DashboardStats } from '@/components/DashboardStats';
import { RepoCard } from '@/components/RepoCard';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

// Tipos para os dados da API
interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  category: string;
}

interface Level {
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
}

interface Reward {
  score: {
    total: number;
    breakdown: {
      commits: number;
      pullRequests: number;
      reviews: number;
      issues: number;
    }
  };
  breakdown: {
    commits: number;
    pullRequests: number;
    reviews: number;
    issues: number;
  };
  level: Level;
  monetary_reward: number;
  achievements: Achievement[];
  metadata: {
    timestamp: number;
    periodStart: number;
    periodEnd: number;
    source: string;
    projectId: string;
  };
}

interface ApiRepository {
  repository: string;
  period: string;
  timestamp: string;
  metrics: {
    commits: {
      count: number;
      authors: { login: string; count: number }[];
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
  };
  reward: Reward;
}

interface ApiResponse {
  projects: ApiRepository[];
  dashboard: {
    total_commits: number;
    total_projects: number;
    total_monetary_rewards: number;
  };
}

// Mock data como fallback
const mockRepositories = [
  {
    name: 'near/core-contracts',
    totalScore: 850,
    weeklyReward: 250,
    rewardLevel: 'High',
    periodStart: '2024-03-01T00:00:00Z',
    periodEnd: '2024-03-31T23:59:59Z',
  },
  {
    name: 'near/near-api-js',
    totalScore: 720,
    weeklyReward: 180,
    rewardLevel: 'Medium',
    periodStart: '2024-03-01T00:00:00Z',
    periodEnd: '2024-03-31T23:59:59Z',
  },
  {
    name: 'near/near-wallet',
    totalScore: 650,
    weeklyReward: 150,
    rewardLevel: 'Medium',
    periodStart: '2024-03-01T00:00:00Z',
    periodEnd: '2024-03-31T23:59:59Z',
  },
  {
    name: 'near/near-cli',
    totalScore: 450,
    weeklyReward: 100,
    rewardLevel: 'Low',
    periodStart: '2024-03-01T00:00:00Z',
    periodEnd: '2024-03-31T23:59:59Z',
  },
];

// Dados mockados no formato da API para uso quando a API não estiver disponível
const mockApiData: ApiResponse = {
  projects: [
    {
      repository: 'finowl-near/finowl-app',
      period: '2025-04',
      timestamp: '2025-04-06T01:45:36.952505',
      metrics: {
        commits: {
          count: 3,
          authors: [
            { login: 'finowl-near', count: 1 },
            { login: 'unknown', count: 1 },
            { login: 'KD-ayoub', count: 1 }
          ],
        },
        pull_requests: {
          open: 0,
          merged: 1,
          closed: 0,
          authors: ['B-Naoufal'],
        },
        reviews: {
          count: 61,
          authors: ['B-Naoufal', 'KD-ayoub', 'finowl-near'],
        },
        issues: {
          open: 0,
          closed: 1,
          participants: ['B-Naoufal'],
        },
      },
      reward: {
        score: {
          total: 22.96666666666667,
          breakdown: {
            commits: 1.0499999999999998,
            pullRequests: 1.25,
            reviews: 20.0,
            issues: 0.6666666666666667,
          },
        },
        breakdown: {
          commits: 1.0499999999999998,
          pullRequests: 1.25,
          reviews: 20.0,
          issues: 0.6666666666666667,
        },
        level: {
          name: 'Member',
          minScore: 0,
          maxScore: 49,
          color: '#A4A4A4',
        },
        monetary_reward: 500,
        achievements: [
          {
            id: 'review-expert',
            name: 'Review Expert',
            description: 'Completed 30 or more code reviews',
            earnedAt: '2025-04-06T01:45:36.952551',
            category: 'review',
          },
        ],
        metadata: {
          timestamp: 1743903936952,
          periodStart: 1743465600000,
          periodEnd: 1743903936952,
          source: 'github',
          projectId: 'finowl-near/finowl-app',
        },
      },
    },
    {
      repository: 'wootzapp/wootz-browser',
      period: '2025-04',
      timestamp: '2025-04-06T01:46:10.995628',
      metrics: {
        commits: {
          count: 4,
          authors: [
            { login: 'pandey019', count: 1 },
            { login: '1311-hack1', count: 1 },
            { login: 'kritagya-khanna', count: 2 }
          ],
        },
        pull_requests: {
          open: 1,
          merged: 0,
          closed: 0,
          authors: ['kritagya-khanna'],
        },
        reviews: {
          count: 12,
          authors: ['balrampandeydmifin', 'pandey019'],
        },
        issues: {
          open: 0,
          closed: 0,
          participants: [],
        },
      },
      reward: {
        score: {
          total: 9.400000000000002,
          breakdown: {
            commits: 1.4,
            pullRequests: 0.0,
            reviews: 8.000000000000002,
            issues: 0.0,
          },
        },
        breakdown: {
          commits: 1.4,
          pullRequests: 0.0,
          reviews: 8.000000000000002,
          issues: 0.0,
        },
        level: {
          name: 'Member',
          minScore: 0,
          maxScore: 49,
          color: '#A4A4A4',
        },
        monetary_reward: 500,
        achievements: [],
        metadata: {
          timestamp: 1743903970995,
          periodStart: 1743465600000,
          periodEnd: 1743903970995,
          source: 'github',
          projectId: 'wootzapp/wootz-browser',
        },
      },
    },
  ],
  dashboard: {
    total_commits: 11,
    total_projects: 6,
    total_monetary_rewards: 3000,
  },
};

export default function Home() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'reward'>('score');
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Add timeout to avoid infinite wait
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        try {
          // Use local API route defined in Next.js rewrites
          const response = await fetch('/api/dashboard', {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Request error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Data received successfully:', data);
          setApiData(data);
          setError(null);
        } catch (fetchError) {
          console.error('Error fetching API data:', fetchError);
          
          // Use mock data as fallback
          console.log('Using mock data as fallback due to network error');
          setApiData(mockApiData);
          setError(new Error('Could not connect to API. Using sample data.'));
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Transformar dados da API para o formato que nossa aplicação usa
  const repositories = useMemo(() => {
    if (!apiData) {
      console.log('Usando dados mockados como fallback');
      return mockRepositories;
    }
    
    try {
      return apiData.projects.map(project => {
        const commitScore = project.reward.breakdown.commits;
        const prScore = project.reward.breakdown.pullRequests;
        const reviewScore = project.reward.breakdown.reviews;
        const issueScore = project.reward.breakdown.issues;
        
        // Estimar contagem de atividades baseado nos scores (valores aproximados)
        const activityCount = Math.round(
          (project.metrics.commits.count || 0) + 
          ((project.metrics.pull_requests.merged || 0) + (project.metrics.pull_requests.open || 0)) + 
          (project.metrics.reviews.count || 0) + 
          ((project.metrics.issues.open || 0) + (project.metrics.issues.closed || 0))
        );
        
        return {
          name: project.repository,
          totalScore: project.reward.score.total,
          weeklyReward: project.reward.monetary_reward,
          monthlyReward: project.reward.monetary_reward * 4, // Estimativa mensal
          rewardLevel: project.reward.level.name,
          periodStart: new Date(project.reward.metadata.periodStart).toISOString(),
          periodEnd: new Date(project.reward.metadata.periodEnd).toISOString(),
          commitScore: commitScore,
          prScore: prScore,
          reviewScore: reviewScore,
          issueScore: issueScore,
          activityCount: activityCount
        };
      });
    } catch (err) {
      console.error('Erro ao processar dados da API:', err);
      return mockRepositories;
    }
  }, [apiData]);

  // Ensure unique repositories by name
  const uniqueRepositories = useMemo(() => {
    const repoMap = new Map();
    repositories.forEach(repo => {
      if (!repoMap.has(repo.name)) {
        repoMap.set(repo.name, repo);
      }
    });
    return Array.from(repoMap.values());
  }, [repositories]);

  const filteredAndSortedRepos = useMemo(() => {
    return uniqueRepositories
      .filter(repo => 
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        repo.rewardLevel.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'score') {
          return b.totalScore - a.totalScore;
        }
        return b.weeklyReward - a.weeklyReward;
      });
  }, [uniqueRepositories, search, sortBy]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        view={view}
        setView={setView}
      />

      <main className="flex-grow max-w-[2000px] mx-auto px-6 py-12 w-full">
        {error && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Warning: {error.message}</p>
              <p className="text-sm">Displaying sample data. Please try again later.</p>
            </div>
          </div>
        )}
        
        {view === 'dashboard' ? (
          <DashboardStats 
            repositories={uniqueRepositories} 
            dashboardData={apiData?.dashboard}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
            {filteredAndSortedRepos.map((repo) => (
              <RepoCard key={repo.name} repo={repo} />
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
                <p>Current reward period: {uniqueRepositories[0]?.periodStart.split('T')[0]} to {uniqueRepositories[0]?.periodEnd.split('T')[0]}</p>
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
