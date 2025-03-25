import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useRepositoryMetrics } from '../hooks/useRepositoryMetrics';

// Mock data
const mockRepositories = [
  {
    name: 'test-org/test-repo',
    url: 'https://github.com/test-org/test-repo',
    rewardLevel: 'Diamond',
    totalScore: 95,
    scoreTrend: 5,
    weeklyReward: 5000,
    monthlyReward: 20000,
    monthlyProjection: 20000,
    activityCount: 150,
    commitScore: 100,
    prScore: 80,
    reviewScore: 70,
    issueScore: 60,
    contributionBreakdown: {
      commits: 40,
      prs: 30,
      reviews: 20,
      issues: 10
    },
    periodStart: '2024-01-01T00:00:00Z',
    periodEnd: '2024-01-31T23:59:59Z',
    lastUpdated: new Date().toISOString()
  }
];

// Mock Supabase client
const mockSelect = vi.fn().mockResolvedValue({ data: mockRepositories, error: null });
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockSubscribe = vi.fn();
const mockOn = vi.fn().mockReturnThis();
const mockChannel = vi.fn(() => ({
  on: mockOn,
  subscribe: mockSubscribe
}));

vi.mock('../supabase', () => ({
  supabase: {
    from: mockFrom,
    channel: mockChannel
  }
}));

describe('useRepositoryMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Historical View', () => {
    it('should fetch historical data correctly', async () => {
      const { result, waitForNextUpdate } = renderHook(() => 
        useRepositoryMetrics('historical')
      );

      expect(result.current.loading).toBe(true);
      expect(result.current.repositories).toHaveLength(0);

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.repositories).toHaveLength(1);
      expect(result.current.repositories[0].name).toBe('test-org/test-repo');
      expect(mockFrom).toHaveBeenCalledWith('repository_metrics');
    });

    it('should handle fetch errors gracefully', async () => {
      mockSelect.mockResolvedValueOnce({ data: null, error: new Error('Fetch failed') });

      const { result, waitForNextUpdate } = renderHook(() => 
        useRepositoryMetrics('historical')
      );

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Fetch failed');
    });
  });

  describe('Real-time View', () => {
    it('should set up real-time subscription', async () => {
      const { result, waitForNextUpdate } = renderHook(() => 
        useRepositoryMetrics('realtime')
      );

      await waitForNextUpdate();

      expect(mockChannel).toHaveBeenCalled();
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.any(Object),
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should update data when receiving real-time updates', async () => {
      const { result, waitForNextUpdate } = renderHook(() => 
        useRepositoryMetrics('realtime')
      );

      await waitForNextUpdate();

      const newData = {
        ...mockRepositories[0],
        totalScore: 98,
        weeklyReward: 5500
      };

      // Simulate real-time update
      act(() => {
        const onChangeCallback = mockOn.mock.calls[0][2];
        onChangeCallback({ new: newData });
      });

      expect(result.current.repositories[0].totalScore).toBe(98);
      expect(result.current.repositories[0].weeklyReward).toBe(5500);
    });

    it('should clean up subscription on unmount', async () => {
      const mockUnsubscribe = vi.fn();
      mockSubscribe.mockReturnValueOnce({ unsubscribe: mockUnsubscribe });

      const { unmount, waitForNextUpdate } = renderHook(() => 
        useRepositoryMetrics('realtime')
      );

      await waitForNextUpdate();
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Data Processing', () => {
    it('should ensure unique repositories', async () => {
      const duplicateData = [...mockRepositories, mockRepositories[0]];
      mockSelect.mockResolvedValueOnce({ data: duplicateData, error: null });

      const { result, waitForNextUpdate } = renderHook(() => 
        useRepositoryMetrics('historical')
      );

      await waitForNextUpdate();

      expect(result.current.repositories).toHaveLength(1);
    });

    it('should handle empty data', async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });

      const { result, waitForNextUpdate } = renderHook(() => 
        useRepositoryMetrics('historical')
      );

      await waitForNextUpdate();

      expect(result.current.repositories).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });
});