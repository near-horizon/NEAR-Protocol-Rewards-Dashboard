import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock environment variables
const env = {
  VITE_GITHUB_TOKEN: 'ghp_mocktoken',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key'
};

beforeEach(() => {
  vi.stubEnv('VITE_GITHUB_TOKEN', env.VITE_GITHUB_TOKEN);
  vi.stubEnv('VITE_SUPABASE_URL', env.VITE_SUPABASE_URL);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY);
});

// Mock Supabase client methods
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSubscribe = vi.fn();
const mockOn = vi.fn().mockReturnThis();
const mockChannel = vi.fn(() => ({
  on: mockOn,
  subscribe: mockSubscribe
}));
const mockFrom = vi.fn(() => ({
  upsert: mockUpsert
}));

// Mock Supabase client
vi.mock('../supabase', () => {
  return {
    supabase: {
      from: mockFrom,
      channel: mockChannel
    }
  };
});

// Import after environment and mocks are set up
import { searchReposWithWorkflow, getRepoMetrics, syncGitHubMetrics } from '../github';

// Setup MSW server for mocking GitHub API
const server = setupServer(
  // Mock search repositories endpoint
  http.get('https://api.github.com/search/code', () => {
    return HttpResponse.json({
      items: [
        {
          repository: {
            full_name: 'test-org/test-repo',
          },
        },
      ],
    });
  }),

  // Mock commit activity endpoint
  http.get('https://api.github.com/repos/test-org/test-repo/stats/commit_activity', () => {
    return HttpResponse.json([
      { total: 10 },
      { total: 15 },
      { total: 20 },
    ]);
  }),

  // Mock pull requests endpoint
  http.get('https://api.github.com/repos/test-org/test-repo/pulls', () => {
    return HttpResponse.json([
      { number: 1, title: 'Test PR 1' },
      { number: 2, title: 'Test PR 2' },
    ]);
  }),

  // Mock PR reviews endpoint
  http.get('https://api.github.com/repos/test-org/test-repo/pulls/*/reviews', () => {
    return HttpResponse.json([
      { id: 1, state: 'APPROVED' },
      { id: 2, state: 'COMMENTED' },
    ]);
  }),

  // Mock issues endpoint
  http.get('https://api.github.com/repos/test-org/test-repo/issues', () => {
    return HttpResponse.json([
      { number: 1, title: 'Test Issue 1' },
      { number: 2, title: 'Test Issue 2' },
    ]);
  }),
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  vi.resetModules();
  server.close();
  vi.clearAllMocks();
});

describe('GitHub API Integration', () => {
  describe('searchReposWithWorkflow', () => {
    it('should find repositories with the workflow file', async () => {
      const repos = await searchReposWithWorkflow();
      expect(repos).toHaveLength(1);
      expect(repos[0]).toBe('test-org/test-repo');
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('https://api.github.com/search/code', () => {
          return HttpResponse.error();
        }),
      );

      await expect(searchReposWithWorkflow()).rejects.toThrow();
    });
  });

  describe('getRepoMetrics', () => {
    it('should calculate repository metrics correctly', async () => {
      const metrics = await getRepoMetrics('test-org/test-repo');
      
      expect(metrics).toEqual({
        commits: 45, // Sum of commit activity
        pullRequests: 2,
        reviews: 4, // 2 reviews per PR
        issues: 2,
      });
    });

    it('should handle missing data gracefully', async () => {
      server.use(
        http.get('https://api.github.com/repos/test-org/test-repo/stats/commit_activity', () => {
          return HttpResponse.json(null);
        }),
      );

      const metrics = await getRepoMetrics('test-org/test-repo');
      expect(metrics.commits).toBe(0);
    });
  });

  describe('syncGitHubMetrics', () => {
    it('should sync metrics to Supabase successfully', async () => {
      await syncGitHubMetrics();

      expect(mockFrom).toHaveBeenCalledWith('repository_metrics_realtime');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should calculate scores and rewards correctly', async () => {
      await syncGitHubMetrics();

      const upsertCall = mockUpsert.mock.calls[0][0];
      expect(upsertCall).toMatchObject({
        name: 'test-org/test-repo',
        url: expect.stringContaining('github.com/test-org/test-repo'),
        activity_count: expect.any(Number),
        commit_score: expect.any(Number),
        pr_score: expect.any(Number),
        review_score: expect.any(Number),
        issue_score: expect.any(Number),
        reward_level: expect.any(String),
        total_score: expect.any(Number),
        weekly_reward: expect.any(Number),
        monthly_reward: expect.any(Number),
        monthly_projection: expect.any(Number),
        contribution_breakdown: expect.any(Object),
        period_start: expect.any(String),
        period_end: expect.any(String),
        last_github_sync: expect.any(String)
      });
    });

    it('should handle API rate limiting', async () => {
      server.use(
        http.get('https://api.github.com/search/code', () => {
          return new HttpResponse(null, {
            status: 403,
            statusText: 'Rate limit exceeded',
          });
        }),
      );

      await expect(syncGitHubMetrics()).rejects.toThrow('GitHub API rate limit exceeded');
    });
  });
});