import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadConfig() {
  vi.resetModules();
  return import('./config');
}

describe('config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to the hosted backend when NEXT_PUBLIC_BACKEND_URL is not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', '');
    const { BACKEND_URL, API_BASE_URL } = await loadConfig();

    expect(BACKEND_URL).toBe('https://bask-backend-slo6.onrender.com');
    expect(API_BASE_URL).toBe('https://bask-backend-slo6.onrender.com/api');
  });

  it('uses NEXT_PUBLIC_BACKEND_URL and strips trailing slashes', async () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:5000//');
    const { BACKEND_URL, API_BASE_URL } = await loadConfig();

    expect(BACKEND_URL).toBe('http://localhost:5000');
    expect(API_BASE_URL).toBe('http://localhost:5000/api');
  });
});
