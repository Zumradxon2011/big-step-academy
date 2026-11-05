'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <div className="relative h-16 mb-4 flex items-center justify-center animate-pulse">
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
      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-[#003b95]" />
        <span>Yuklanmoqda...</span>
      </div>
    </div>
  );
}
