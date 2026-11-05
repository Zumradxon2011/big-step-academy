const User = require('../models/User');
const Group = require('../models/Group');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Access Token yaratish (15 daqiqa)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

// Refresh Token yaratish (7 kun)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await User.findOne({ username });
    
    if (!admin) {
      return res.status(400).json({ message: 'Login yoki parol noto\'g\'ri' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Login yoki parol noto\'g\'ri' });
    }

    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    // Refresh tokenni httpOnly cookie'ga joylash
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ 
      accessToken, 
      admin: { id: admin._id, username: admin.username } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tokenni yangilash (Refresh)
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token topilmadi' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token yaroqsiz yoki muddati o\'tgan' });
  }
};

// Logout
const logoutAdmin = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Tizimdan muvaffaqiyatli chiqildi' });
};

// Guruhlarni olish
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yangi guruh qo'shish
const createGroup = async (req, res) => {
  try {
    const { name, subject, teacherName, time, days, room } = req.body;
    const group = await Group.create({ name, subject, teacherName, time, days, room });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Guruh ma'lumotlarini yangilash (Update)
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, teacherName, time, days, room } = req.body;

    const group = await Group.findByIdAndUpdate(
      id,
      { name, subject, teacherName, time, days, room },
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Guruh topilmadi" });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Guruhni o'chirish (Delete) - Xavfsiz tekshiruv bilan
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Guruh topilmadi" });
    }

    // Guruhga biriktirilgan faol o'quvchilar sonini tekshirish
    const activeStudentsCount = await Student.countDocuments({
      groupId: id,
      status: 'active',
    });

    if (activeStudentsCount > 0) {
      return res.status(400).json({
        message: `Ushbu guruhda ${activeStudentsCount} ta faol o'quvchi mavjud. Guruhni o'chirishdan oldin ularni boshqa guruhga ko'chiring yoki arxivlang.`,
      });
    }

    await Group.findByIdAndDelete(id);

    res.json({ message: "Guruh muvaffaqiyatli o'chirildi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Faol o'quvchilarni olish (agar groupId berilsa, faqat shu guruhnikini oladi)
const getActiveStudents = async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (req.query.groupId) {
      filter.groupId = req.query.groupId;
    }
    const students = await Student.find(filter).populate('groupId', 'name subject');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Arxivlangan (ketib qolgan) o'quvchilarni olish
const getArchivedStudents = async (req, res) => {
  try {
    const students = await Student.find({ status: 'archived' }).populate('groupId', 'name subject');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Yangi o'quvchi qo'shish
const createStudent = async (req, res) => {
  try {
    const { fullName, phone, groupId } = req.body;
    const student = await Student.create({ fullName, phone, groupId });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// O'quvchi statusini o'zgartirish (active <-> archived)
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' yoki 'archived'
    
    const student = await Student.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'O\'quvchi topilmadi' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginAdmin,
  refreshToken,
  logoutAdmin,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getActiveStudents,
  getArchivedStudents,
  createStudent,
  updateStudentStatus,
};
