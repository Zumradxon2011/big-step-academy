'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Group, Student, AttendanceRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import {
  CalendarCheck,
  RotateCw,
  Save,
  CheckCircle2,
  Calendar,
  Users,
  GraduationCap,
  Info,
  Clock,
  MapPin,
  Check,
  X,
  Lock,
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

// Guruh dars kunlarini aniqlash (Dushanba=1, Seshanba=2, ... Yakshanba=0)
function getLessonDaysOfWeek(daysStr: string): number[] {
  if (!daysStr) return [1, 3, 5];
  const str = daysStr.toLowerCase();

  if (str.includes('toq')) return [1, 3, 5]; // Dushanba, Chorshanba, Juma
  if (str.includes('juft')) return [2, 4, 6]; // Seshanba, Payshanba, Shanba
  if (str.includes('har kun') || str.includes('daily') || str.includes('barcha')) {
    return [1, 2, 3, 4, 5, 6];
  }
  if (str.includes('dam olish') || (str.includes('shanba') && str.includes('yakshanba'))) {
    return [6, 0];
  }

  const days: Set<number> = new Set();
  if (str.includes('du') || str.includes('mon')) days.add(1);
  if (str.includes('se') || str.includes('tue')) days.add(2);
  if (str.includes('cho') || str.includes('wed')) days.add(3);
  if (str.includes('pa') || str.includes('thu')) days.add(4);
  if (str.includes('ju') || str.includes('fri')) days.add(5);
  if (str.includes('sha') || str.includes('sat')) days.add(6);
  if (str.includes('yak') || str.includes('sun')) days.add(0);

  if (days.size > 0) {
    return Array.from(days).sort();
  }

  return [1, 3, 5]; // Sukut bo'yicha toq kunlar
}

