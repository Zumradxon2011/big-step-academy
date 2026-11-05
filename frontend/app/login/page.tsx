'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Agar allaqachon tizimga kirgan bo'lsa, dashboardga yo'naltirish
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await login(username.trim(), password);
    setIsSubmitting(false);

    if (success) {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Asosiy Login Kartasi */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 transition-all">
          {/* Logotip va Sarlavha */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative h-16 mb-4 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="BigStep Academy"
                width={664}
                height={298}
                priority
                className="h-14 w-auto object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-2">
              Admin Boshqaruv Markazi
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Tizimga kirish
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Markazni boshqarish uchun hisobingizga kiring
            </p>
          </div>

          {/* Login Formasi */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Foydalanuvchi nomi
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b95] focus:border-transparent focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Maxfiy parol
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b95] focus:border-transparent focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Kirish Tugmasi */}
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-medium text-sm bg-[#003b95] hover:bg-[#002b6e] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#003b95]/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Tizimga kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Qo'shimcha eslatma */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              © 2026 BigStep Academy CRM. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
