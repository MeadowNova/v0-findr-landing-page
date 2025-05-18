import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tokenRefresh } from '@/lib/auth/tokenRefresh';
import { supabase } from '@/lib/supabase/client';

// Mock the supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
}));

describe('Token Refresh Utility', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore all mocks after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSessionExpired', () => {
    it('should return true if session is null', () => {
      expect(tokenRefresh.isSessionExpired(null)).toBe(true);
    });

    it('should return false if session has no expires_at', () => {
      const session = { expires_at: undefined } as any;
      expect(tokenRefresh.isSessionExpired(session)).toBe(false);
    });

    it('should return true if session is expired', () => {
      const now = Math.floor(Date.now() / 1000);
      const session = { expires_at: now - 100 } as any;
      expect(tokenRefresh.isSessionExpired(session)).toBe(true);
    });

    it('should return true if session expires within buffer time', () => {
      const now = Math.floor(Date.now() / 1000);
      const session = { expires_at: now + 30 } as any;
      expect(tokenRefresh.isSessionExpired(session, 60)).toBe(true);
    });

    it('should return false if session is not expired and not within buffer time', () => {
      const now = Math.floor(Date.now() / 1000);
      const session = { expires_at: now + 120 } as any;
      expect(tokenRefresh.isSessionExpired(session, 60)).toBe(false);
    });
  });

  describe('refreshSession', () => {
    it('should return null if refresh fails', async () => {
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null },
        error: new Error('Refresh failed'),
      } as any);

      const result = await tokenRefresh.refreshSession();
      expect(result).toBeNull();
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
    });

    it('should return the refreshed session if refresh succeeds', async () => {
      const mockSession = { access_token: 'new_token' };
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await tokenRefresh.refreshSession();
      expect(result).toBe(mockSession);
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAndRefreshSessionIfNeeded', () => {
    it('should return null if no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await tokenRefresh.getAndRefreshSessionIfNeeded();
      expect(result).toBeNull();
      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
    });

    it('should return the current session if not expired', async () => {
      const now = Math.floor(Date.now() / 1000);
      const mockSession = { expires_at: now + 3600 };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await tokenRefresh.getAndRefreshSessionIfNeeded();
      expect(result).toBe(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
    });

    it('should refresh the session if expired', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredSession = { expires_at: now - 100 };
      const refreshedSession = { expires_at: now + 3600 };
      
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: expiredSession },
        error: null,
      } as any);
      
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: refreshedSession },
        error: null,
      } as any);

      const result = await tokenRefresh.getAndRefreshSessionIfNeeded();
      expect(result).toBe(refreshedSession);
      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
    });
  });
});