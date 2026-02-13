/**
 * core-dependency-imports
 * Aggregation of third-party libraries and internal modules required for server operation.
 * - express: Web framework for handling HTTP requests.
 * - mongoose: ODM for MongoDB interactions.
 * - socket.io: Real-time event-based communication engine.
 * - internal utilities: Custom schedulers and seeders for application lifecycle management.
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const i18n = require('./config/i18n');

/**
 * route-handler-imports
 * Modularized route definitions separating concerns by domain entities.
 * Each route module acts as a sub-application for specific feature sets (Auth, Articles, Users).
 */
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const seedAdmin = require('./utils/seeder');
const startScheduler = require('./utils/scheduler');

/**
 * server-initialization
 * Instantiation of the Express application and the Node.js HTTP server.
 * Configures the Socket.IO instance with CORS policies to allow cross-origin requests from the client.
 */
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

/**
 * middleware-pipeline-configuration
 * systematic registration of global middleware functions.
 * - CORS: Enables restricted resource sharing.
 * - Body Parsers: Configures JSON and URL-encoded payload handling with size limits.
 * - i18n: Initializes internationalization context for localized responses.
 * - IO Injection: Attaches the Socket.IO instance to the request object for controller-level access.
 */
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(i18n.init);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'client', 'build')));

app.use((req, res, next) => {
  req.io = io;
  next();
});

/**
 * database-connection-bootstrap
 * Establishes an asynchronous connection to the MongoDB cluster.
 * Upon success, initializes the administrative user and starts the background task scheduler.
 */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedAdmin(); // Run admin seeder
    startScheduler(io); // Start scheduled publication worker
  })
  .catch(err => console.error('MongoDB connection error:', err));

/**
 * websocket-event-handler
 * Manages real-time persistent connections.
 * Implements room-based isolation to target notifications to specific authenticated users.
 */
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

/**
 * api-routing-layer
 * Delegates HTTP requests to specific router modules based on the path prefix.
 * Serves as the central traffic director for the REST API.
 */
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

/**
 * global-safety-net
 * Captures unhandled promise rejections and uncaught exceptions to prevent undefined system state.
 * Performs a graceful shutdown of the server to ensure resources are released correctly before exit.
 */
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
