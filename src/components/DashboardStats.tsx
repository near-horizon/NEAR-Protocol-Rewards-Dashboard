'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';

// Tipos para os dados da API
interface ApiResponse {
  summary: {
    totalRewards: number;
    totalVolumeTransaction: number;
    activeProjects: number;
    totalActivities: {
      commits: number;
      pullRequests: number;
      reviews: number;
      issues: number;
    };
    totalActivitiesSum: number;
  };
  charts: {
    topPerformerBreakdown: Array<{
      project: string;
      onchainScore: number;
      offchainBreakdown: {
        commits: number;
        pullRequests: number;
        reviews: number;
        issues: number;
      };
      totalScore: number;
      tier: string;
    }>;
    distributionByLevel: Array<{
      tier: string;
      count: number;
      totalReward: number;
      percentage: number;
    }>;
  };
  metadata: {
    period: string;
    generatedAt: string;
    totalProjectsProcessed: number;
    successfulProjects: number;
    failedProjects: number;
  };
}

interface DashboardStatsProps {
  apiData: ApiResponse | null;
}

const COLORS = {
  Diamond: '#3B82F6', // Azul
  Gold: '#EAB308',    // Amarelo/Dourado
  Silver: '#94A3B8',  // Prata
  Bronze: '#D97706',  // Bronze
  Member: '#8B5CF6',  // Roxo
  Low: '#64748B',     // Cinza
  Medium: '#10B981',  // Verde
  High: '#EC4899',    // Rosa
  Contributor: '#10B981', // Verde
  Explorer: '#8B5CF6'     // Roxo
};

export function DashboardStats({ apiData }: DashboardStatsProps) {
  // Usar dados do summary da API
  const totalRewards = apiData?.summary?.totalRewards || 0;
  const totalTransactionVolume = apiData?.summary?.totalVolumeTransaction || 0;
  const activeProjects = apiData?.summary?.activeProjects || 0;
  const totalActivitiesSum = apiData?.summary?.totalActivitiesSum || 0;

  // Preparar dados para o gráfico de contribuição (temporariamente quebrado)
  const contributionBreakdownData = useMemo(() => {
    if (!apiData?.charts?.topPerformerBreakdown) {
      return [];
    }

    return apiData.charts.topPerformerBreakdown.slice(0, 8).map(item => ({
      name: item.project,
      commits: item.offchainBreakdown.commits,
      prs: item.offchainBreakdown.pullRequests,
      reviews: item.offchainBreakdown.reviews,
      issues: item.offchainBreakdown.issues,
      transactionVolume: item.onchainScore,
      contractInteractions: 0,
      uniqueWallets: 0,
      level: item.tier,
      totalScore: item.totalScore
    }));
  }, [apiData]);
  
  // Preparar dados para o gráfico de distribuição por categoria
  const distributionByCategoryData = useMemo(() => {
    if (!apiData?.charts?.distributionByLevel) {
      return [];
    }

    return apiData.charts.distributionByLevel.map(item => ({
      name: item.tier,
      value: item.count,
      fill: COLORS[item.tier as keyof typeof COLORS] || '#CBD5E1'
    }));
  }, [apiData]);

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
            <p className="text-3xl font-bold text-purple-500 mt-2">{totalTransactionVolume.toFixed(2)}</p>
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
          <p className="text-3xl font-bold text-blue-500 mt-2">{activeProjects}</p>
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
                  <li>Commits: {apiData?.summary?.totalActivities?.commits || 0}</li>
                  <li>PRs: {apiData?.summary?.totalActivities?.pullRequests || 0}</li>
                  <li>Reviews: {apiData?.summary?.totalActivities?.reviews || 0}</li>
                  <li>Issues: {apiData?.summary?.totalActivities?.issues || 0}</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-500 mt-2">{totalActivitiesSum.toLocaleString()}</p>
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
                <Bar dataKey="transactionVolume" stackId="a" fill="#EC4899" name="On-chain Score" />
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