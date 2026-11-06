'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Student, Group } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Plus,
  Search,
  Users,
  Archive,
  Phone,
  RotateCw,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  UserX,
  Calendar,
  Layers,
  Banknote,
  Edit2,
  Tag,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

function StudentsContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  // Tab: 'active' | 'archived'
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Ro'yxatlar
  const [activeStudents, setActiveStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Yuklanish va qidiruv holatlari
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(initialGroupId);

  // Yangi o'quvchi qo'shish modali
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    groupId: initialGroupId,
    discount: '',
    discountReason: '',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // O'quvchini tahrirlash (Edit) modali
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    groupId: '',
    discount: '',
    discountReason: '',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid',
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [isTogglingPayment, setIsTogglingPayment] = useState<string | null>(null);

  // Statusni o'zgartirish (arxivlash / tiklash) modali
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    student: Student | null;
    targetStatus: 'active' | 'archived';
  }>({
    isOpen: false,
    student: null,
    targetStatus: 'archived',
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // O'quvchini butunlay o'chirish (Delete) modali
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // Guruhlarni yuklash
  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/admin/groups');
      setGroups(res.data || []);
    } catch (err) {
      console.error('Guruhlarni yuklashda xatolik:', err);
    }
  }, []);

  // O'quvchilarni yuklash
  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const [activeRes, archiveRes] = await Promise.all([
        api.get('/admin/students/active'),
        api.get('/admin/students/archive'),
      ]);
      setActiveStudents(activeRes.data || []);
      setArchivedStudents(archiveRes.data || []);
    } catch (err) {
      console.error('O\'quvchilarni yuklashda xatolik:', err);
      toast.error('O\'quvchilar ro\'yxatini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, [fetchGroups, fetchStudents]);

  // Faol yoki arxivlangan o'quvchilarni saralash va filtrlash
  const currentList = activeTab === 'active' ? activeStudents : archivedStudents;

  const filteredStudents = useMemo(() => {
    return currentList.filter((s) => {
      // Guruh bo'yicha filter
      if (selectedGroupFilter) {
        const studentGroupId =
          typeof s.groupId === 'object' && s.groupId !== null
            ? (s.groupId as Group)._id
            : s.groupId;
        if (studentGroupId !== selectedGroupFilter) return false;
      }

      // Qidiruv bo'yicha filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const groupName =
          typeof s.groupId === 'object' && s.groupId !== null
            ? (s.groupId as Group).name.toLowerCase()
            : '';
        const matchName = s.fullName.toLowerCase().includes(q);
        const matchPhone = s.phone.toLowerCase().includes(q);
        const matchGroup = groupName.includes(q);
        return matchName || matchPhone || matchGroup;
      }

      return true;
    });
  }, [currentList, selectedGroupFilter, searchQuery]);

  // Forma validatsiyasi
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'O\'quvchi F.I.Sh kiritilishi shart';
    if (!formData.phone.trim()) errors.phone = 'Telefon raqami kiritilishi shart';
    if (!formData.groupId) errors.groupId = 'Guruhni tanlash shart';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Yangi o'quvchi qo'shish
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await api.post('/admin/students', {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        groupId: formData.groupId,
        discount: formData.discount ? Number(formData.discount) : 0,
        discountReason: formData.discountReason.trim(),
        paymentStatus: formData.paymentStatus,
      });

      toast.success('Yangi o\'quvchi muvaffaqiyatli qo\'shildi!');
      setIsAddModalOpen(false);
      setFormData({
        fullName: '',
        phone: '',
        groupId: '',
        discount: '',
        discountReason: '',
        paymentStatus: 'unpaid',
      });
      setFormErrors({});
      fetchStudents();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'O\'quvchi qo\'shishda xatolik yuz berdi';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // O'quvchini tahrirlash modalini ochish
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    const gId =
      typeof student.groupId === 'object' && student.groupId !== null
        ? (student.groupId as Group)._id
        : (student.groupId as string) || '';
    setEditFormData({
      fullName: student.fullName,
      phone: student.phone,
      groupId: gId,
      discount: student.discount !== undefined && student.discount > 0 ? String(student.discount) : '',
      discountReason: student.discountReason || '',
      paymentStatus: student.paymentStatus === 'paid' ? 'paid' : 'unpaid',
    });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  // O'quvchini yangilash
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const errors: Record<string, string> = {};
    if (!editFormData.fullName.trim()) errors.fullName = 'O\'quvchi F.I.Sh kiritilishi shart';
    if (!editFormData.phone.trim()) errors.phone = 'Telefon raqami kiritilishi shart';
    if (!editFormData.groupId) errors.groupId = 'Guruhni tanlash shart';
    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsUpdatingStudent(true);
      await api.put(`/admin/students/${editingStudent._id}`, {
        fullName: editFormData.fullName.trim(),
        phone: editFormData.phone.trim(),
        groupId: editFormData.groupId,
        discount: editFormData.discount ? Number(editFormData.discount) : 0,
        discountReason: editFormData.discountReason.trim(),
        paymentStatus: editFormData.paymentStatus,
      });

      toast.success('O\'quvchi ma\'lumotlari muvaffaqiyatli yangilandi!');
      setIsEditModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'O\'quvchini yangilashda xatolik yuz berdi';
      toast.error(errorMsg);
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  // To'lov holatini bitta bosish bilan almashtirish (To'ladi <-> To'lamadi)
  const handleTogglePayment = async (studentId: string, currentStatus?: string) => {
    try {
      setIsTogglingPayment(studentId);
      const res = await api.put(`/admin/students/${studentId}/payment`);
      const newStatus = res.data.paymentStatus;
      toast.success(
        newStatus === 'paid' ? 'To\'lov qabul qilindi (To\'ladi)' : 'To\'lov bekor qilindi (To\'lamadi)'
      );
      setActiveStudents((prev) =>
        prev.map((s) => (s._id === studentId ? { ...s, paymentStatus: newStatus } : s))
      );
      setArchivedStudents((prev) =>
        prev.map((s) => (s._id === studentId ? { ...s, paymentStatus: newStatus } : s))
      );
    } catch (err: unknown) {
      console.error('To\'lov holatini o\'zgartirishda xatolik:', err);
      toast.error('To\'lov holatini o\'zgartirishda xatolik yuz berdi');
    } finally {
      setIsTogglingPayment(null);
    }
  };

  // O'quvchi to'lovini hisoblash (1 oyda 12 dars qoidasi bo'yicha)
  const calculateStudentFee = (student: Student) => {
    const groupObj =
      typeof student.groupId === 'object' && student.groupId !== null
        ? (student.groupId as Group)
        : groups.find((g) => g._id === student.groupId);

    const monthlyPrice = groupObj?.monthlyPrice || 0;
    const discount = student.discount || 0;
    const netBasePrice = Math.max(0, monthlyPrice - discount);

    // 1 oyda 12 ta dars qoidasi
    const lessonPrice = netBasePrice / 12;
    const missed = student.missedLessonsCount || 0;
    const finalPayment = Math.max(0, Math.round(netBasePrice - missed * lessonPrice));

    return {
      monthlyPrice,
      discount,
      netBasePrice,
      lessonPrice,
      missed,
      finalPayment,
      hasPrice: Boolean(monthlyPrice && monthlyPrice > 0),
    };
  };

  // Statusni o'zgartirish (arxivlash / qayta tiklash)
  const handleUpdateStatus = async () => {
    if (!statusModal.student) return;

    try {
      setIsUpdatingStatus(true);
      await api.put(`/admin/students/${statusModal.student._id}/status`, {
        status: statusModal.targetStatus,
      });

      toast.success(
        statusModal.targetStatus === 'archived'
          ? 'O\'quvchi arxivga o\'tkazildi'
          : 'O\'quvchi faol guruhga qayta tiklandi'
      );
      setStatusModal({ isOpen: false, student: null, targetStatus: 'archived' });
      fetchStudents();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Statusni o\'zgartirishda xatolik';
      toast.error(errorMsg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // O'quvchini butunlay o'chirish (Delete)
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setIsDeletingStudent(true);
      await api.delete(`/admin/students/${studentToDelete._id}`);
      toast.success('O\'quvchi va uning barcha ma\'lumotlari o\'chirildi');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'O\'quvchini o\'chirishda xatolik yuz berdi';
      toast.error(errorMsg);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sarlavha va Harakat tugmalari */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            O&apos;quvchilar Boshqaruvi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Faol o&apos;quvchilar: <strong className="text-emerald-700">{activeStudents.length} ta</strong> | Arxivda: <strong className="text-slate-600">{archivedStudents.length} ta</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={fetchStudents}
            disabled={isLoading}
            leftIcon={<RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Yangilash
          </Button>

          <Button
            variant="accent"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Yangi O&apos;quvchi
          </Button>
        </div>
      </div>

      {/* Tablar (Faol vs Arxiv) */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'border-[#003b95] text-[#003b95]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Faol O&apos;quvchilar</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'active'
                ? 'bg-[#003b95]/10 text-[#003b95]'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {activeStudents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('archived')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'archived'
              ? 'border-[#003b95] text-[#003b95]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Arxivlanganlar</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'archived'
                ? 'bg-[#003b95]/10 text-[#003b95]'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {archivedStudents.length}
          </span>
        </button>
      </div>

      {/* Qidiruv va Guruh bo'yicha filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="O'quvchi ismi, telefon yoki guruh bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
          >
            <option value="">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} ({g.subject})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Jadval / Kartochkalar */}
      {isLoading ? (
        <Card className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl w-full" />
          ))}
        </Card>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#003b95] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {searchQuery || selectedGroupFilter
              ? 'Mos o\'quvchi topilmadi'
              : activeTab === 'active'
              ? 'Faol o\'quvchilar ro\'yxati bo\'sh'
              : 'Arxivda o\'quvchilar yo\'q'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedGroupFilter
              ? 'Filtr parametrlarini o\'zgartirib qayta qidiring.'
              : activeTab === 'active'
              ? 'O\'quv markazingizga yangi o\'quvchi qo\'shish uchun quyidagi tugmani bosing.'
              : 'Hozirda barcha o\'quvchilar faol holatda.'}
          </p>
          {activeTab === 'active' && !searchQuery && !selectedGroupFilter && (
            <Button
              variant="accent"
              size="md"
              className="mt-5"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Ilk o&apos;quvchini qo&apos;shish
            </Button>
          )}
        </div>
      ) : (
        /* O'quvchilar Jadvali */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">O&apos;quvchi F.I.Sh</th>
                  <th className="py-4 px-6">Telefon Raqami</th>
                  <th className="py-4 px-6">Biriktirilgan Guruh</th>
                  <th className="py-4 px-6 text-center">Qoldirgan Darslari</th>
                  <th className="py-4 px-6 text-center">To&apos;lov Summasi</th>
                  <th className="py-4 px-6 text-center">Holati</th>
                  <th className="py-4 px-6 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student) => {
                  const groupObj =
                    typeof student.groupId === 'object' && student.groupId !== null
                      ? (student.groupId as Group)
                      : null;
                  const fee = calculateStudentFee(student);

                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* O'quvchi F.I.Sh */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#003b95]/10 text-[#003b95] flex items-center justify-center font-bold text-xs shrink-0">
                            {student.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">
                              {student.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {student.createdAt
                                ? new Date(student.createdAt).toLocaleDateString('uz-UZ')
                                : 'Ro\'yxatga olingan'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Telefon */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <a
                          href={`tel:${student.phone}`}
                          className="inline-flex items-center gap-1.5 hover:text-[#003b95] transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.phone}</span>
                        </a>
                      </td>

                      {/* Guruh */}
                      <td className="py-4 px-6">
                        {groupObj ? (
                          <div>
                            <div className="font-semibold text-slate-800">
                              {groupObj.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {groupObj.subject}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Guruh belgilanmagan
                          </span>
                        )}
                      </td>

                      {/* Qoldirgan darslar */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            student.missedLessonsCount > 3
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : student.missedLessonsCount > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {student.missedLessonsCount} ta dars
                        </span>
                      </td>

                      {/* To'lov Summasi */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center">
                          {fee.hasPrice ? (
                            <>
                              <span className="font-extrabold text-slate-900 text-sm">
                                {fee.finalPayment.toLocaleString()} so&apos;m
                              </span>
                              {fee.discount > 0 && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-200/60"
                                  title={student.discountReason || "Chegirma"}
                                >
                                  -{fee.discount.toLocaleString()} so&apos;m
                                  {student.discountReason ? ` (${student.discountReason})` : ' skidka'}
                                </span>
                              )}
                              {fee.missed > 0 && (
                                <span className="text-[10px] text-rose-500 font-medium mt-0.5">
                                  (-{Math.round(fee.missed * fee.lessonPrice).toLocaleString()} so&apos;m qoldirilgan)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic mb-1">
                              Narx kiritilmagan
                            </span>
                          )}

                          {/* To'ladi / To'lamadi tugmasi */}
                          <button
                            type="button"
                            onClick={() => handleTogglePayment(student._id, student.paymentStatus)}
                            disabled={isTogglingPayment === student._id}
                            title="To'lov holatini o'zgartirish uchun bosing (To'ladi / To'lamadi)"
                            className={`mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all active:scale-95 shadow-2xs border ${
                              student.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                student.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{student.paymentStatus === 'paid' ? "To'ladi" : "To'lamadi"}</span>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <Badge
                          variant={student.status === 'active' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {student.status === 'active' ? 'Faol' : 'Arxivda'}
                        </Badge>
                      </td>

                      {/* Amallar */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 text-slate-400 hover:text-[#003b95] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="O'quvchi ma'lumotlari va chegirmasini tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {student.status === 'active' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs text-slate-600 hover:text-rose-600 hover:border-rose-200"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  student,
                                  targetStatus: 'archived',
                                })
                              }
                              leftIcon={<UserX className="w-3.5 h-3.5" />}
                            >
                              Arxivlash
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  student,
                                  targetStatus: 'active',
                                })
                              }
                              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                            >
                              Faollashtirish
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setStudentToDelete(student);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="O'quvchini butunlay o'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yangi O'quvchi Qo'shish Modali */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormErrors({});
        }}
        title="Yangi O'quvchi Qo'shish"
        description="O'quv markaziga yangi o'quvchi kiritish va guruhga biriktirish"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <Input
            label="O'quvchi F.I.Sh *"
            placeholder="Masalan: Rustamov Anvar Alisher o'g'li"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={formErrors.fullName}
          />

          <Input
            label="Telefon Raqami *"
            placeholder="+998 90 123 45 67"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={formErrors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Select
            label="Biriktiriladigan Guruh *"
            value={formData.groupId}
            onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
            error={formErrors.groupId}
            placeholder="Guruhni tanlang"
          >
            <option value="">-- Guruhni tanlang --</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} - {g.subject} ({g.teacherName})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Chegirma / Skidka (so'm)"
              placeholder="Masalan: 25000"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              leftIcon={<Tag className="w-4 h-4 text-emerald-600" />}
              helperText="Masalan: 1 oiladan 2 kishi kelganda"
            />

            <Input
              label="Chegirma Sababi"
              placeholder="Masalan: Bitta uydan 2 kishi"
              value={formData.discountReason}
              onChange={(e) => setFormData({ ...formData, discountReason: e.target.value })}
            />
          </div>

          <Select
            label="To'lov Holati"
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'paid' | 'unpaid' })}
          >
            <option value="unpaid">To&apos;lamadi (Kutilmoqda)</option>
            <option value="paid">To&apos;ladi (To&apos;langan)</option>
          </Select>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormErrors({});
              }}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>

            <Button
              type="submit"
              variant="accent"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              O&apos;quvchini Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* O'quvchini Tahrirlash (Edit) Modali */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
          setEditFormErrors({});
        }}
        title="O'quvchi Ma'lumotlarini Tahrirlash"
        description="F.I.Sh, telefon, guruh va shaxsiy chegirma (skidka)ni o'zgartirish"
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <Input
            label="O'quvchi F.I.Sh *"
            placeholder="Masalan: Rustamov Anvar Alisher o'g'li"
            value={editFormData.fullName}
            onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
            error={editFormErrors.fullName}
          />

          <Input
            label="Telefon Raqami *"
            placeholder="+998 90 123 45 67"
            value={editFormData.phone}
            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            error={editFormErrors.phone}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Select
            label="Biriktirilgan Guruh *"
            value={editFormData.groupId}
            onChange={(e) => setEditFormData({ ...editFormData, groupId: e.target.value })}
            error={editFormErrors.groupId}
            placeholder="Guruhni tanlang"
          >
            <option value="">-- Guruhni tanlang --</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} - {g.subject} ({g.teacherName})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Chegirma / Skidka (so'm)"
              placeholder="Masalan: 25000"
              type="number"
              value={editFormData.discount}
              onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })}
              leftIcon={<Tag className="w-4 h-4 text-emerald-600" />}
              helperText="Masalan: 1 oiladan 2 kishi kelganda"
            />

            <Input
              label="Chegirma Sababi"
              placeholder="Masalan: Bitta uydan 2 kishi"
              value={editFormData.discountReason}
              onChange={(e) => setEditFormData({ ...editFormData, discountReason: e.target.value })}
            />
          </div>

          <Select
            label="To'lov Holati"
            value={editFormData.paymentStatus}
            onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value as 'paid' | 'unpaid' })}
          >
            <option value="unpaid">To&apos;lamadi (Kutilmoqda)</option>
            <option value="paid">To&apos;ladi (To&apos;langan)</option>
          </Select>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingStudent(null);
                setEditFormErrors({});
              }}
              disabled={isUpdatingStudent}
            >
              Bekor qilish
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingStudent}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              O&apos;zgarishlarni Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Arxivlash / Qayta tiklash tasdiqlash modali */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() =>
          setStatusModal({ isOpen: false, student: null, targetStatus: 'archived' })
        }
        title={
          statusModal.targetStatus === 'archived'
            ? 'O\'quvchini arxivga o\'tkazish'
            : 'O\'quvchini qayta faollashtirish'
        }
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-slate-600">
              Haqiqatan ham{' '}
              <strong className="text-slate-900">
                {statusModal.student?.fullName}
              </strong>
              ni {statusModal.targetStatus === 'archived' ? 'arxivga o\'tkazmoqchimisiz?' : 'faol holatga qaytarmoqchimisiz?'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setStatusModal({ isOpen: false, student: null, targetStatus: 'archived' })
              }
              disabled={isUpdatingStatus}
            >
              Bekor qilish
            </Button>

            <Button
              variant={statusModal.targetStatus === 'archived' ? 'danger' : 'accent'}
              size="sm"
              onClick={handleUpdateStatus}
              isLoading={isUpdatingStatus}
            >
              {statusModal.targetStatus === 'archived' ? 'Arxivlash' : 'Faollashtirish'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* O'quvchini butunlay o'chirishni tasdiqlash modali */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeletingStudent) {
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
          }
        }}
        title="O'quvchini butunlay o'chirish"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <p className="font-bold text-rose-900">
                &ldquo;{studentToDelete?.fullName}&rdquo; o&apos;quvchisini bazadan butunlay o&apos;chirmoqchimisiz?
              </p>
              <p className="text-slate-600 mt-1 text-xs">
                Ushbu amal ortga qaytarilmaydi. O&apos;quvchiga tegishli barcha davomat yozuvlari ham bazadan tozalab tashlanadi. Agar o&apos;quvchi kursni vaqtincha to&apos;xtatgan bo&apos;lsa, o&apos;chirish o&apos;rniga <strong>Arxivlash</strong> tavsiya etiladi.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setStudentToDelete(null);
              }}
              disabled={isDeletingStudent}
            >
              Bekor qilish
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteStudent}
              isLoading={isDeletingStudent}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Ha, Butunlay O&apos;chirish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 animate-pulse text-sm">
          O&apos;quvchilar ro&apos;yxati yuklanmoqda...
        </div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}
