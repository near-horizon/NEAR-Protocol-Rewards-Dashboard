'use client';

import React from 'react';
import { ExternalLink, GitCommit, GitPullRequest, MessageSquare, CircleDot, Award, Clock, Users, Zap, BarChart2, Link, Coins, FileCode, Info, Github } from 'lucide-react';

interface Repository {
  project: string;
  wallet: string;
  github: string;
  website?: string;
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
  };
  rewards_offchain: {
    total_reward: number;
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
  const commitScore = repo.metrics_offchain?.commits?.count || 0;
  const prScore = (repo.metrics_offchain?.pull_requests?.open || 0) + (repo.metrics_offchain?.pull_requests?.merged || 0);
  const reviewScore = repo.metrics_offchain?.reviews?.count || 0;
  const issueScore = (repo.metrics_offchain?.issues?.open || 0) + (repo.metrics_offchain?.issues?.closed || 0);

  // Format dates
  const formatDate = (dateString: string) => {
    // Extrai o ano e mês do formato YYYY-MM
    if (dateString.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = dateString.split('-');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    // Formato padrão para outros formatos de data
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Extrair data de timestamp
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Construir URL do projeto
  const projectUrl = repo.website
    ? repo.website.startsWith('http') ? repo.website : `https://${repo.website}`
    : 'https://near.org/';

  // Função para truncar a wallet
  const truncateWallet = (wallet: string) => {
    if (!wallet || wallet.length <= 20) return wallet;
    return `${wallet.slice(0, 12)}...${wallet.slice(-8)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">
                {repo.project}
              </h3>
              <a 
                href={projectUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </div>
            <p className="text-sm text-gray-500">
              {repo.wallet && repo.wallet.trim() !== '' && truncateWallet(repo.wallet)}
            </p>
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
              Total Reward
            </div>
            <p className="text-2xl font-bold text-green-700">${repo.rewards_total?.total_reward.toLocaleString()}</p>
            <div className="mt-2 text-sm text-gray-600">Reward calculated from project metrics</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">
              <BarChart2 size={16} />
              Performance Score
            </div>
            <p className="text-2xl font-bold text-blue-700">{repo.totalScore?.toFixed(0) || '0'}</p>
            <div className="mt-2 text-sm text-gray-600">Overall repository performance</div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap size={16} className="text-purple-500" />
            Activity Metrics
            <div className="relative group">
              <Info size={14} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Breakdown Values
              </div>
            </div>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <GitCommit size={16} />
                  Commits
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{commitScore}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <GitPullRequest size={16} />
                  Pull Requests
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{prScore}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <MessageSquare size={16} />
                  Reviews
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{reviewScore}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <CircleDot size={16} />
                  Issues
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{issueScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onchain Metrics */}
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
            <Link size={16} className="text-blue-500" />
            Onchain Metrics
            <div className="relative group">
              <Info size={14} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Absolute Values just for mainnet
              </div>
            </div>
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <Coins size={16} />
                Transaction Volume
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{Math.round(repo.metrics_onchain?.transaction_volume || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <Users size={16} />
                Unique Wallets
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{(repo.metrics_onchain?.unique_wallets || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <FileCode size={16} />
                Contract Interactions
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{(repo.metrics_onchain?.contract_interactions || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Github Projects */}
        {repo.repository && repo.repository.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
              <Github size={16} className="text-gray-700" />
              Github Projects
            </h4>
            <div className="space-y-2">
              {repo.repository.map((repoUrl, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600 truncate">
                    <a 
                      href={`https://github.com/${repoUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline truncate"
                    >
                      {repoUrl}
                    </a>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Current Period: {formatDate(repo.period)} - {formatTimestamp(repo.timestamp)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {repo.repository && repo.repository.length > 0 && (
              <>
                <a 
                  href={`https://github.com/${repo.repository[0]}/pulls`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="View Pull Requests"
                >
                  <GitPullRequest size={16} />
                </a>
                <a 
                  href={`https://github.com/${repo.repository[0]}/issues`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="View Issues"
                >
                  <MessageSquare size={16} />
                </a>
                <a 
                  href={`https://github.com/${repo.repository[0]}/graphs/contributors`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="View Contributors"
                >
                  <Users size={16} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 