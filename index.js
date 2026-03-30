require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const billingRoutes = require('./routes/billing');
const {
  incidentsRouter, assetsRouter, locationsRouter,
  usersRouter, checklistsRouter, messagesRouter, dashboardRouter
} = require('./routes/api');

const { query } = require('./db');
const { authenticate } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// ─── Socket.io (Real-time messaging) ─────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://opspilot-claw-production.up.railway.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, tenant_id, first_name, last_name FROM users WHERE id = $1', [decoded.userId]);
    if (!result.rows.length) return next(new Error('User not found'));
    socket.user = result.rows[0];
    socket.tenantId = result.rows[0].tenant_id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Join tenant room (isolation)
  socket.join(`tenant:${socket.tenantId}`);

  socket.on('join-channel', (channelId) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { channelId, body } = data;
      if (!body?.trim()) return;

      const result = await query(`
        INSERT INTO messages (tenant_id, channel_id, sender_id, body)
        VALUES ($1, $2, $3, $4) RETURNING *
      `, [socket.tenantId, channelId, socket.user.id, body.trim()]);

      const message = {
        ...result.rows[0],
        sender_name: `${socket.user.first_name} ${socket.user.last_name}`
      };

      // Broadcast to everyone in the channel
      io.to(`channel:${channelId}`).emit('new-message', message);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {});
});

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://opspilot-claw-production.up.railway.app',
  credentials: true
}));

// Stripe webhook needs raw body — must come before express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts' } });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/incidents', incidentsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/billing', billingRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// ─── 404 + Error Handler ──────────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 OpsPilot API running on ${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'https://opspilot-claw-production.up.railway.app'}`);
  console.log(`✅ Ready\n`);
});

module.exports = { app, io };