'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarCheck,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Guruhlar',
    href: '/admin/groups',
    icon: GraduationCap,
  },
  {
    name: 'O\'quvchilar',
    href: '/admin/students',
    icon: Users,
  },
  {
    name: 'Davomat jurnali',
    href: '/admin/attendance',
    icon: CalendarCheck,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  return (
    <>
      {/* Mobil ekranlar uchun qorong'u orqa fon (Backdrop) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Asosiy Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-white border-r border-slate-100 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Yuqori Logotip qismi */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="relative h-12 flex items-center">
              <Image
                src="/logo.png"
                alt="BigStep Academy"
                width={664}
                height={298}
                priority
                className="h-10 w-auto object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigatsiya Menyusi */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Asosiy Boshqaruv
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-[#003b95] text-white shadow-md shadow-[#003b95]/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-150',
                    isActive ? 'text-[#f59e0b]' : 'text-slate-400'
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-4 bg-[#f59e0b] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Pastki Admin Profil va Logout Bloki */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-xs mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#003b95]/10 text-[#003b95] flex items-center justify-center font-bold text-base shrink-0">
              {admin?.username ? admin.username[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {admin?.username || 'Administrator'}
                </p>
                <ShieldCheck className="w-3.5 h-3.5 text-[#003b95] shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Bosh Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition border border-rose-200/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </aside>
    </>
  );
}
