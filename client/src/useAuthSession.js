import { useState, useEffect, useCallback } from 'react';

export const useAuthSession = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cyvora_user');
      const expiresAt = localStorage.getItem('cyvora_session_expiry');

      if (!savedUser || !expiresAt) return null;

      // If already past the 2.5-hour timestamp on boot, purge
      if (Date.now() > Number(expiresAt)) {
        localStorage.removeItem('cyvora_user');
        localStorage.removeItem('cyvora_session_expiry');
        return null;
      }

      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem('cyvora_user');
    localStorage.removeItem('cyvora_session_expiry');
    setCurrentUser(null);
  }, []);

  const loginSession = useCallback((userData, sessionExpiresAt) => {
    localStorage.setItem('cyvora_user', JSON.stringify(userData));
    localStorage.setItem('cyvora_session_expiry', sessionExpiresAt.toString());
    setCurrentUser(userData);
  }, []);

  // Background ticker: checks expiration every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const expiresAt = localStorage.getItem('cyvora_session_expiry');
      if (expiresAt && Date.now() > Number(expiresAt)) {
        console.warn('[CYVORA SECURITY] 2.5-hour auth token window elapsed. Terminating session.');
        logout();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [logout]);

  return { currentUser, loginSession, logout };
};