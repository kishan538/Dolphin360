import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../storage/authStorage';
import {getCurrentUser, logout as apiLogout} from '../api/auth';
import type {User} from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await getAuthSession();
        if (!session?.accessToken) {
          setIsLoading(false);
          return;
        }

        try {
          const response = await getCurrentUser(session.accessToken);
          if (response.success && response.data?.user) {
            const currentSession = await getAuthSession();
            if (currentSession) {
              await saveAuthSession({
                user: response.data.user,
                accessToken: currentSession.accessToken,
                refreshToken: currentSession.refreshToken,
              });
            }
            setUser(response.data.user);
          } else {
            await clearAuthSession();
            setUser(null);
          }
        } catch (apiErr: unknown) {
          const axiosError = apiErr as {response?: {status?: number}};
          if (
            axiosError?.response?.status === 401 ||
            axiosError?.response?.status === 403
          ) {
            await clearAuthSession();
            setUser(null);
          } else {
            if (session.user) {
              setUser(session.user);
            }
          }
        }
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(
    async (loggedInUser: User, accessToken: string, refreshToken?: string) => {
      await saveAuthSession({
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
      setUser(loggedInUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const session = await getAuthSession();
      if (session?.accessToken) {
        try {
          await apiLogout(session.accessToken);
        } catch {
          // Ignore API error on logout
        }
      }
    } catch {
      // Ignored
    } finally {
      await clearAuthSession();
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const session = await getAuthSession();
      if (!session?.accessToken) {
        return;
      }
      const response = await getCurrentUser(session.accessToken);
      if (response.success && response.data?.user) {
        const currentSession = await getAuthSession();
        if (currentSession) {
          await saveAuthSession({
            user: response.data.user,
            accessToken: currentSession.accessToken,
            refreshToken: currentSession.refreshToken,
          });
        }
        setUser(response.data.user);
      }
    } catch {
      // Ignored
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
