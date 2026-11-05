'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { DashboardStats, Group, Student } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  UserX,
  ArrowUpRight,
  Plus,
  RotateCw,
  BookOpen,
  User,
  Clock,
  Phone,
  Calendar,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Dashboard statistikasini olishda xatolik:', err);
      toast.error('Statistika ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Yuqori Xush kelibsiz banneri */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#003b95] via-[#002f78] to-[#001d4a] p-6 sm:p-8 text-white shadow-xl shadow-[#003b95]/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-xs">
            Admin Boshqaruv Markazi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            BigStep Academy CRM Boshqaruv Paneli
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed max-w-xl">
            Guruhlar, o&apos;quvchilar va 12 oylik davomat jurnalini markazlashgan holda real vaqt rejimida boshqaring.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/admin/groups">
              <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Guruhlar bo&apos;limi
              </Button>
            </Link>
            <Link href="/admin/students">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                leftIcon={<Users className="w-4 h-4" />}
              >
                O&apos;quvchilar
              </Button>
            </Link>
            <Link href="/admin/attendance">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                rightIcon={<ArrowUpRight className="w-4 h-4" />}
              >
                Davomat jurnali
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStats}
              disabled={isLoading}
              className="text-blue-100 hover:text-white hover:bg-white/10"
              leftIcon={<RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Yangilash
            </Button>
          </div>
        </div>

        {/* Bezakli yorug'lik doirasi */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Ko'rsatkichlar kartalari (Stats Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Faol O'quvchilar */}
        <Card hoverEffect className="flex items-center gap-4 border-slate-200/70">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003b95] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Faol O&apos;quvchilar
            </p>
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-200 rounded animate-pulse mt-1" />
            ) : (
              <h4 className="text-2xl font-extrabold text-slate-800 mt-0.5">
                {stats?.totalActiveStudents ?? 0}
                <span className="text-xs font-medium text-slate-400 ml-1">nafar</span>
              </h4>
            )}
          </div>
        </Card>

        {/* Mavjud Guruhlar */}
        <Card hoverEffect className="flex items-center gap-4 border-slate-200/70">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#f59e0b] flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Mavjud Guruhlar
            </p>
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-200 rounded animate-pulse mt-1" />
            ) : (
              <h4 className="text-2xl font-extrabold text-slate-800 mt-0.5">
                {stats?.totalGroups ?? 0}
                <span className="text-xs font-medium text-slate-400 ml-1">ta</span>
              </h4>
            )}
          </div>
        </Card>

        {/* Oylik Davomat */}
        <Card hoverEffect className="flex items-center gap-4 border-slate-200/70">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Davomat Jurnali
            </p>
            <h4 className="text-2xl font-extrabold text-slate-800 mt-0.5">
              12 Oy
              <span className="text-xs font-medium text-emerald-600 ml-1.5 font-semibold">Faol</span>
            </h4>
          </div>
        </Card>

        {/* Arxivdagi O'quvchilar */}
        <Card hoverEffect className="flex items-center gap-4 border-slate-200/70">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Arxivdagilar
            </p>
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-200 rounded animate-pulse mt-1" />
            ) : (
              <h4 className="text-2xl font-extrabold text-slate-800 mt-0.5">
                {stats?.totalArchivedStudents ?? 0}
                <span className="text-xs font-medium text-slate-400 ml-1">nafar</span>
              </h4>
            )}
          </div>
        </Card>
      </div>

      {/* 2 Ustunli so'nggi qo'shilganlar bo'limi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* So'nggi Guruhlar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">So&apos;nggi Guruhlar</h3>
                <p className="text-xs text-slate-400">Yangi ochilgan kurs va guruhlar</p>
              </div>
            </div>
            <Link
              href="/admin/groups"
              className="text-xs font-semibold text-[#003b95] hover:text-[#002b6e] flex items-center gap-1"
            >
              Barchasi <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !stats?.recentGroups || stats.recentGroups.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Hozircha hech qanday guruh mavjud emas.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentGroups.map((group: Group) => (
                <div
                  key={group._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 transition-colors border border-slate-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{group.name}</h4>
                      <Badge variant="brand" size="sm">
                        {group.room}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#003b95]" />
                        {group.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {group.teacherName}
                      </span>
                    </div>
                  </div>

                  <Link href={`/admin/attendance?groupId=${group._id}`}>
                    <Button variant="outline" size="sm" className="text-xs shrink-0 ml-3">
                      Davomat
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* So'nggi Qo'shilgan O'quvchilar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#003b95] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Yangi O&apos;quvchilar</h3>
                <p className="text-xs text-slate-400">Yaqinda ro&apos;yxatdan o&apos;tganlar</p>
              </div>
            </div>
            <Link
              href="/admin/students"
              className="text-xs font-semibold text-[#003b95] hover:text-[#002b6e] flex items-center gap-1"
            >
              Barchasi <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !stats?.recentStudents || stats.recentStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Hozircha o&apos;quvchilar ro&apos;yxatga olinmagan.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentStudents.map((student: Student) => {
                const groupObj = typeof student.groupId === 'object' ? student.groupId : null;
                return (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 transition-colors border border-slate-100"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm truncate">
                          {student.fullName}
                        </h4>
                        <Badge variant="success" size="sm">
                          Faol
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.phone}
                        </span>
                        {groupObj && (
                          <span className="flex items-center gap-1 text-[#003b95] font-medium truncate">
                            <Layers className="w-3 h-3" />
                            {groupObj.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href={`/admin/students?groupId=${groupObj ? groupObj._id : ''}`}>
                      <Button variant="ghost" size="sm" className="text-xs shrink-0 ml-3 text-slate-600">
                        Profil
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
