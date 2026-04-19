'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'erin-session-name';

export function useSession() {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setUserNameState(stored);
    } catch (error) {
      console.error('Failed to load session from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUserName = useCallback((name: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, name);
      setUserNameState(name);
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
      // Still update state even if storage fails
      setUserNameState(name);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session from localStorage:', error);
    } finally {
      setUserNameState(null);
    }
  }, []);

  return {
    userName,
    setUserName,
    clearSession,
    isLoading,
    isLoggedIn: !!userName,
  };
}
