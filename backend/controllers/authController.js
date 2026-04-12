const db = require('../config/db');
const crypto = require('crypto');

// Validation functions
const validatePhoneNumber = (phone) => /^\d{10,11}$/.test(phone.replace(/\D/g, ''));
const validateStudentId = (id) => /^[a-zA-Z0-9\-]+$/.test(id);
const validatePassword = (password) => password && password.length >= 6;

// Password hashing functions
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hashed}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, key] = storedHash.split(':');
  const hashedAttempt = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return key === hashedAttempt;
};

// Student Registration
const registerStudent = async (req, res) => {
  try {
    const { student_id, name, phone, password } = req.body;

    // Validate inputs
    if (!student_id || !name || !phone || !password) {
      return res.status(400).json({ message: 'student_id, name, phone, and password are required.' });
    }

    if (!validateStudentId(student_id)) {
      return res.status(400).json({ message: 'Invalid student_id format. Use alphanumeric and hyphens only.' });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({ message: 'Phone number must be 10-11 digits.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if student exists
    const [existing] = await db.query('SELECT student_id FROM students WHERE student_id = ?', [student_id]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Student ID already exists.' });
    }

    // Hash password and insert
    const password_hash = hashPassword(password);
    await db.query('INSERT INTO students (student_id, name, phone, password_hash) VALUES (?, ?, ?, ?)',
      [student_id, name.trim(), phone.replace(/\D/g, ''), password_hash]);

    return res.status(201).json({ message: 'Student account created successfully.' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error while registering student.' });
  }
};

// Student Login
const loginStudent = async (req, res) => {
  try {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
      return res.status(400).json({ message: 'student_id and password are required.' });
    }

    const [rows] = await db.query('SELECT student_id, name, phone, password_hash FROM students WHERE student_id = ?', [student_id]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid student id or password.' });
    }

    const student = rows[0];
    if (!verifyPassword(password, student.password_hash)) {
      return res.status(401).json({ message: 'Invalid student id or password.' });
    }

    return res.status(200).json({
      message: 'Login successful.',
      student: {
        student_id: student.student_id,
        name: student.name,
        phone: student.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required.' });
    }

    const [rows] = await db.query('SELECT id, username, password_hash FROM admin WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid admin username or password.' });
    }

    const admin = rows[0];
    if (!verifyPassword(password, admin.password_hash)) {
      return res.status(401).json({ message: 'Invalid admin username or password.' });
    }

    return res.status(200).json({
      message: 'Admin login successful.',
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
};

// Create Admin (for initialization - should be restricted in production)
const createAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Admin password must be at least 8 characters.' });
    }

    // Check if admin exists
    const [existing] = await db.query('SELECT id FROM admin WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Admin username already exists.' });
    }

    const password_hash = hashPassword(password);
    await db.query('INSERT INTO admin (username, password_hash, email) VALUES (?, ?, ?)',
      [username.trim(), password_hash, email || null]);

    return res.status(201).json({ message: 'Admin account created successfully.' });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ message: 'Server error while creating admin account.' });
  }
};

module.exports = { registerStudent, loginStudent, loginAdmin, createAdmin };