import React, { useState } from 'react';
import { Info, Award, TrendingUp, GitPullRequest, ChevronDown, ChevronUp, Github, Calendar, Users, Zap, Book, Globe, MessageCircle } from 'lucide-react';

export function ProgramInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-16 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl">
      <div 
        className="border-b border-gray-200 bg-white px-8 py-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Info size={24} className="text-blue-600" />
            Get Started
          </h2>
          <a
            href="https://github.com/jbarnes850/near-protocol-rewards"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Github size={18} />
            View on GitHub
          </a>
        </div>
        {isExpanded ? (
          <ChevronUp size={24} className="text-gray-400" />
        ) : (
          <ChevronDown size={24} className="text-gray-400" />
        )}
      </div>
      
      {isExpanded && (
        <div className="px-8 py-12 animate-fadeIn space-y-16">
          {/* Quick Start Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">🚀 Quick Start</h3>
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-sm">
              <p className="text-xl text-gray-700 mb-8 font-medium">Start earning rewards in 3 simple steps:</p>
              <ol className="space-y-8">
                <li className="flex items-start gap-6">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">1</span>
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-3">Initialize Your Repository</p>
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-base">
                      npx near-protocol-rewards init
                    </code>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">2</span>
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-3">Push to Main Branch</p>
                    <p className="text-lg text-gray-600">The workflow will automatically start tracking your contributions</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">3</span>
                  <div>
                    <p className="font-bold text-xl text-gray-900 mb-3">Join the Community</p>
                    <p className="text-lg text-gray-600">Connect with other developers and share your progress</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Community & Events */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">🤝 Community & Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 border-2 border-indigo-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Calendar size={24} className="text-indigo-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Weekly Standups</h4>
                </div>
                <p className="text-lg text-gray-700 mb-6 font-medium">
                  Join our weekly community standups every Wednesday at 11am UTC to:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4 text-lg text-gray-600">
                    <Users size={20} className="text-indigo-500" />
                    Meet other NEAR developers
                  </li>
                  <li className="flex items-center gap-4 text-lg text-gray-600">
                    <Zap size={20} className="text-indigo-500" />
                    Share your project updates
                  </li>
                  <li className="flex items-center gap-4 text-lg text-gray-600">
                    <TrendingUp size={20} className="text-indigo-500" />
                    Learn about ecosystem opportunities
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 border-2 border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Award size={24} className="text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Reward Levels</h4>
                </div>
                <ul className="space-y-5">
                  <li className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-3 font-medium text-gray-900">
                      <span className="text-2xl">💎</span> Diamond
                    </span>
                    <span className="font-bold text-emerald-600">$2,500/week</span>
                  </li>
                  <li className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-3 font-medium text-gray-900">
                      <span className="text-2xl">🏆</span> Gold
                    </span>
                    <span className="font-bold text-emerald-600">$1,500/week</span>
                  </li>
                  <li className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-3 font-medium text-gray-900">
                      <span className="text-2xl">🥈</span> Silver
                    </span>
                    <span className="font-bold text-emerald-600">$1,000/week</span>
                  </li>
                  <li className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-3 font-medium text-gray-900">
                      <span className="text-2xl">🥉</span> Bronze
                    </span>
                    <span className="font-bold text-emerald-600">$500/week</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">📚 Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <a 
                href="https://t.me/+ELzfA2QeBrRjYzY5"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:border-blue-200 hover:bg-blue-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <MessageCircle size={28} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-1">Join Our Chat</h4>
                    <p className="text-lg text-gray-600">Connect on Telegram</p>
                  </div>
                </div>
              </a>

              <a 
                href="https://docs.near.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Book size={28} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-1">Documentation</h4>
                    <p className="text-lg text-gray-600">Learn NEAR Development</p>
                  </div>
                </div>
              </a>

              <a 
                href="https://near.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Globe size={28} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-1">NEAR Website</h4>
                    <p className="text-lg text-gray-600">Explore the Ecosystem</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}