require('dotenv').config(); // load .env variables FIRST before anything else
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
// We use http.createServer (not just app.listen) because
// Socket.io needs to attach to the raw HTTP server
const server = http.createServer(app);

// ─── Socket.io Setup ──────────────────────────────────────────
// Will be configured fully in the messaging sprint
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in other files via app
app.set('io', io);

// Basic socket connection log
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Then start listening for requests
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();