const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  refreshToken,
  logoutAdmin,
  getDashboardStats,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getActiveStudents,
  getArchivedStudents,
  createStudent,
  updateStudent,
  toggleStudentPayment,
  updateStudentStatus,
  deleteStudent,
} = require('../controllers/adminController');
const {
  getAttendanceByMonth,
  saveAttendance,
  toggleMonthPayment,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// Auth yo'llari
router.post('/auth/login', loginAdmin);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logoutAdmin);

// Dashboard statistikasi
router.get('/admin/dashboard/stats', protect, getDashboardStats);

// Himoyalangan Admin yo'llari (Guruhlar)
router.get('/admin/groups', protect, getGroups);
router.post('/admin/groups', protect, createGroup);
router.put('/admin/groups/:id', protect, updateGroup);
router.delete('/admin/groups/:id', protect, deleteGroup);

// Himoyalangan Admin yo'llari (O'quvchilar)
router.get('/admin/students/active', protect, getActiveStudents);
router.get('/admin/students/archive', protect, getArchivedStudents);
router.post('/admin/students', protect, createStudent);
router.put('/admin/students/:id', protect, updateStudent);
router.put('/admin/students/:id/payment', protect, toggleStudentPayment);
router.put('/admin/students/:id/status', protect, updateStudentStatus);
router.delete('/admin/students/:id', protect, deleteStudent);

// Himoyalangan Admin yo'llari (Davomat)
router.get('/admin/attendance', protect, getAttendanceByMonth);
router.post('/admin/attendance', protect, saveAttendance);
router.put('/admin/attendance/payment', protect, toggleMonthPayment);

module.exports = router;
