import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';
import { ActivityHeatmap } from './ActivityHeatmap';
import type { Repository } from '../types';

interface DashboardStatsProps {
  repositories: Repository[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {entry.name === 'Weekly Reward' ? `$${entry.value.toLocaleString()}` : `${entry.value.toFixed(0)} points`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardStats({ repositories }: DashboardStatsProps) {
  const topRepos = [...repositories]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 8)
    .map(repo => ({
      name: repo.name.split('/')[1],
      commits: repo.commitScore,
      prs: repo.prScore,
      reviews: repo.reviewScore,
      issues: repo.issueScore,
      level: repo.rewardLevel,
      totalScore: repo.totalScore,
    }));

  const COLORS = {
    Diamond: '#3B82F6',
    Gold: '#EAB308',
    Silver: '#6B7280',
    Bronze: '#D97706',
    Member: '#8B5CF6'
  };

  // Calculate rewards and developer counts by level
  const rewardsByLevel = ['Diamond', 'Gold', 'Silver', 'Bronze', 'Member'].map(level => {
    const reposAtLevel = repositories.filter(repo => repo.rewardLevel === level);
    return {
      name: level,
      monthlyReward: level === 'Diamond' ? 10000 : 
                     level === 'Gold' ? 6000 :
                     level === 'Silver' ? 4000 :
                     level === 'Bronze' ? 2000 : 0,
      developers: reposAtLevel.length
    };
  });

  const totalWeeklyRewards = repositories.reduce((sum, repo) => sum + repo.weeklyReward, 0);
  const totalMonthlyRewards = repositories.reduce((sum, repo) => sum + repo.monthlyReward, 0);
  const totalActivities = repositories.reduce((sum, repo) => sum + repo.activityCount, 0);
  const averageScore = repositories.length > 0 
    ? repositories.reduce((sum, repo) => sum + repo.totalScore, 0) / repositories.length 
    : 0;

  return (
    <div className="space-y-10">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Repositories</p>
            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-medium mb-1">Repository Count</p>
                <p className="text-gray-300">Number of repositories actively participating in the rewards program</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{repositories.length}</p>
          <div className="mt-2 text-sm text-gray-500">
            Active in current period
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Total Rewards</p>
            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-medium mb-1">Weekly Rewards</p>
                <p className="text-gray-300">Total weekly rewards distributed to all repositories based on their performance</p>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-3xl font-bold text-green-500">
              ${totalMonthlyRewards.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              ${totalWeeklyRewards.toLocaleString()} per week
            </p>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Across all repositories
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
          <p className="text-3xl font-bold text-blue-500 mt-2">
            {totalActivities.toLocaleString()}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Combined developer actions
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Average Score</p>
            <div className="group relative">
              <Info size={16} className="text-gray-400" />
              <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-medium mb-1">Performance Score</p>
                <p className="text-gray-300">Average score calculated from commit quality, PR impact, review contributions, and issue management</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-500 mt-2">
            {averageScore.toFixed(1)}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Per repository
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Top Performer Contribution Breakdown */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performer Contribution Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topRepos}
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
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="commits" stackId="a" fill="#3B82F6" name="Commits" />
                <Bar dataKey="prs" stackId="a" fill="#10B981" name="Pull Requests" />
                <Bar dataKey="reviews" stackId="a" fill="#8B5CF6" name="Reviews" />
                <Bar dataKey="issues" stackId="a" fill="#F97316" name="Issues" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Breakdown of contribution scores across different activities for top performing repositories
          </p>
        </div>

        {/* Weekly Rewards by Level */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Rewards by Level</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rewardsByLevel}
                margin={{ left: 40, right: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name"
                  stroke="#9CA3AF"
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  stroke="#9CA3AF"
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium text-gray-900 mb-2">{label}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].fill }} />
                              <span className="text-gray-600">Monthly Reward:</span>
                              <span className="font-medium text-gray-900">${data.monthlyReward.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full bg-gray-300" />
                              <span className="text-gray-600">Developers:</span>
                              <span className="font-medium text-gray-900">{data.developers}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="monthlyReward" fill="#3B82F6" name="Monthly Reward">
                  {rewardsByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-4 flex items-center justify-between">
            <span>Monthly rewards distributed across different reward levels</span>
            <span className="text-sm font-medium">
              Total Developers: {repositories.length}
            </span>
          </p>
        </div>
      </div>

      {/* Combined Activity Heatmap */}
      <div className="mt-10">
        <ActivityHeatmap repositories={repositories} />
      </div>
    </div>
  );
}