'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Group } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Plus,
  Search,
  GraduationCap,
  Clock,
  Calendar,
  MapPin,
  User,
  Users,
  CheckCircle2,
  CalendarCheck,
  RotateCw,
  BookOpen,
  Edit2,
  Trash2,
  AlertTriangle,
  Banknote,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Yangi guruh qo'shish modal holati
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    teacherName: '',
    time: '',
    days: '',
    room: '',
    monthlyPrice: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Guruhni tahrirlash (Edit) holati
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    subject: '',
    teacherName: '',
    time: '',
    days: '',
    room: '',
    monthlyPrice: '',
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Guruhni o'chirish (Delete) holati
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Guruhlarni backenddan yuklash
  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/groups');
      setGroups(res.data || []);
    } catch (err) {
      console.error('Guruhlarni yuklashda xatolik:', err);
      toast.error('Guruhlar ro\'yxatini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Qidiruv bo'yicha filtrlash
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.teacherName.toLowerCase().includes(q) ||
        g.room.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  // Forma validatsiyasi (universal)
  const validateGroupData = (data: typeof formData) => {
    const errors: Record<string, string> = {};
    if (!data.name.trim()) errors.name = 'Guruh nomi kiritilishi shart';
    if (!data.subject.trim()) errors.subject = 'Fan nomi kiritilishi shart';
    if (!data.teacherName.trim()) errors.teacherName = 'O\'qituvchi F.I.Sh kiritilishi shart';
    if (!data.days.trim()) errors.days = 'Dars kunlari kiritilishi shart';
    if (!data.time.trim()) errors.time = 'Dars vaqti kiritilishi shart';
    if (!data.room.trim()) errors.room = 'Xona raqami kiritilishi shart';
    return errors;
  };

  // Yangi guruh yaratish
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateGroupData(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/admin/groups', {
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        teacherName: formData.teacherName.trim(),
        days: formData.days.trim(),
        time: formData.time.trim(),
        room: formData.room.trim(),
        monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : 0,
      });

      toast.success('Yangi guruh muvaffaqiyatli qo\'shildi!');
      setGroups((prev) => [res.data, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        subject: '',
        teacherName: '',
        time: '',
        days: '',
        room: '',
        monthlyPrice: '',
      });
      setFormErrors({});
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Guruh qo\'shishda xatolik yuz berdi';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tahrirlash modalini ochish
  const handleOpenEditModal = (group: Group) => {
    setEditingGroup(group);
    setEditFormData({
      name: group.name,
      subject: group.subject,
      teacherName: group.teacherName,
      time: group.time,
      days: group.days,
      room: group.room,
      monthlyPrice: group.monthlyPrice ? String(group.monthlyPrice) : '',
    });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  // Guruhni yangilash (Update)
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    const errors = validateGroupData(editFormData);
    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsUpdating(true);
      const res = await api.put(`/admin/groups/${editingGroup._id}`, {
        name: editFormData.name.trim(),
        subject: editFormData.subject.trim(),
        teacherName: editFormData.teacherName.trim(),
        days: editFormData.days.trim(),
        time: editFormData.time.trim(),
        room: editFormData.room.trim(),
        monthlyPrice: editFormData.monthlyPrice ? Number(editFormData.monthlyPrice) : 0,
      });

      toast.success('Guruh ma\'lumotlari muvaffaqiyatli yangilandi!');
      setGroups((prev) => prev.map((g) => (g._id === editingGroup._id ? res.data : g)));
      setIsEditModalOpen(false);
      setEditingGroup(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Guruhni yangilashda xatolik yuz berdi';
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // O'chirish modalini ochish
  const handleOpenDeleteModal = (group: Group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  // Guruhni o'chirish (Delete)
  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/admin/groups/${groupToDelete._id}`);

      toast.success('Guruh muvaffaqiyatli o\'chirildi');
      setGroups((prev) => prev.filter((g) => g._id !== groupToDelete._id));
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Guruhni o\'chirishda xatolik yuz berdi';
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sarlavha va Amal tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Guruhlar Ro&apos;yxati
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Jami <span className="font-semibold text-slate-700">{groups.length} ta</span> faol guruh mavjud
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={fetchGroups}
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
            Yangi Guruh
          </Button>
        </div>
      </div>

      {/* Qidiruv paneli */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative max-w-md">
          <Input
            placeholder="Guruh nomi, fan, o'qituvchi yoki xona bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* Guruhlar ro'yxati (Grid) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-5 bg-slate-200 rounded w-16" />
              </div>
              <div className="space-y-2 py-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <div className="h-8 bg-slate-100 rounded-xl flex-1" />
                <div className="h-8 bg-slate-100 rounded-xl flex-1" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        /* Bo'sh holat */
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-[#f59e0b] flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {searchQuery ? 'Mos guruh topilmadi' : 'Hech qanday guruh mavjud emas'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `"${searchQuery}" bo'yicha hech narsa topilmadi. Qidiruv so'zini tekshirib ko'ring.`
              : 'O\'quv markazingizda ilk guruhni yaratish uchun quyidagi tugmani bosing.'}
          </p>
          {!searchQuery && (
            <Button
              variant="accent"
              size="md"
              className="mt-5"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Ilk guruhni yaratish
            </Button>
          )}
        </div>
      ) : (
        /* Guruhlar kartochkalari */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
            <Card
              key={group._id}
              hoverEffect
              className="flex flex-col justify-between border-slate-200/70 hover:border-[#003b95]/30 transition-all duration-200"
            >
              <div>
                {/* Guruh nomi, fan tegi va boshqaruv tugmalari */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate" title={group.name}>
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-[#003b95] font-semibold truncate">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{group.subject}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="brand" size="sm">
                      {group.room}
                    </Badge>
                    <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(group)}
                        className="p-1.5 text-slate-400 hover:text-[#003b95] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Guruhni tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(group)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Guruhni o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Guruh ma'lumotlari */}
                <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">O&apos;qituvchi:</span>
                    <span className="text-slate-900 font-semibold truncate">
                      {group.teacherName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">Kunlar:</span>
                    <span className="text-slate-900 truncate">{group.days}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">Vaqti:</span>
                    <span className="text-slate-900 font-medium">{group.time}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-700">Oylik to&apos;lov:</span>
                    <span className="text-emerald-700 font-bold">
                      {group.monthlyPrice && group.monthlyPrice > 0
                        ? `${Number(group.monthlyPrice).toLocaleString()} so'm`
                        : "Kiritilmagan"}
                    </span>
                    {group.monthlyPrice && group.monthlyPrice > 0 ? (
                      <span className="text-[10px] text-slate-400">
                        (~{Math.round(group.monthlyPrice / 12).toLocaleString()} so&apos;m/dars)
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Havola tugmalari */}
              <div className="pt-4 flex items-center gap-2 mt-2">
                <Link
                  href={`/admin/students?groupId=${group._id}`}
                  className="flex-1"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={<Users className="w-3.5 h-3.5" />}
                  >
                    O&apos;quvchilar
                  </Button>
                </Link>

                <Link
                  href={`/admin/attendance?groupId=${group._id}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
                  >
                    Davomat
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Yangi Guruh Qo'shish Modali */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormErrors({});
        }}
        title="Yangi Guruh Yaratish"
        description="O'quv kursi uchun yangi guruh va o'qituvchi ma'lumotlarini kiriting"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Guruh Nomi *"
              placeholder="Masalan: IELTS Standard 1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />

            <Input
              label="Fan / Kurs Nomi *"
              placeholder="Masalan: IELTS, Ingliz tili"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              error={formErrors.subject}
            />
          </div>

          <Input
            label="Biriktirilgan O'qituvchi F.I.Sh *"
            placeholder="Masalan: Sardor Aliyev"
            value={formData.teacherName}
            onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
            error={formErrors.teacherName}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Dars Kunlari *"
              placeholder="Du - Chor - Jum"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              error={formErrors.days}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              label="Dars Vaqti *"
              placeholder="09:00 - 11:00"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              error={formErrors.time}
              leftIcon={<Clock className="w-4 h-4" />}
            />

            <Input
              label="Xona *"
              placeholder="Xona 204"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              error={formErrors.room}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Oylik Kurs Narxi (so'mda)"
            placeholder="Masalan: 450000"
            type="number"
            value={formData.monthlyPrice}
            onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
            leftIcon={<Banknote className="w-4 h-4 text-emerald-600" />}
            helperText="Standart: 1 oyda 12 ta dars hisoblanadi (oylik to'lov / 12 = 1 dars narxi)"
          />

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
              Guruhni Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Guruhni Tahrirlash (Edit) Modali */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGroup(null);
          setEditFormErrors({});
        }}
        title="Guruhni Tahrirlash"
        description="Guruh va o'qituvchi ma'lumotlarini o'zgartiring"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateGroup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Guruh Nomi *"
              placeholder="Masalan: IELTS Standard 1"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              error={editFormErrors.name}
            />

            <Input
              label="Fan / Kurs Nomi *"
              placeholder="Masalan: IELTS, Ingliz tili"
              value={editFormData.subject}
              onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
              error={editFormErrors.subject}
            />
          </div>

          <Input
            label="Biriktirilgan O'qituvchi F.I.Sh *"
            placeholder="Masalan: Sardor Aliyev"
            value={editFormData.teacherName}
            onChange={(e) => setEditFormData({ ...editFormData, teacherName: e.target.value })}
            error={editFormErrors.teacherName}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Dars Kunlari *"
              placeholder="Du - Chor - Jum"
              value={editFormData.days}
              onChange={(e) => setEditFormData({ ...editFormData, days: e.target.value })}
              error={editFormErrors.days}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              label="Dars Vaqti *"
              placeholder="09:00 - 11:00"
              value={editFormData.time}
              onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
              error={editFormErrors.time}
              leftIcon={<Clock className="w-4 h-4" />}
            />

            <Input
              label="Xona *"
              placeholder="Xona 204"
              value={editFormData.room}
              onChange={(e) => setEditFormData({ ...editFormData, room: e.target.value })}
              error={editFormErrors.room}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Oylik Kurs Narxi (so'mda)"
            placeholder="Masalan: 450000"
            type="number"
            value={editFormData.monthlyPrice}
            onChange={(e) => setEditFormData({ ...editFormData, monthlyPrice: e.target.value })}
            leftIcon={<Banknote className="w-4 h-4 text-emerald-600" />}
            helperText="Standart: 1 oyda 12 ta dars hisoblanadi (oylik to'lov / 12 = 1 dars narxi)"
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingGroup(null);
                setEditFormErrors({});
              }}
              disabled={isUpdating}
            >
              Bekor qilish
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdating}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              O&apos;zgarishlarni Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Guruhni O'chirishni Tasdiqlash Modali */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setGroupToDelete(null);
          }
        }}
        title="Guruhni o'chirish"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <p className="font-bold text-rose-900">
                &ldquo;{groupToDelete?.name}&rdquo; guruhini o&apos;chirmoqchimisiz?
              </p>
              <p className="mt-1 text-rose-700/90 text-xs">
                Agar bu guruhda faol o&apos;quvchilar bo&apos;lsa, tizim o&apos;chirishga ruxsat bermaydi.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setGroupToDelete(null);
              }}
              disabled={isDeleting}
            >
              Bekor qilish
            </Button>

            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Ha, o&apos;chirilsin
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
