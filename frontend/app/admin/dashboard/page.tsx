'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  UserX,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Xush kelibsiz banneri */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003b95] via-[#002f78] to-[#001d4a] p-6 sm:p-8 text-white shadow-xl shadow-[#003b95]/20">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-xs">
            Admin Boshqaruv Markazi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            BigStep Academy CRM Boshqaruv Paneli
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Guruhlar, o&apos;quvchilar va 12 oylik davomat jurnalini markazlashgan holda boshqaring.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/groups">
              <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Guruhlar bo&apos;limi
              </Button>
            </Link>
            <Link href="/admin/attendance">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Davomatni belgilash
              </Button>
            </Link>
          </div>
        </div>

        {/* Bezakli doira */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Ko'rsatkichlar kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hoverEffect className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003b95] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Faol O&apos;quvchilar
            </p>
            <h4 className="text-2xl font-bold text-slate-800 mt-0.5">--</h4>
          </div>
        </Card>

        <Card hoverEffect className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mavjud Guruhlar
            </p>
            <h4 className="text-2xl font-bold text-slate-800 mt-0.5">--</h4>
          </div>
        </Card>

        <Card hoverEffect className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Oylik Davomat
            </p>
            <h4 className="text-2xl font-bold text-slate-800 mt-0.5">12 Oy</h4>
          </div>
        </Card>

        <Card hoverEffect className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Arxivdagilar
            </p>
            <h4 className="text-2xl font-bold text-slate-800 mt-0.5">--</h4>
          </div>
        </Card>
      </div>
    </div>
  );
}
