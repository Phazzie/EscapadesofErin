'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'erin-session-name';

export function useSession() {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setUserNameState(stored);
    setIsLoading(false);
  }, []);

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    setUserNameState(name);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserNameState(null);
  }, []);

  return {
    userName,
    setUserName,
    clearSession,
    isLoading,
    isLoggedIn: !!userName,
  };
}
