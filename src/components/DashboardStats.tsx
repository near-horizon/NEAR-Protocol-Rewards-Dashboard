'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';

interface Repository {
  project: string;
  wallet: string;
  github: string;
  repository: string[];
  period: string;
  timestamp: string;
  totalScore: number;
  rewardLevel: string;
  metrics_onchain: {
    transaction_volume: number;
    contract_interactions: number;
    unique_wallets: number;
  };
  rewards_onchain: {
    total_reward: number;
    score?: {
      breakdown?: {
        transactionVolume?: number;
        contractInteractions?: number;
        uniqueWallets?: number;
      };
    };
  };
  rewards_offchain: {
    total_reward: number;
    score?: {
      breakdown?: {
        commits?: number;
        pullRequests?: number;
        reviews?: number;
        issues?: number;
      };
    };
  };
  metrics_offchain: {
    commits: {
      count: number;
    };
    pull_requests: {
      open: number;
      merged: number;
    };
    reviews: {
      count: number;
    };
    issues: {
      open: number;
      closed: number;
    };
  };
  rewards_total: {
    total_reward: number;
  };
}

interface DashboardStatsProps {
  repositories: Repository[];
}

const COLORS = {
  Diamond: '#3B82F6', // Azul
  Gold: '#EAB308',    // Amarelo/Dourado
  Silver: '#94A3B8',  // Prata
  Bronze: '#D97706',  // Bronze
  Member: '#8B5CF6',  // Roxo
  Low: '#64748B',     // Cinza
  Medium: '#10B981',  // Verde
  High: '#EC4899'     // Rosa
};

