require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const i18n = require('./config/i18n');

// Import routes
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const seedAdmin = require('./utils/seeder');
const startScheduler = require('./utils/scheduler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(i18n.init);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedAdmin(); // Run admin seeder
    startScheduler(io); // Start scheduled publication worker
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO for real-time notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic health check
app.get('/', (req, res) => {
  res.json({
    message: 'NewsHub API is running',
    status: 'healthy',
    documentation: '/api/docs (coming soon)'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
