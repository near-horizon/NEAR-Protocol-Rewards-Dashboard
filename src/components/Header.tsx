'use client';

import React from 'react';
import { Search, ArrowUpDown, LayoutDashboard, List } from 'lucide-react';

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
  sortBy: 'score' | 'reward';
  setSortBy: (value: 'score' | 'reward') => void;
  view: 'dashboard' | 'list';
  setView: (value: 'dashboard' | 'list') => void;
}

export function Header({ 
  search, 
  setSearch, 
  sortBy, 
  setSortBy, 
  view, 
  setView,
}: HeaderProps) {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 py-4">
        {/* Title and Controls Container */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">NEAR Protocol Rewards</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Activity & Rewards Dashboard</p>
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
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown size={18} />
                <span className="text-sm">
                  Sort by {sortBy === 'score' ? 'Score' : 'Reward'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 