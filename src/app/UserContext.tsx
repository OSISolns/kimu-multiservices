'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import InactivityWarning from '@/components/InactivityWarning';

interface User {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  role: string;
  department: string | null;
  status: string;
  profilePicture: string | null;
  createdAt: Date;
  lastLogin: Date | null;
  totpSecret: string | null;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  loginUser: (userData: User) => void;
  logoutUser: () => void;
  resetInactivityTimer: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [warningTimeLeft, setWarningTimeLeft] = useState(60);
  const [isMounted, setIsMounted] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = useMemo(() => {
    if (user?.role === 'accountant') {
      return 10 * 60 * 1000; // 10 minutes for accountants
    }
    return 15 * 60 * 1000; // 15 minutes default
  }, [user?.role]);
  const WARNING_TIME = useMemo(() => 60 * 1000, []); // Show warning 60 seconds before logout

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loginUser = (userData: User) => {
    console.log('UserContext: Logging in user', userData);
    setUser(userData);
    if (isMounted) {
      try {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isStaff', 'true');
        console.log('UserContext: User data set and stored in localStorage');
      } catch (error) {
        console.error('Error storing user data in localStorage:', error);
      }
    }
  };

  const logoutUser = useCallback(() => {
    console.log('UserContext: Logging out user');
    setUser(null);
    setShowInactivityWarning(false);

    if (isMounted) {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('isStaff');
      } catch (error) {
        console.error('Error removing user data from localStorage:', error);
      }
    }

    // Clear all timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, [isMounted]);

  const resetInactivityTimer = useCallback(() => {
    // Only reset timer if user is logged in
    if (!user) return;

    // Hide warning if it's showing
    setShowInactivityWarning(false);

    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Set warning timer (shows warning 60 seconds before logout)
    warningTimerRef.current = setTimeout(() => {
      console.log('UserContext: Showing inactivity warning');
      setShowInactivityWarning(true);
      setWarningTimeLeft(60);
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timer
    inactivityTimerRef.current = setTimeout(() => {
      console.log('UserContext: Auto-logout due to inactivity');
      logoutUser();
      // Redirect to login page
      if (isMounted && typeof window !== 'undefined') {
        window.location.href = '/staff/login';
      }
    }, INACTIVITY_TIMEOUT);
  }, [user, logoutUser, INACTIVITY_TIMEOUT, WARNING_TIME, isMounted]);

  const startInactivityTimer = useCallback(() => {
    if (user) {
      resetInactivityTimer();
    }
  }, [user, resetInactivityTimer]);

  const handleStayLoggedIn = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleLogoutFromWarning = useCallback(() => {
    logoutUser();
    if (isMounted && typeof window !== 'undefined') {
      window.location.href = '/staff/login';
    }
  }, [logoutUser, isMounted]);

  // Start inactivity timer when user logs in
  useEffect(() => {
    if (user) {
      startInactivityTimer();
    }
  }, [user, startInactivityTimer]);

  // Add event listeners for user activity
  useEffect(() => {
    if (!user || !isMounted) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, resetInactivityTimer, isMounted]);

  // Load user from localStorage on mount
  useEffect(() => {
    // Only load user from localStorage after mounting to avoid hydration mismatch
    if (!isMounted) return;

    try {
      // Load user from localStorage (for now)
      const storedUser = localStorage.getItem('user');
      const isStaff = localStorage.getItem('isStaff');

      console.log('UserContext: Loading user data', { storedUser, isStaff });

      if (storedUser && isStaff) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('UserContext: Parsed user data', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('isStaff');
        }
      } else {
        console.log('UserContext: No user data found, clearing state');
        setUser(null);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted]);

  // Listen for storage changes (when user logs in/out from other tabs)
  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'isStaff') {
        console.log('UserContext: Storage changed, reloading user data');
        try {
          const storedUser = localStorage.getItem('user');
          const isStaff = localStorage.getItem('isStaff');

          if (storedUser && isStaff) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (error) {
              console.error('Error parsing stored user after storage change:', error);
              localStorage.removeItem('user');
              localStorage.removeItem('isStaff');
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error accessing localStorage in storage change handler:', error);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isMounted]);

  const value: UserContextType = {
    user,
    setUser,
    isLoading,
    loginUser,
    logoutUser,
    resetInactivityTimer,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
      <InactivityWarning
        isVisible={showInactivityWarning}
        timeLeft={warningTimeLeft}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogoutFromWarning}
      />
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 