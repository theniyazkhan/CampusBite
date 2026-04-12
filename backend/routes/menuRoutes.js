const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
router.get('/', getMenu);
router.post('/', upload.single('image'), addMenuItem);
router.put('/:id', upload.single('image'), updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;