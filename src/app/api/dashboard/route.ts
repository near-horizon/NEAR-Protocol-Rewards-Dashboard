import { NextResponse } from 'next/server';

const mockApiData = {
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

export async function GET() {
  try {
    try {
      const response = await fetch('https://near-protocol-rewards-tracking.com/dashboard', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Erro ao buscar dados da API externa, usando dados mockados:', error);
      return NextResponse.json(mockApiData);
    }
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a requisição' },
      { status: 500 }
    );
  }
} 