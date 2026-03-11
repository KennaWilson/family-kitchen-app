import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState(null);
  const [showGreeting, setShowGreeting] = useState(false);

  const login = useCallback((profile) => {
    setActiveProfile(profile);
    setShowGreeting(true);
  }, []);

  const logout = useCallback(() => {
    setActiveProfile(null);
    setShowGreeting(false);
  }, []);

  const updateStars = useCallback((newStars) => {
    setActiveProfile((prev) => prev ? { ...prev, stars: newStars } : prev);
  }, []);

  const updateProfile = useCallback((updated) => {
    setActiveProfile(updated);
  }, []);

  return (
    <AppContext.Provider value={{ activeProfile, showGreeting, setShowGreeting, login, logout, updateStars, updateProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