interface PopoverState {
  studentId: string;
  studentName: string;
  day: number;
  currentStatus?: 'present' | 'absent';
  x: number;
  y: number;
}

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

  // Faqat dars kunlarini ko'rsatish filtri (sukut bo'yicha yoqilgan)
  const [filterOnlyLessonDays, setFilterOnlyLessonDays] = useState<boolean>(true);

  // O'quvchilar va davomat ma'lumotlari
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, Record<number, 'present' | 'absent'>>
  >({});

  // Interaktiv Popover holati
  const [popoverState, setPopoverState] = useState<PopoverState | null>(null);

  // Yuklanish holatlari
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Tanlangan oydagi barcha kunlar
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const allDaysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Guruhlarni yuklash
  const fetchGroups = useCallback(async () => {
    try {
      setIsLoadingGroups(true);
      const res = await api.get('/admin/groups');
      const groupList: Group[] = res.data || [];
      setGroups(groupList);

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

  // Guruhning hafta kunlari raqamlari
  const groupLessonWeekdays = useMemo(() => {
    if (!selectedGroup) return [1, 3, 5];
    return getLessonDaysOfWeek(selectedGroup.days);
  }, [selectedGroup]);

  // Guruhning ushbu oydagi barcha haqiqiy dars kunlari tartiblangan ro'yxati
  const groupLessonDaysInMonth = useMemo(() => {
    return allDaysArray.filter((day) => {
      const d = new Date(selectedYear, selectedMonth - 1, day);
      return groupLessonWeekdays.includes(d.getDay());
    });
  }, [allDaysArray, selectedYear, selectedMonth, groupLessonWeekdays]);

  // Ketma-ketlik qoidasi: Agar biror dars kuni davomat qilinmasa, keyingi barcha darslar yopiq (Y) bo'ladi
  const lockedDaysSet = useMemo(() => {
    const locked = new Set<number>();
    if (students.length === 0 || groupLessonDaysInMonth.length === 0) {
      return locked;
    }

    let previousDayCompleted = true;
    for (let i = 0; i < groupLessonDaysInMonth.length; i++) {
      const day = groupLessonDaysInMonth[i];
      if (!previousDayCompleted) {
        // Oldingi dars yakunlanmagan bo'lsa, ushbu va keyingi barcha darslar qulflanadi
        locked.add(day);
      } else {
        // Dars yakunlangan deb hisoblanishi uchun guruhdagi har bir faol o'quvchiga davomat (Bor yoki Yo'q) qo'yilgan bo'lishi kerak
        const isCompleted = students.every((s) => {
          const st = attendanceMap[s._id]?.[day];
          return st === 'present' || st === 'absent';
        });

        if (!isCompleted) {
          previousDayCompleted = false;
        }
      }
    }

    return locked;
  }, [students, groupLessonDaysInMonth, attendanceMap]);

  // Jadvalda ko'rsatiladigan kunlar ro'yxati (filtrlangan yoki barchasi)
  const displayedDaysArray = useMemo(() => {
    if (!filterOnlyLessonDays) {
      return allDaysArray;
    }
    return groupLessonDaysInMonth;
  }, [filterOnlyLessonDays, allDaysArray, groupLessonDaysInMonth]);

  // Tanlangan guruh va oy bo'yicha o'quvchilar va davomatni yuklash
  const fetchAttendanceData = useCallback(async () => {
    if (!selectedGroupId) return;

    try {
      setIsLoadingData(true);
      setHasChanges(false);

      // 1. Tanlangan guruhning faol o'quvchilarini olish
      const studentsRes = await api.get(`/admin/students/active?groupId=${selectedGroupId}`);
      const fetchedStudents: Student[] = studentsRes.data || [];
      setStudents(fetchedStudents);

      // 2. Ushbu oy va guruh uchun davomat yozuvlarini olish
      const attendanceRes = await api.get('/admin/attendance', {
        params: {
          groupId: selectedGroupId,
          year: selectedYear,
          month: selectedMonth,
        },
      });

      const records: AttendanceRecord[] = attendanceRes.data || [];

      // Attendance map shakllantirish (faqat 'present' va 'absent')
      const newMap: Record<string, Record<number, 'present' | 'absent'>> = {};

      fetchedStudents.forEach((student) => {
        newMap[student._id] = {};
      });

      records.forEach((record) => {
        const studentId =
          typeof record.student === 'object' && record.student !== null
            ? (record.student as Student)._id
            : (record.student as string);

        if (studentId && record.days && Array.isArray(record.days)) {
          if (!newMap[studentId]) newMap[studentId] = {};
          record.days.forEach((d) => {
            if (d.status === 'present' || d.status === 'absent') {
              newMap[studentId][d.date] = d.status;
            }
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

  // Davomatni saqlash (foydalanuvchi yoki avtomatik)
  const handleSaveAttendance = useCallback(
    async (isAuto = false) => {
      if (!selectedGroupId || students.length === 0) return;

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

        setHasChanges(false);
        if (!isAuto) {
          toast.success('Davomat muvaffaqiyatli saqlandi!');
        }
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Davomatni saqlashda xatolik yuz berdi';
        toast.error(errorMsg);
      } finally {
        setIsSaving(false);
      }
    },
    [selectedGroupId, students, attendanceMap, selectedYear, selectedMonth]
  );

  // Avtomatik saqlash (debounce 1.5 soniya)
  useEffect(() => {
    if (!hasChanges || isSaving || !selectedGroupId || students.length === 0) return;

    const timer = setTimeout(() => {
      handleSaveAttendance(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [attendanceMap, hasChanges, isSaving, selectedGroupId, students, handleSaveAttendance]);

  // O'quvchiga 'present' (Bor) yoki 'absent' (Yo'q) qo'yish
  const handleSetStatus = (studentId: string, day: number, status: 'present' | 'absent') => {
    setAttendanceMap((prev) => {
      const studentDays = { ...(prev[studentId] || {}) };
      studentDays[day] = status;
      return {
        ...prev,
        [studentId]: studentDays,
      };
    });
    setHasChanges(true);
  };

  // Belgini tozalash
  const handleClearStatus = (studentId: string, day: number) => {
    setAttendanceMap((prev) => {
      const studentDays = { ...(prev[studentId] || {}) };
      delete studentDays[day];
      return {
        ...prev,
        [studentId]: studentDays,
      };
    });
    setHasChanges(true);
  };

  // Muayan ochiq kun uchun barcha o'quvchilarga "Bor" belgilash
  const handleMarkAllPresentForDay = (day: number) => {
    if (students.length === 0) return;

    if (lockedDaysSet.has(day)) {
      toast.error('Ushbu dars yopiq! Avval oldingi dars davomatini to\'liq to\'ldiring.', {
        icon: '🔒',
      });
      return;
    }

    setAttendanceMap((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s._id] = {
          ...(updated[s._id] || {}),
          [day]: 'present',
        };
      });
      return updated;
    });

    setHasChanges(true);
    toast.success(`${day}-sana uchun barchaga "Bor" belgilandi`);
  };

  // Katakcha bosilganda
  const handleCellClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    student: Student,
    day: number,
    isLocked: boolean
  ) => {
    e.stopPropagation();

    if (isLocked) {
      toast.error('Ushbu dars yopiq (Y)! Avval oldingi dars davomatini to\'liq to\'ldiring.', {
        icon: '🔒',
      });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverState({
      studentId: student._id,
      studentName: student.fullName,
      day,
      currentStatus: attendanceMap[student._id]?.[day],
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  // Hafta kunini hisoblash
  const getDayMeta = (day: number) => {
    const d = new Date(selectedYear, selectedMonth - 1, day);
    const dayOfWeek = d.getDay();
    const shortNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const isToday =
      selectedYear === currentYear &&
      selectedMonth === currentMonth &&
      day === currentDay;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isLessonDay = groupLessonWeekdays.includes(dayOfWeek);

    return {
      name: shortNames[dayOfWeek],
      isToday,
      isWeekend,
      isLessonDay,
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
            Guruh darslaridagi qatnashuvni belgilang. Ketma-ketlik va avtomatik saqlash faol.
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
            onClick={() => handleSaveAttendance(false)}
            disabled={!hasChanges || isSaving || students.length === 0}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saqlanmoqda...' : hasChanges ? 'O\'zgarishlarni Saqlash' : 'Saqlangan'}
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

      {/* Guruh Ma'lumotlari, Dars Kunlari Filtri va Belgilar Tushuntirishi */}
      {selectedGroup && (
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-amber-50/40 p-5 rounded-3xl border border-blue-100/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
          {/* Guruh ma'lumotlari */}
          <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-600">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <GraduationCap className="w-4 h-4 text-[#003b95]" />
              {selectedGroup.name}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 font-semibold text-[#003b95]">
              <Clock className="w-3.5 h-3.5" />
              {selectedGroup.days} ({selectedGroup.time})
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Xona: {selectedGroup.room}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {students.length} ta faol o&apos;quvchi
            </span>
          </div>

          {/* Dars kunlari filtri va Yangi Legend */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Faqat dars kunlari Toggle tugmasi */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setFilterOnlyLessonDays(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterOnlyLessonDays
                    ? 'bg-[#003b95] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faqat dars kunlari ({displayedDaysArray.length} ta dars)
              </button>
              <button
                type="button"
                onClick={() => setFilterOnlyLessonDays(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !filterOnlyLessonDays
                    ? 'bg-[#003b95] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Barcha kunlar ({allDaysArray.length})
              </button>
            </div>

            {/* Belgilar tushuntirishi (Yashil, Qizil, Siyohrang Yopiq) */}
            <div className="flex items-center gap-3 text-xs bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shadow-emerald-500/30">
                  ✓
                </span>
                <span className="text-slate-700 font-semibold">Bor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shadow-rose-500/30">
                  ✕
                </span>
                <span className="text-slate-700 font-semibold">Yo&apos;q</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs shadow-purple-600/30">
                  Y
                </span>
                <span className="text-slate-700 font-semibold">Yopiq</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 font-black flex items-center justify-center text-xs">
                  +
                </span>
                <span className="text-slate-500 font-medium">Ochiq</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asosiy Davomat Jadvali */}
      {isLoadingData ? (
        <Card className="animate-pulse space-y-4 p-8">
          <div className="h-8 bg-slate-200 rounded-xl w-1/3 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full" />
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
            Davomatni belgilashdan oldin O&apos;quvchilar bo&apos;limidan ushbu guruhga o&apos;quvchi biriktiring.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200">
                  {/* Tartib raqam & O'quvchi ismi (Fixed chap ustun) */}
                  <th className="py-4 px-5 font-bold text-slate-700 sticky left-0 bg-slate-50 z-20 min-w-[260px] shadow-[3px_0_6px_-2px_rgba(0,0,0,0.06)] border-r border-slate-200 text-sm">
                    <div className="flex items-center justify-between">
                      <span>O&apos;quvchi F.I.Sh</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#003b95]">
                        {students.length} nafar
                      </span>
                    </div>
                  </th>

                  {/* Ko'rsatiladigan Kunlar */}
                  {displayedDaysArray.map((day) => {
                    const { name, isToday, isWeekend, isLessonDay } = getDayMeta(day);
                    const isLocked = isLessonDay && lockedDaysSet.has(day);

                    return (
                      <th
                        key={day}
                        className={`py-3 px-1.5 text-center font-semibold min-w-[70px] border-r border-slate-100 last:border-r-0 transition-colors ${
                          isLocked
                            ? 'bg-purple-50/50 text-purple-900'
                            : isToday
                            ? 'bg-blue-100/80 text-[#003b95]'
                            : isLessonDay
                            ? 'bg-amber-50/20 text-slate-700'
                            : isWeekend
                            ? 'bg-slate-100/60 text-slate-400'
                            : 'text-slate-600'
                        }`}
                        title={`${selectedYear}-${selectedMonth}-${day} (${name})${
                          isLocked ? ' - Ushbu dars yopiq' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          {/* Hafta kuni */}
                          <span
                            className={`text-[11px] font-bold tracking-wider uppercase ${
                              isLocked
                                ? 'text-purple-600 font-extrabold'
                                : isToday
                                ? 'text-[#003b95]'
                                : isLessonDay
                                ? 'text-amber-700 font-extrabold'
                                : 'text-slate-400'
                            }`}
                          >
                            {name}
                          </span>

                          {/* Sana raqami */}
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                              isLocked
                                ? 'bg-purple-100 text-purple-800'
                                : isToday
                                ? 'bg-[#003b95] text-white shadow-sm shadow-[#003b95]/30'
                                : isLessonDay
                                ? 'bg-amber-100 text-amber-950 font-bold'
                                : 'bg-slate-100/80 text-slate-600'
                            }`}
                          >
                            {day < 10 ? `0${day}` : day}
                          </div>

                          {/* Ustun boshqaruv tugmasi / Yopiq belgisi */}
                          {isLessonDay && (
                            <>
                              {isLocked ? (
                                <span
                                  title="Oldingi dars to'ldirilmagani uchun yopiq"
                                  className="text-[10px] text-purple-700 bg-purple-100/80 font-extrabold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 select-none"
                                >
                                  <Lock className="w-2.5 h-2.5" /> Yopiq
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAllPresentForDay(day)}
                                  title={`${day}-sana uchun barchaga "Bor" qo'yish`}
                                  className="text-[10px] text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg px-1.5 py-0.5 transition cursor-pointer font-bold border border-slate-200/80 hover:border-emerald-300"
                                >
                                  ✓ Barchasi
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </th>
                    );
                  })}

                  {/* Oylik Xulosa ustunlari (Faqat Bor, Yo'q va Qatnashuv) */}
                  <th className="py-4 px-3 text-center text-xs font-extrabold text-emerald-800 bg-emerald-50/70 min-w-[70px] border-l border-slate-200">
                    Bor
                  </th>
                  <th className="py-4 px-3 text-center text-xs font-extrabold text-rose-800 bg-rose-50/70 min-w-[70px]">
                    Yo&apos;q
                  </th>
                  <th className="py-4 px-3 text-center text-xs font-extrabold text-blue-900 bg-blue-50/70 min-w-[80px]">
                    Qatnashuv
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((student, idx) => {
                  const studentDays = attendanceMap[student._id] || {};

                  // Oylik xulosa hisoblash (Faqat Bor va Yo'q)
                  let presentCount = 0;
                  let absentCount = 0;

                  displayedDaysArray.forEach((d) => {
                    const st = studentDays[d];
                    if (st === 'present') presentCount++;
                    if (st === 'absent') absentCount++;
                  });

                  const totalMarked = presentCount + absentCount;
                  const attendancePercent =
                    totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* O'quvchi ismi (Fixed chap ustun) */}
                      <td className="py-3.5 px-5 font-semibold text-slate-800 sticky left-0 bg-white z-10 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.06)] border-r border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate text-sm font-bold text-slate-800" title={student.fullName}>
                            {student.fullName}
                          </span>
                        </div>
                      </td>

                      {/* Kunlar katakchalari */}
                      {displayedDaysArray.map((day) => {
                        const status = studentDays[day];
                        const { isToday, isWeekend, isLessonDay } = getDayMeta(day);
                        const isLocked = isLessonDay && lockedDaysSet.has(day);

                        return (
                          <td
                            key={day}
                            className={`py-2 px-1 text-center border-r border-slate-100 last:border-r-0 transition-all ${
                              isLocked
                                ? 'bg-purple-50/40'
                                : isToday
                                ? 'bg-blue-50/40 hover:bg-blue-100/60'
                                : isLessonDay
                                ? 'bg-amber-50/10 hover:bg-amber-100/40'
                                : isWeekend
                                ? 'bg-slate-50/40 hover:bg-slate-100/60'
                                : 'hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              {!isLessonDay ? (
                                <span
                                  title="Dars kuni emas"
                                  className="w-10 h-10 rounded-2xl border border-slate-100 text-slate-300 font-bold flex items-center justify-center text-sm cursor-not-allowed select-none"
                                >
                                  -
                                </span>
                              ) : isLocked ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleCellClick(e, student, day, true)}
                                  title="Dars yopiq (Y). Oldingi dars davomati to'liq olinmagan."
                                  className="w-10 h-10 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black flex items-center justify-center text-sm shadow-sm shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer select-none"
                                >
                                  Y
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleCellClick(e, student, day, false)}
                                  title={
                                    status === 'present'
                                      ? `${student.fullName}: Bor (Keldi) - o'zgartirish uchun bosing`
                                      : status === 'absent'
                                      ? `${student.fullName}: Yo'q (Kelmadi) - o'zgartirish uchun bosing`
                                      : `${student.fullName}: Belgilash uchun bosing (Bor / Yo'q)`
                                  }
                                  className="group relative cursor-pointer"
                                >
                                  {status === 'present' ? (
                                    <span className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-emerald-500/25 transition-transform active:scale-95">
                                      <Check className="w-5 h-5 stroke-[3]" />
                                    </span>
                                  ) : status === 'absent' ? (
                                    <span className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-rose-500/25 transition-transform active:scale-95">
                                      <X className="w-5 h-5 stroke-[3]" />
                                    </span>
                                  ) : (
                                    <span className="w-10 h-10 rounded-2xl border-2 border-dashed border-slate-200 group-hover:border-[#003b95] text-slate-300 group-hover:text-[#003b95] group-hover:bg-blue-50/50 font-black flex items-center justify-center text-base transition-all active:scale-95">
                                      +
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Xulosa ustunlari (Faqat Bor, Yo'q va Foiz) */}
                      <td className="py-3.5 px-3 text-center font-extrabold text-emerald-700 bg-emerald-50/30 border-l border-slate-200">
                        <span className="px-2 py-1 rounded-lg bg-emerald-100/80 text-emerald-800">
                          {presentCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-rose-700 bg-rose-50/30">
                        <span className="px-2 py-1 rounded-lg bg-rose-100/80 text-rose-800">
                          {absentCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-slate-700 bg-blue-50/30">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            attendancePercent >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : attendancePercent >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {attendancePercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pastki Qulay Yo'riqnoma va O'zgarishlarni Saqlash Tugmasi */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-[#003b95] shrink-0" />
              <span>
                Davomat qo&apos;yish: Katakchani bosing va <strong>Yashil (Bor ✓)</strong> yoki <strong>Qizil (Yo&apos;q ✕)</strong> ni tanlang. Oldingi dars to&apos;liq olinmasa, keyingi darslar avtomatik ravishda <strong>Siyohrang (Y - Yopiq)</strong> bo&apos;lib saqlanadi.
              </span>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-amber-600 animate-pulse">
                  Avtomatik saqlanmoqda...
                </span>
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => handleSaveAttendance(false)}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Hoziroq Saqlash
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interaktiv Tanlov Popover (Yashil - Bor va Qizil - Yo'q) */}
      {popoverState && (
        <div
          className="fixed inset-0 z-50 pointer-events-auto"
          onClick={() => setPopoverState(null)}
        >
          {/* Fonga bosilganda yopish uchun shaffof backdrop */}
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[0.5px]" />

          {/* Tanlov oynasi */}
          <div
            style={{
              position: 'fixed',
              left: `${Math.min(
                Math.max(popoverState.x, 115),
                typeof window !== 'undefined' ? window.innerWidth - 115 : 200
              )}px`,
              top: `${
                popoverState.y < 170 ? popoverState.y + 48 : popoverState.y - 12
              }px`,
              transform:
                popoverState.y < 170 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            }}
            className="z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 min-w-[210px] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* O'quvchi ismi va sana sarlavhasi */}
            <div className="text-center pb-2 mb-2.5 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                {popoverState.studentName}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                {popoverState.day}-{MONTHS[selectedMonth - 1]?.label} darsi
              </div>
            </div>

            {/* Yashil (Bor) va Qizil (Yo'q) Tugmalari */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSetStatus(popoverState.studentId, popoverState.day, 'present');
                  setPopoverState(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-sm active:scale-95 ${
                  popoverState.currentStatus === 'present'
                    ? 'bg-emerald-600 ring-2 ring-emerald-400 ring-offset-1'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Bor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSetStatus(popoverState.studentId, popoverState.day, 'absent');
                  setPopoverState(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-sm active:scale-95 ${
                  popoverState.currentStatus === 'absent'
                    ? 'bg-rose-600 ring-2 ring-rose-400 ring-offset-1'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                }`}
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>Yo&apos;q</span>
              </button>
            </div>

            {/* Agar belgilangan bo'lsa, tozalash tugmasi */}
            {popoverState.currentStatus && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    handleClearStatus(popoverState.studentId, popoverState.day);
                    setPopoverState(null);
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  Belgini bekor qilish (-)
                </button>
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
