import React from 'react';
import { Search, ArrowUpDown, LayoutDashboard, List, History, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { useRepositorySync } from '../hooks/useRepositorySync';

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
  sortBy: 'score' | 'reward';
  setSortBy: (value: 'score' | 'reward') => void;
  view: 'dashboard' | 'list';
  setView: (value: 'dashboard' | 'list') => void;
  dataView: 'historical' | 'realtime';
  setDataView: (value: 'historical' | 'realtime') => void;
}

export function Header({ 
  search, 
  setSearch, 
  sortBy, 
  setSortBy, 
  view, 
  setView,
  dataView,
  setDataView 
}: HeaderProps) {
  const { sync, syncing, lastSync, error } = useRepositorySync();

  const handleSync = async () => {
    try {
      await sync();
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync data. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 py-4">
        {/* Title and Controls Container */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">NEAR Protocol Rewards</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Developer Activity & Rewards Dashboard</p>
          </div>
          
          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search repositories..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Controls Group */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Data View Toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setDataView('historical')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 transition-colors ${
                    dataView === 'historical'
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <History size={18} />
                  <span className="text-sm">Historical</span>
                </button>
                <div className="group relative">
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 px-3 py-2 transition-colors bg-gray-50 text-gray-400 cursor-not-allowed"
                    title="Coming Soon"
                  >
                    <Zap size={18} />
                    <span className="text-sm">Real-time</span>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">Soon</span>
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    Real-time metrics coming soon!
                  </div>
                </div>
              </div>

              {/* View Toggle Buttons */}
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  view === 'dashboard'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <LayoutDashboard size={18} />
                <span className="text-sm">Dashboard</span>
              </button>
              
              <button
                onClick={() => setView('list')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  view === 'list'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <List size={18} />
                <span className="text-sm">List</span>
              </button>

              {/* Sort Button */}
              <button
                onClick={() => setSortBy(sortBy === 'score' ? 'reward' : 'score')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                <ArrowUpDown size={18} />
                <span className="text-sm whitespace-nowrap">Sort by {sortBy === 'score' ? 'Reward' : 'Score'}</span>
              </button>

              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={syncing}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg transition-colors relative ${
                  error ? 'bg-red-50 text-red-600 border border-red-200' :
                  syncing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                <span className="text-sm whitespace-nowrap">
                  {syncing ? 'Syncing...' : 'Sync Data'}
                </span>
                {lastSync && !error && (
                  <div className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                    {new Date(lastSync).toLocaleTimeString()}
                  </div>
                )}
                {error && (
                  <div className="absolute -top-2 -right-2 p-1 text-red-600 rounded-full">
                    <AlertCircle size={16} />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}