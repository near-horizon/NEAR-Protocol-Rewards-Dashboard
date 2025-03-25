import { describe, it, expect } from 'vitest';
import { calculateScore, calculateRewardLevel, calculateContributionBreakdown } from '../metrics';

describe('Metrics Calculations', () => {
  describe('calculateScore', () => {
    it('should calculate total score correctly', () => {
      const metrics = {
        commits: 50,
        pullRequests: 10,
        reviews: 15,
        issues: 15
      };

      const score = calculateScore(metrics);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle zero activity', () => {
      const metrics = {
        commits: 0,
        pullRequests: 0,
        reviews: 0,
        issues: 0
      };

      const score = calculateScore(metrics);
      expect(score).toBe(0);
    });

    it('should cap scores at maximum thresholds', () => {
      const metrics = {
        commits: 1000,
        pullRequests: 100,
        reviews: 100,
        issues: 100
      };

      const score = calculateScore(metrics);
      expect(score).toBe(100);
    });
  });

  describe('calculateRewardLevel', () => {
    it('should assign Diamond level correctly', () => {
      const { level, weeklyReward } = calculateRewardLevel(95);
      expect(level).toBe('Diamond');
      expect(weeklyReward).toBe(5000);
    });

    it('should assign Gold level correctly', () => {
      const { level, weeklyReward } = calculateRewardLevel(75);
      expect(level).toBe('Gold');
      expect(weeklyReward).toBe(2000);
    });

    it('should assign Silver level correctly', () => {
      const { level, weeklyReward } = calculateRewardLevel(55);
      expect(level).toBe('Silver');
      expect(weeklyReward).toBe(1500);
    });

    it('should assign Bronze level correctly', () => {
      const { level, weeklyReward } = calculateRewardLevel(35);
      expect(level).toBe('Bronze');
      expect(weeklyReward).toBe(1000);
    });

    it('should assign Member level for low scores', () => {
      const { level, weeklyReward } = calculateRewardLevel(20);
      expect(level).toBe('Member');
      expect(weeklyReward).toBe(0);
    });
  });

  describe('calculateContributionBreakdown', () => {
    it('should calculate percentage breakdown correctly', () => {
      const metrics = {
        commits: 50,
        pullRequests: 25,
        reviews: 15,
        issues: 10
      };
      const total = 100;

      const breakdown = calculateContributionBreakdown(metrics, total);
      
      expect(breakdown.commits).toBe(50);
      expect(breakdown.prs).toBe(25);
      expect(breakdown.reviews).toBe(15);
      expect(breakdown.issues).toBe(10);
      
      const sum = Object.values(breakdown).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    });

    it('should handle zero total activity', () => {
      const metrics = {
        commits: 0,
        pullRequests: 0,
        reviews: 0,
        issues: 0
      };
      const total = 0;

      const breakdown = calculateContributionBreakdown(metrics, total);
      
      expect(breakdown).toEqual({
        commits: 0,
        prs: 0,
        reviews: 0,
        issues: 0
      });
    });
  });
});