'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Group, Student, AttendanceRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  CalendarCheck,
  RotateCw,
  Save,
  CheckCircle2,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  Info,
  Clock,
  MapPin,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = [
  { value: 1, label: 'Yanvar' },
  { value: 2, label: 'Fevral' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Aprel' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Iyun' },
  { value: 7, label: 'Iyul' },
  { value: 8, label: 'Avgust' },
  { value: 9, label: 'Sentabr' },
  { value: 10, label: 'Oktabr' },
  { value: 11, label: 'Noyabr' },
  { value: 12, label: 'Dekabr' },
];

const YEARS = [2024, 2025, 2026, 2027, 2028];

function AttendanceContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentDay = currentDate.getDate();

  // Guruh, yil va oy holatlari
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  // O'quvchilar va davomat ma'lumotlari
  const [students, setStudents] = useState<Student[]>([]);
  // { [studentId]: { [day]: 'present' | 'absent' | 'excused' } }
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, Record<number, 'present' | 'absent' | 'excused'>>
  >({});

  // Holatlar
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Tanlangan oydagi kunlar soni
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Guruhlarni yuklash
  const fetchGroups = useCallback(async () => {
    try {
      setIsLoadingGroups(true);
      const res = await api.get('/admin/groups');
      const groupList: Group[] = res.data || [];
      setGroups(groupList);

      // Agar initialGroupId yo'q bo'lsa va guruhlar bo'lsa, birinchisini tanlaymiz
      if (!selectedGroupId && groupList.length > 0) {
        setSelectedGroupId(groupList[0]._id);
      }
    } catch (err) {
      console.error('Guruhlarni olishda xatolik:', err);
      toast.error('Guruhlar ro\'yxatini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoadingGroups(false);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Tanlangan guruh ma'lumotlari
  const selectedGroup = useMemo(() => {
    return groups.find((g) => g._id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  // Tanlangan guruh va oy bo'yicha o'quvchilar va davomatni yuklash
  const fetchAttendanceData = useCallback(async () => {
    if (!selectedGroupId) return;

    try {
      setIsLoadingData(true);
      setHasChanges(false);

      // 1. Tanlangan guruh o'quvchilarini olish
      const studentsRes = await api.get(`/admin/students/active?groupId=${selectedGroupId}`);
      const fetchedStudents: Student[] = studentsRes.data || [];
      setStudents(fetchedStudents);

      // 2. Ushbu oy uchun davomat yozuvlarini olish
      const attendanceRes = await api.get('/admin/attendance', {
        params: {
          groupId: selectedGroupId,
          year: selectedYear,
          month: selectedMonth,
        },
      });

      const records: AttendanceRecord[] = attendanceRes.data || [];

      // Attendance map shakllantirish
      const newMap: Record<string, Record<number, 'present' | 'absent' | 'excused'>> = {};

      // Barcha o'quvchilar uchun bo'sh map yaratamiz
      fetchedStudents.forEach((student) => {
        newMap[student._id] = {};
      });

      // Kelgan davomatlarni joylaymiz
      records.forEach((record) => {
        const studentId =
          typeof record.student === 'object' && record.student !== null
            ? (record.student as Student)._id
            : (record.student as string);

        if (studentId && record.days && Array.isArray(record.days)) {
          if (!newMap[studentId]) newMap[studentId] = {};
          record.days.forEach((d) => {
            newMap[studentId][d.date] = d.status;
          });
        }
      });

      setAttendanceMap(newMap);
    } catch (err) {
      console.error('Davomat ma\'lumotlarini olishda xatolik:', err);
      toast.error('Davomat ma\'lumotlarini yuklashda xatolik');
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedGroupId, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Statusni almashtirish (cycle: undefined -> present -> absent -> excused -> undefined)
  const handleToggleStatus = (studentId: string, day: number) => {
    setAttendanceMap((prev) => {
      const studentDays = { ...(prev[studentId] || {}) };
      const current = studentDays[day];

      let next: 'present' | 'absent' | 'excused' | undefined;
      if (!current) {
        next = 'present';
      } else if (current === 'present') {
        next = 'absent';
      } else if (current === 'absent') {
        next = 'excused';
      } else {
        next = undefined;
      }

      if (next) {
        studentDays[day] = next;
      } else {
        delete studentDays[day];
      }

      setHasChanges(true);
      return {
        ...prev,
        [studentId]: studentDays,
      };
    });
  };

  // Muayan kun uchun barcha o'quvchilarni "Keldi" deb belgilash
  const handleMarkAllPresentForDay = (day: number) => {
    if (students.length === 0) return;

    setAttendanceMap((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s._id] = {
          ...(updated[s._id] || {}),
          [day]: 'present',
        };
      });
      setHasChanges(true);
      return updated;
    });

    toast.success(`${day}-sana uchun barcha o'quvchilarga "Keldi" belgilandi`);
  };

  // Davomatni saqlash
  const handleSaveAttendance = async () => {
    if (!selectedGroupId) {
      toast.error('Guruh tanlanmagan');
      return;
    }

    try {
      setIsSaving(true);

      const records = students.map((s) => {
        const studentDays = attendanceMap[s._id] || {};
        const daysList = Object.entries(studentDays).map(([dateStr, status]) => ({
          date: Number(dateStr),
          status,
        }));

        return {
          studentId: s._id,
          days: daysList,
        };
      });

      await api.post('/admin/attendance', {
        groupId: selectedGroupId,
        year: selectedYear,
        month: selectedMonth,
        records,
      });

      toast.success('Davomat muvaffaqiyatli saqlandi!');
      setHasChanges(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Davomatni saqlashda xatolik yuz berdi';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Hafta kunini hisoblash
  const getDayMeta = (day: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, day);
    const dayOfWeek = d.getDay(); // 0 = Yakshanba, 6 = Shanba
    const names = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
    const isToday =
      selectedYear === currentYear &&
      selectedMonth === currentMonth &&
      day === currentDay;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return {
      name: names[dayOfWeek],
      isToday,
      isWeekend,
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sarlavha va Asosiy Boshqaruv Tugmalari */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-[#003b95]" />
            <span>Davomat Jurnali</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Guruhlar va o&apos;quvchilarning darslardagi qatnashuvini belgilang va monitoring qiling
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={fetchAttendanceData}
            disabled={isLoadingData || !selectedGroupId}
            leftIcon={<RotateCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />}
          >
            Yangilash
          </Button>

          <Button
            variant={hasChanges ? 'accent' : 'primary'}
            size="md"
            onClick={handleSaveAttendance}
            disabled={!hasChanges || isSaving || students.length === 0}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {hasChanges ? 'O\'zgarishlarni Saqlash' : 'Saqlangan'}
          </Button>
        </div>
      </div>

      {/* Tanlovlar Paneli (Guruh, Yil, Oy) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
        {/* Guruh tanlash */}
        <div className="sm:col-span-1 lg:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Guruhni tanlang:
          </label>
          <Select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            disabled={isLoadingGroups}
          >
            {groups.length === 0 ? (
              <option value="">Guruhlar mavjud emas</option>
            ) : (
              groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} — {g.subject} ({g.teacherName})
                </option>
              ))
            )}
          </Select>
        </div>

        {/* Oy tanlash */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Oy:
          </label>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Yil tanlash */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Yil:
          </label>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}-yil
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Guruh haqida qisqacha ma'lumot va Belgilar tushuntirishi (Legend) */}
      {selectedGroup && (
        <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/40 p-4 rounded-2xl border border-blue-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <GraduationCap className="w-4 h-4 text-[#003b95]" />
              {selectedGroup.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {selectedGroup.time} ({selectedGroup.days})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Xona: {selectedGroup.room}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {students.length} ta faol o&apos;quvchi
            </span>
          </div>

          {/* Belgilar tushuntirishi */}
          <div className="flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-slate-400 font-medium">Belgilar:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span className="text-slate-700">Keldi</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">
                ✕
              </span>
              <span className="text-slate-700">Kelmadi</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-amber-400 text-white font-bold flex items-center justify-center text-[10px]">
                S
              </span>
              <span className="text-slate-700">Sababli</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-slate-100 text-slate-400 border border-slate-200 font-bold flex items-center justify-center text-[10px]">
                -
              </span>
              <span className="text-slate-500">Bo&apos;sh</span>
            </div>
          </div>
        </div>
      )}

      {/* Asosiy Davomat Jadvali */}
      {isLoadingData ? (
        <Card className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4" />
          {[1, 2, 3, 4, 6].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl w-full" />
          ))}
        </Card>
      ) : !selectedGroupId ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Guruh tanlanmagan</h3>
          <p className="text-xs text-slate-500 mt-1">
            Davomat jurnalini ko&apos;rish va belgilash uchun yuqoridagi ro&apos;yxatdan guruhni tanlang.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-md mx-auto my-6">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Bu guruhda faol o&apos;quvchi yo&apos;q</h3>
          <p className="text-xs text-slate-500 mt-1">
            Davomatni belgilashdan oldin O&apos;quvchilar bo&apos;limidan ushbu guruhga o&apos;quvchi qo&apos;shing.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-xs">
                  {/* Tartib raqam & O'quvchi ismi (Fixed chap ustun) */}
                  <th className="py-3.5 px-4 font-bold text-slate-700 sticky left-0 bg-slate-50 z-20 min-w-[220px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-200">
                    O&apos;quvchi F.I.Sh ({students.length})
                  </th>

                  {/* Oy kunlari (1..31) */}
                  {daysArray.map((day) => {
                    const { name, isToday, isWeekend } = getDayMeta(day);

                    return (
                      <th
                        key={day}
                        className={`py-2 px-1 text-center font-semibold min-w-[36px] max-w-[40px] border-r border-slate-100 last:border-r-0 ${
                          isToday
                            ? 'bg-blue-100/70 text-[#003b95]'
                            : isWeekend
                            ? 'bg-slate-100/60 text-slate-400'
                            : 'text-slate-600'
                        }`}
                        title={`${selectedYear}-${selectedMonth}-${day} (${name})`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] font-normal leading-tight opacity-75">
                            {name}
                          </span>
                          <span
                            className={`text-xs font-bold leading-tight ${
                              isToday
                                ? 'w-5 h-5 rounded-full bg-[#003b95] text-white flex items-center justify-center mt-0.5'
                                : ''
                            }`}
                          >
                            {day}
                          </span>
                          {/* Tezkor belgilash tugmasi (ustun tepasida) */}
                          <button
                            type="button"
                            onClick={() => handleMarkAllPresentForDay(day)}
                            title={`${day}-sana uchun barchaga "Keldi" qo'yish`}
                            className="mt-1 text-[9px] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded px-1 transition cursor-pointer"
                          >
                            ✓
                          </button>
                        </div>
                      </th>
                    );
                  })}

                  {/* Xulosa ustunlari */}
                  <th className="py-3 px-3 text-center text-[11px] font-bold text-emerald-700 bg-emerald-50/50 min-w-[50px] border-l border-slate-200">
                    Keldi
                  </th>
                  <th className="py-3 px-3 text-center text-[11px] font-bold text-rose-700 bg-rose-50/50 min-w-[50px]">
                    Kelmadi
                  </th>
                  <th className="py-3 px-3 text-center text-[11px] font-bold text-amber-700 bg-amber-50/50 min-w-[50px]">
                    Sababli
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {students.map((student, idx) => {
                  const studentDays = attendanceMap[student._id] || {};

                  // Oylik xulosa hisoblash
                  let presentCount = 0;
                  let absentCount = 0;
                  let excusedCount = 0;

                  Object.values(studentDays).forEach((st) => {
                    if (st === 'present') presentCount++;
                    if (st === 'absent') absentCount++;
                    if (st === 'excused') excusedCount++;
                  });

                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      {/* O'quvchi ismi (Sticky chap ustun) */}
                      <td className="py-3 px-4 font-semibold text-slate-800 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-slate-400 font-mono w-4">
                            {idx + 1}.
                          </span>
                          <span className="truncate" title={student.fullName}>
                            {student.fullName}
                          </span>
                        </div>
                      </td>

                      {/* Kunlar katakchalari */}
                      {daysArray.map((day) => {
                        const status = studentDays[day];
                        const { isToday, isWeekend } = getDayMeta(day);

                        return (
                          <td
                            key={day}
                            onClick={() => handleToggleStatus(student._id, day)}
                            className={`py-2 px-1 text-center border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors ${
                              isToday
                                ? 'bg-blue-50/40 hover:bg-blue-100/50'
                                : isWeekend
                                ? 'bg-slate-50/40 hover:bg-slate-100/50'
                                : 'hover:bg-slate-100/60'
                            }`}
                            title={`${student.fullName} - ${day}-${MONTHS[selectedMonth - 1]?.label}: ${
                              status ? status : 'Belgilanmagan (bosib o\'zgartiring)'
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              {status === 'present' ? (
                                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              ) : status === 'absent' ? (
                                <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                  <X className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              ) : status === 'excused' ? (
                                <span className="w-6 h-6 rounded-lg bg-amber-400 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                  S
                                </span>
                              ) : (
                                <span className="w-6 h-6 rounded-lg text-slate-300 flex items-center justify-center text-xs hover:text-slate-500">
                                  -
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Xulosa ustunlari */}
                      <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-emerald-50/30 border-l border-slate-200">
                        {presentCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-700 bg-rose-50/30">
                        {absentCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700 bg-amber-50/30">
                        {excusedCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pastki Xabarnoma / Status Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-[#003b95] shrink-0" />
              <span>
                Katakchani bosganingizda holat aylanadi: <strong>Keldi (✓)</strong> → <strong>Kelmadi (✕)</strong> → <strong>Sababli (S)</strong> → <strong>Bo&apos;sh (-)</strong>
              </span>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-amber-600 animate-pulse">
                  Saqlanmagan o&apos;zgarishlar bor!
                </span>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleSaveAttendance}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  O&apos;zgarishlarni Saqlash
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 animate-pulse text-sm">
          Davomat jurnali yuklanmoqda...
        </div>
      }
    >
      <AttendanceContent />
    </Suspense>
  );
}
