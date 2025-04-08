'use client';

import React from 'react';
import { ExternalLink, GitCommit, GitPullRequest, MessageSquare, CircleDot, TrendingUp, Award, Clock, Users, Zap, BarChart2 } from 'lucide-react';

interface Repository {
  name: string;
  totalScore: number;
  weeklyReward: number;
  monthlyReward?: number;
  rewardLevel: string;
  periodStart: string;
  periodEnd: string;
  commitScore?: number;
  prScore?: number;
  reviewScore?: number;
  issueScore?: number;
  url?: string;
  monthlyProjection?: number;
}

interface RepoCardProps {
  repo: Repository;
}

type LevelColor = {
  [key: string]: string;
};

type LevelIcon = {
  [key: string]: string;
};

export function RepoCard({ repo }: RepoCardProps) {
  const levelColors: LevelColor = {
    Diamond: 'bg-blue-100 text-blue-800 border-blue-200',
    Gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Silver: 'bg-gray-100 text-gray-800 border-gray-200',
    Bronze: 'bg-orange-100 text-orange-800 border-orange-200',
    Member: 'bg-purple-100 text-purple-800 border-purple-200',
    High: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-red-100 text-red-800 border-red-200'
  };

  const levelIcons: LevelIcon = {
    Diamond: '💎',
    Gold: '🏆',
    Silver: '🥈',
    Bronze: '🥉',
    Member: '👤',
    High: '🔥',
    Medium: '⚡',
    Low: '🔋'
  };

  // Calculate activity scores
  const commitScore = repo.commitScore || (repo.totalScore * 0.25);
  const prScore = repo.prScore || (repo.totalScore * 0.20);
  const reviewScore = repo.reviewScore || (repo.totalScore * 0.40);
  const issueScore = repo.issueScore || (repo.totalScore * 0.15);

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate monthly projection vs actual
  const monthlyReward = repo.monthlyReward || (repo.weeklyReward * 4);
  const monthlyProjection = repo.monthlyProjection || monthlyReward;
  const projectionDiff = monthlyProjection - monthlyReward;
  const projectionTrend = projectionDiff >= 0 ? 'up' : 'down';

  // Construir URL do GitHub se não fornecido
  const repoUrl = repo.url || `https://github.com/${repo.name}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">
                {repo.name.split('/')[1] || repo.name}
              </h3>
              <a 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </div>
            <p className="text-sm text-gray-500">{repo.name.split('/')[0]}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${levelColors[repo.rewardLevel] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
              <span>{levelIcons[repo.rewardLevel] || '🔍'}</span>
              {repo.rewardLevel}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 relative">
          <div className="bg-gradient-to-br from-green-50 to-green-50/30 rounded-lg p-4 border border-green-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-1">
              <Award size={16} />
              Weekly Reward
            </div>
            <p className="text-2xl font-bold text-green-700">${repo.weeklyReward.toLocaleString()}</p>
            <div className="mt-2 text-sm flex items-center gap-1">
              <span className="text-gray-600">Monthly:</span>
              <span className="font-medium text-gray-900">${monthlyReward.toLocaleString()}</span>
              {projectionDiff !== 0 && (
                <span className={`flex items-center gap-1 ${projectionTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp size={14} className={`${projectionTrend === 'down' ? 'rotate-180' : ''}`} />
                  {Math.abs(projectionDiff).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">
              <BarChart2 size={16} />
              Performance Score
            </div>
            <p className="text-2xl font-bold text-blue-700">{repo.totalScore.toFixed(0)}</p>
            <div className="mt-2 text-sm text-gray-600">Overall repository performance</div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap size={16} className="text-purple-500" />
            Activity Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <GitCommit size={16} />
                  Commits
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{commitScore.toFixed(0)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <GitPullRequest size={16} />
                  Pull Requests
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{prScore.toFixed(0)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <MessageSquare size={16} />
                  Reviews
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{reviewScore.toFixed(0)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <CircleDot size={16} />
                  Issues
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{issueScore.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Current Period: {formatDate(repo.periodStart)} - {formatDate(repo.periodEnd)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a 
              href={`${repoUrl}/pulls`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="View Pull Requests"
            >
              <GitPullRequest size={16} />
            </a>
            <a 
              href={`${repoUrl}/issues`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="View Issues"
            >
              <MessageSquare size={16} />
            </a>
            <a 
              href={`${repoUrl}/graphs/contributors`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="View Contributors"
            >
              <Users size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 