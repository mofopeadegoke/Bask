'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { User } from '@/lib/types';
import { getUserProfile, mapBackendUserToFrontendUser } from '@/api/auth';
import Loader from '@/components/ui/loader';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
  currentUser: User | null;
  logout: () => void;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasAttemptedFetch = useRef(false); // Track if we've already attempted to fetch

  useEffect(() => {
  const fetchUserProfile = async () => {
    if (hasAttemptedFetch.current) return;
    hasAttemptedFetch.current = true;

    // Check if we have an auth token before attempting to fetch
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      setCurrentUser(null);
      return;
    }

    try {
      const profile = await getUserProfile();
      const frontendUser = mapBackendUserToFrontendUser(profile);
      connectSocket();
      setCurrentUser(frontendUser);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Clear invalid token on error
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      disconnectSocket();
    } finally {
      setLoading(false);
    }
  };

  fetchUserProfile();
}, []);
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUserId');
      disconnectSocket();
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, logout, loading, setCurrentUser }}>
      {!loading && children}
      {loading && <Loader />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}