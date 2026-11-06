export interface AdminUser {
  id: string;
  username: string;
}

export interface Group {
  _id: string;
  name: string;
  subject: string;
  teacherName: string;
  time: string;
  days: string;
  room: string;
  monthlyPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  fullName: string;
  phone: string;
  groupId: string | Group;
  missedLessonsCount: number;
  discount?: number;
  discountReason?: string;
  paymentStatus?: 'paid' | 'unpaid';
  status: 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceDay {
  date: number;
  status: 'present' | 'absent' | 'excused';
}

export interface AttendanceRecord {
  _id?: string;
  student: string | Student;
  group: string | Group;
  year: number;
  month: number; // 1-12
  days: AttendanceDay[];
  isPaid?: boolean;
}

export interface DashboardStats {
  totalActiveStudents: number;
  totalArchivedStudents: number;
  totalGroups: number;
  todayAttendancePercent?: number;
  recentGroups?: Group[];
  recentStudents?: Student[];
}
