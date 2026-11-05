'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAccessToken, getAccessToken } from '@/services/api';
import { AdminUser } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedToken = getAccessToken();
      const savedAdminStr = typeof window !== 'undefined' ? localStorage.getItem('adminUser') : null;

      if (savedToken && savedAdminStr) {
        try {
          const parsedAdmin = JSON.parse(savedAdminStr);
          setAdmin(parsedAdmin);
        } catch {
          localStorage.removeItem('adminUser');
        }
      } else {
        // Refresh token orqali sessiyani tiklashga urinish
        try {
          const { data } = await api.post('/auth/refresh');
          if (data?.accessToken) {
            setAccessToken(data.accessToken);
            if (savedAdminStr) {
              setAdmin(JSON.parse(savedAdminStr));
            }
          }
        } catch {
          setAccessToken(null);
          setAdmin(null);
        }
      }
    } catch (error) {
      console.error('Auth tekshirishda xatolik:', error);
      setAccessToken(null);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, admin: adminData } = response.data;

      setAccessToken(accessToken);
      setAdmin(adminData);

      if (typeof window !== 'undefined') {
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      }

      toast.success(`Xush kelibsiz, ${adminData.username}!`);
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login yoki parol xato! Qaytadan tekshirib ko\'ring.';
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setAdmin(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminUser');
      }
      toast.success('Tizimdan muvaffaqiyatli chiqildi');
      router.push('/login');
    }
  };

  const isAuthenticated = !!admin;

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
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
