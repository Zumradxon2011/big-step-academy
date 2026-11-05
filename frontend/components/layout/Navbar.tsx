'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Calendar, Bell } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': {
    title: 'Dashboard',
    subtitle: "Umumiy ko'rsatkichlar va markaz statistikasi",
  },
  '/admin/groups': {
    title: 'Guruhlar boshqaruvi',
    subtitle: "Mavjud guruhlar, fanlar va biriktirilgan o'qituvchilar",
  },
  '/admin/students': {
    title: "O'quvchilar ro'yxati",
    subtitle: "Faol va arxivlangan o'quvchilar bazasi",
  },
  '/admin/attendance': {
    title: 'Davomat jurnali',
    subtitle: "12 oylik o'quvchilar davomati va qoldirilgan darslar nazorati",
  },
};

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const pathname = usePathname();

  // Aniqlangan sahifa sarlavhasi
  const currentRoute = Object.keys(pageTitles).find(
    (route) => pathname === route || (route !== '/admin/dashboard' && pathname.startsWith(route))
  );
  const pageInfo = currentRoute
    ? pageTitles[currentRoute]
    : { title: 'Boshqaruv Paneli', subtitle: 'BigStep Academy CRM' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
      {/* Chap qism: Mobil menyu tugmasi va Sahifa sarlavhasi */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* O'ng qism: Sana va holat */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Sana ko'rsatgichi */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600">
          <Calendar className="w-4 h-4 text-[#003b95]" />
          <span>BigStep Boshqaruv Markazi</span>
        </div>

        {/* Bildirishnoma / Status belgisi */}
        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:text-[#003b95] transition cursor-pointer">
          <Bell className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
