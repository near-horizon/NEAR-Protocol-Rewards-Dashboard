import React, { useEffect, useState } from 'react';
import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';
import { Loader2 } from 'lucide-react';
import { octokit } from '../lib/github';
import type { Repository } from '../types';

interface ActivityHeatmapProps {
  repositories: Repository[];
}

interface Contribution {
  date: string;
  count: number;
}

export function ActivityHeatmap({ repositories }: ActivityHeatmapProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [commitsByDate] = useState(new Map<string, number>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // List of known non-existent repositories to skip
  const nonExistentRepos = [
    'jbarnes850/protocol-rewards-admin',
    'keypom/multichain-trial-accounts',
    'keypom/events-account-factory',
    'pzprado/x-interface',
    'petersalomonsen/quickjs-rust-near',
    'ahnafalfariza/scavene',
    'finowl-near/finowl-app',
    'keypom/keypom-js',
    'derek2403/near',
    'dapplets/mutable-web-monorepo',
    'keypom/keypom-events-app',
    'darts2024/dart-sdxl',
    'partagexyz/1000fans'
  ];

  useEffect(() => {
    async function fetchContributions() {
      try {
        setLoading(true);
        setError(null);

        // Get the period dates from the first repository
        if (!repositories.length) {
          throw new Error('No repositories available');
        }

        const periodStart = new Date(repositories[0].periodStart);
        const periodEnd = new Date(repositories[0].periodEnd);

        // Fetch commits for all repositories in parallel
        const allCommits = await Promise.all(
          repositories.map(async (repo) => {
            // Skip known non-existent repositories
            if (nonExistentRepos.includes(repo.name)) {
              console.log(`Skipping known non-existent repository: ${repo.name}`);
              return [];
            }

            const [owner, name] = repo.name.split('/');
            try {
              const { data } = await octokit.repos.listCommits({
                owner,
                repo: name,
                since: periodStart.toISOString(),
                until: periodEnd.toISOString(),
                per_page: 100
              });
              return data || [];
            } catch (err) {
              if (err.status !== 404 && err.status !== 409 && err.status !== 451) {
                console.error(`Error fetching commits for ${repo.name}:`, err);
              }
              return [];
            }
          })
        );

        // Aggregate commits by date
        allCommits.flat().forEach((commit) => {
          if (!commit?.commit?.author?.date) return;
          
          const date = new Date(commit.commit.author.date)
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '/');
          
          commitsByDate.set(date, (commitsByDate.get(date) || 0) + 1);
        });

        // Convert to HeatMap format
        const aggregatedContributions = Array.from(commitsByDate.entries())
          .map(([date, count]) => ({
            date,
            count
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setContributions(aggregatedContributions);
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contribution data');
      } finally {
        setLoading(false);
      }
    }

    if (repositories.length > 0) {
      fetchContributions();
    }
  }, [repositories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Combined Activity Heatmap</h3>
        <div className="text-sm text-gray-500">
          Current Period: {new Date(repositories[0]?.periodStart).toLocaleDateString()} - {new Date(repositories[0]?.periodEnd).toLocaleDateString()}
        </div>
      </div>
      <div className="relative w-full overflow-x-auto">
        <HeatMap
          value={contributions}
          width={1200}
          height={240}
          rectSize={28}
          space={8}
          rectProps={{
            rx: 3,
          }}
          startDate={repositories[0] ? new Date(repositories[0].periodStart) : undefined}
          endDate={repositories[0] ? new Date(repositories[0].periodEnd) : undefined}
          legendCellSize={28}
          weekLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
          monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
          style={{ 
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          rectRender={(props, data) => {
            // Calculate date range
            const startDate = repositories[0] ? new Date(repositories[0].periodStart) : new Date();
            const endDate = repositories[0] ? new Date(repositories[0].periodEnd) : new Date();
            const currentDate = new Date(data.date);

            // Only render if date is within range
            if (currentDate < startDate || currentDate > endDate) {
              return null;
            }
            
            // Add tooltip content
            const tooltipContent = (
              <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg min-w-[200px]">
                <p className="font-medium text-base">
                  {new Date(data.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-300 mt-2 text-base">
                  {data.count} contribution{data.count !== 1 ? 's' : ''}
                </p>
              </div>
            );

            // Add empty blocks for dates without contributions
            if (!data.count) {
              return (
                <Tooltip 
                  placement="top" 
                  content={tooltipContent}
                  mouseEnterDelay={0.1}
                  mouseLeaveDelay={0.5}
                  className="tooltip-persistent"
                  overlayStyle={{ 
                    fontSize: '14px',
                    zIndex: 50,
                    opacity: 1,
                    visibility: 'visible',
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                >
                  <rect
                    {...props}
                    fill="#ebedf0"
                    rx={4}
                    className="transition-colors duration-300 hover:fill-gray-200"
                  />
                </Tooltip>
              );
            }

            return (
              <Tooltip 
                placement="top" 
                content={tooltipContent}
                mouseEnterDelay={0.1}
                mouseLeaveDelay={0.5}
                className="tooltip-persistent"
                overlayStyle={{ 
                  fontSize: '14px',
                  zIndex: 50,
                  opacity: 1,
                  visibility: 'visible',
                  transition: 'opacity 0.3s ease-in-out'
                }}
              >
                <rect {...props} rx={4} className="transition-colors duration-300" />
              </Tooltip>
            );
          }}
          panelColors={[
            '#ebedf0',
            '#9be9a8',
            '#3ac061',
            '#2ea44f',
            '#216e3a'
          ]}
        />
      </div>
      <div className="mt-8 flex items-center justify-end gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            {['#ebedf0', '#9be9a8', '#3ac061', '#2ea44f', '#216e3a'].map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}