export function DashboardStats({ repositories }: DashboardStatsProps) {
  // Calcular total de recompensas
  const totalRewards = repositories.reduce((acc, repo) => acc + (repo.rewards_total?.total_reward || 0), 0);
    
  // Calcular volume total de transações
  const totalTransactionVolume = repositories.reduce((acc, repo) => acc + (repo.metrics_onchain?.transaction_volume || 0), 0);
    
  // Número de projetos ativos
  const activeRepos = repositories.length;
  
  // Calcular total de atividades
  const totalActivities = repositories.reduce((sum, repo) => {
    const commits = repo.metrics_offchain?.commits?.count || 0;
    const pullRequests = (repo.metrics_offchain?.pull_requests?.open || 0) + 
                        (repo.metrics_offchain?.pull_requests?.merged || 0);
    const reviews = repo.metrics_offchain?.reviews?.count || 0;
    const issues = (repo.metrics_offchain?.issues?.open || 0) + 
                  (repo.metrics_offchain?.issues?.closed || 0);
    
    return sum + commits + pullRequests + reviews + issues;
  }, 0);

  // Preparar dados para o gráfico de contribuição
  const contributionBreakdownData = useMemo(() => {
    // Ordenar repositórios por pontuação total (decrescente) e pegar os top 8
    return [...repositories]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8)
      .map(repo => {
        // Usar nome do projeto como label
        const displayName = repo.project || 'Unknown Project';
        
        // Usar os scores detalhados da API, se disponíveis, ou calcular baseado nos valores das métricas
        const commits = repo.rewards_offchain?.score?.breakdown?.commits || repo.metrics_offchain?.commits?.count || 0;
        const prs = repo.rewards_offchain?.score?.breakdown?.pullRequests || 
          ((repo.metrics_offchain?.pull_requests?.open || 0) + (repo.metrics_offchain?.pull_requests?.merged || 0));
        const reviews = repo.rewards_offchain?.score?.breakdown?.reviews || repo.metrics_offchain?.reviews?.count || 0;
        const issues = repo.rewards_offchain?.score?.breakdown?.issues || 
          ((repo.metrics_offchain?.issues?.open || 0) + (repo.metrics_offchain?.issues?.closed || 0));
        
        return {
          name: displayName,
          commits: commits,
          prs: prs,
          reviews: reviews,
          issues: issues,
          transactionVolume: repo.rewards_onchain?.score?.breakdown?.transactionVolume || 0,
          contractInteractions: repo.rewards_onchain?.score?.breakdown?.contractInteractions || 0,
          uniqueWallets: repo.rewards_onchain?.score?.breakdown?.uniqueWallets || 0,
          level: repo.rewardLevel,
          totalScore: repo.totalScore
        };
      });
  }, [repositories]);
  
  // Preparar dados para o gráfico de distribuição por categoria
  const distributionByCategoryData = useMemo(() => {
    // Contar quantos repositórios existem em cada nível
    const levelCounts: Record<string, number> = {};
    
    repositories.forEach(repo => {
      const level = repo.rewardLevel;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    
    // Converter para o formato esperado pelo gráfico
    return Object.entries(levelCounts)
      .map(([level, count]) => ({
        name: level,
        value: count,
        fill: COLORS[level as keyof typeof COLORS] || '#CBD5E1' // Usar cor do nível ou cor padrão
      }))
      .sort((a, b) => {
        // Ordenação personalizada por nível
        const levelOrder = ['Diamond', 'Gold', 'Silver', 'Bronze', 'Member', 'High', 'Medium', 'Low'];
        return levelOrder.indexOf(a.name) - levelOrder.indexOf(b.name);
      });
  }, [repositories]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Rewards</p>
            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-medium mb-1">Reward Value</p>
                <p className="text-gray-300">Total monetary rewards distributed to all repositories</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-500 mt-2">${totalRewards.toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-500">
            Across all repositories
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Volume Transaction</p>
            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-medium mb-1">Transaction Volume</p>
                <p className="text-gray-300">Total volume transacted between all wallets within projects on the NEAR network</p>
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-purple-500 mt-2">{totalTransactionVolume.toLocaleString()}</p>
            <p className="text-lg font-medium text-gray-500">NEAR</p>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Across all wallets
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Active Projects</p>
            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-medium mb-1">Repository Count</p>
                <p className="text-gray-300">Number of projects actively participating in the rewards program</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-500 mt-2">{activeRepos}</p>
          <div className="mt-2 text-sm text-gray-500">
            Active in current period
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Activities</p>
            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-medium mb-1">Activity Metrics</p>
                <ul className="text-gray-300 list-disc pl-4 space-y-1">
                  <li>Commits: Code contributions</li>
                  <li>PRs: Pull request submissions</li>
                  <li>Reviews: Code review participation</li>
                  <li>Issues: Bug reports and features</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-500 mt-2">{totalActivities.toLocaleString()}</p>
          <div className="mt-2 text-sm text-gray-500">
            Combined developer actions
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performer Contribution Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contributionBreakdownData}
                layout="vertical"
                margin={{ left: 40, right: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number"
                  stroke="#9CA3AF"
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    return [`${value.toFixed(1)} points`, name];
                  }}
                  labelFormatter={(label) => label}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                  labelStyle={{ color: '#111827', fontWeight: 500 }}
                />
                <Bar dataKey="commits" stackId="a" fill="#3B82F6" name="Commits" />
                <Bar dataKey="prs" stackId="a" fill="#10B981" name="Pull Requests" />
                <Bar dataKey="reviews" stackId="a" fill="#8B5CF6" name="Reviews" />
                <Bar dataKey="issues" stackId="a" fill="#F97316" name="Issues" />
                <Bar dataKey="transactionVolume" stackId="a" fill="#EC4899" name="Transaction Volume" />
                <Bar dataKey="contractInteractions" stackId="a" fill="#F59E0B" name="Contract Interactions" />
                <Bar dataKey="uniqueWallets" stackId="a" fill="#6366F1" name="Unique Wallets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Breakdown of contribution scores across different activities for top performing repositories
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution by Level</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={distributionByCategoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                  height={60}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} repositories`, 'Count']}
                  labelFormatter={(name) => `${name} Level`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {distributionByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Number of repositories in each reward level category
          </p>
        </div>
      </div>
    </div>
  );
} 