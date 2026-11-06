const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Muayyan guruh va oy bo'yicha davomatni olish
const getAttendanceByMonth = async (req, res) => {
  try {
    const { groupId, year, month } = req.query;
    
    if (!groupId || !year || !month) {
      return res.status(400).json({ message: "Guruh, yil va oy ko'rsatilishi shart" });
    }

    const attendanceRecords = await Attendance.find({
      group: groupId,
      year: Number(year),
      month: Number(month),
    }).populate('student', 'fullName');

    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Davomatni saqlash yoki yangilash (bitta yoki ommaviy)
const saveAttendance = async (req, res) => {
  try {
    // Agar ommaviy saqlash (bulk save) so'ralgan bo'lsa
    if (Array.isArray(req.body.records)) {
      const { groupId, year, month, records } = req.body;
      if (!groupId || !year || !month) {
        return res.status(400).json({ message: "Guruh, yil va oy ko'rsatilishi shart" });
      }

      const results = [];
      for (const record of records) {
        const { studentId, days } = record;
        if (!studentId || !Array.isArray(days)) continue;

        let attendance = await Attendance.findOne({
          student: studentId,
          group: groupId,
          year: Number(year),
          month: Number(month),
        });

        if (attendance) {
          attendance.days = days;
          if (record.isPaid !== undefined) {
            attendance.isPaid = record.isPaid;
          }
          await attendance.save();
        } else {
          attendance = await Attendance.create({
            student: studentId,
            group: groupId,
            year: Number(year),
            month: Number(month),
            days,
            isPaid: record.isPaid !== undefined ? record.isPaid : false,
          });
        }

        // Qoldirilgan darslarni hisoblash
        const absentCount = days.filter((d) => d.status === 'absent').length;
        await Student.findByIdAndUpdate(studentId, { missedLessonsCount: absentCount });

        results.push(attendance);
      }

      return res.json({ message: 'Barcha davomat muvaffaqiyatli saqlandi', count: results.length });
    }

    // Bitta o'quvchi uchun saqlash
    const { studentId, groupId, year, month, days } = req.body;

    let attendance = await Attendance.findOne({
      student: studentId,
      group: groupId,
      year: Number(year),
      month: Number(month),
    });

    if (attendance) {
      attendance.days = days;
      if (req.body.isPaid !== undefined) {
        attendance.isPaid = req.body.isPaid;
      }
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        student: studentId,
        group: groupId,
        year: Number(year),
        month: Number(month),
        days,
        isPaid: req.body.isPaid !== undefined ? req.body.isPaid : false,
      });
    }

    // Qoldirilgan darslar sonini hisoblash va student modelida yangilash
    const absentCount = Array.isArray(days) ? days.filter((d) => d.status === 'absent').length : 0;
    await Student.findByIdAndUpdate(studentId, { missedLessonsCount: absentCount });

    res.json({ message: 'Davomat muvaffaqiyatli saqlandi', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Muayyan oy uchun to'lov holatini almashtirish (To'ladi <-> To'lamadi)
const toggleMonthPayment = async (req, res) => {
  try {
    const { studentId, groupId, year, month } = req.body;
    if (!studentId || !groupId || !year || !month) {
      return res.status(400).json({ message: "Student, guruh, yil va oy ko'rsatilishi shart" });
    }

    let attendance = await Attendance.findOne({
      student: studentId,
      group: groupId,
      year: Number(year),
      month: Number(month),
    });

    if (attendance) {
      attendance.isPaid = !attendance.isPaid;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        student: studentId,
        group: groupId,
        year: Number(year),
        month: Number(month),
        days: [],
        isPaid: true,
      });
    }

    res.json({
      message: `To'lov holati "${attendance.isPaid ? "To'ladi" : "To'lamadi"}" deb belgilandi`,
      isPaid: attendance.isPaid,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendanceByMonth,
  saveAttendance,
  toggleMonthPayment,
};
