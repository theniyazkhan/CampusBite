// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Initialize the app
const app = express();

// Middleware
app.use(cors()); // Allows your Vue frontend to talk to this backend
app.use(express.json()); // Allows the server to accept JSON data in requests

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
const upload = multer({ storage: storage });

// Serve static files from uploads
app.use('/uploads', express.static('uploads'));

// Import Routes
const menuRoutes = require('./routes/menu');

// Use Routes
// Every route inside menuRoutes will now start with /api/menu
app.use('/api/menu', menuRoutes);

// New student auth route
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// New orders route
const ordersRoutes = require('./routes/ordersRoutes');
app.use('/api/orders', ordersRoutes);

// Set the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`CampusBite Backend Server is running on http://localhost:${PORT}`);
});