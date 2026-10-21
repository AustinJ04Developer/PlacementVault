import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.js';
import { authService } from '../services/authService.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    collegeName?: string;
    rollNumber?: string;
    department?: string;
    graduationYear?: number;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error: toastError } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('pv_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await authService.getMe();
      setUser(userData);
    } catch {
      setUser(null);
      localStorage.removeItem('pv_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string): Promise<User> => {
    try {
      const res = await authService.login({ email, password: pass });
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`);
      return res.user;
    } catch (err: any) {
      toastError(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    collegeName?: string;
    rollNumber?: string;
    department?: string;
    graduationYear?: number;
  }): Promise<User> => {
    try {
      const res = await authService.register(data);
      setUser(res.user);
      success('Account created successfully! Welcome to PlacementVault.');
      return res.user;
    } catch (err: any) {
      toastError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Ignored
    } finally {
      setUser(null);
      success('Logged out successfully.');
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const res = await authService.updateProfile(data as any);
      setUser(prev => (prev ? { ...prev, ...res.user } : null));
      success('Profile updated successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
