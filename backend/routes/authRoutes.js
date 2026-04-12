const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin, createAdmin } = require('../controllers/authController');

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/admin/login', loginAdmin);
router.post('/admin-create', createAdmin);

module.exports = router;
