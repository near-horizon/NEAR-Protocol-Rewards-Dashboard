import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock environment variables
const env = {
  VITE_GITHUB_TOKEN: 'ghp_mocktoken',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key'
};

// Set up environment variables
beforeAll(() => {
  Object.entries(env).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });
  
  // Mock window.fetch
  global.fetch = vi.fn();
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  if (global.fetch) {
    vi.mocked(global.fetch).mockClear();
  }
});

// Clean up after all tests
afterAll(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});