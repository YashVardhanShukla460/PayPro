import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  employeeId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isHrAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await api.auth.me();
        setUser(userData);
        setToken(storedToken);
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        clearAuthToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: newToken, user: userData } = await api.auth.login({ email, password });
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role = 'EMPLOYEE') => {
    setIsLoading(true);
    try {
      const { token: newToken, user: userData } = await api.auth.register({
        name,
        email,
        password,
        role,
      });
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setToken(null);
  };

  const isHrAdmin = user?.role === 'HR_ADMIN';
  const isManager = user?.role === 'MANAGER' || isHrAdmin;
  const isEmployee = user?.role === 'EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isHrAdmin,
        isManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
