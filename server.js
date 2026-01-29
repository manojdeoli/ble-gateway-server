require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: parseInt(process.env.WS_PING_INTERVAL) || 25000,
  pingTimeout: parseInt(process.env.WS_PING_TIMEOUT) || 60000
});

// In-memory storage (replace with database in production)
const devices = new Map(); // deviceId -> { socketId, lastSeen, status }
const webClients = new Map(); // socketId -> { userId, type: 'web' }
const bleData = new Map(); // userId -> { beacons: [], lastUpdate }

// Import modules
const bleProcessor = require('./bleProcessor');
const apiRoutes = require('./routes/api');

// Use API routes
app.use('/api', apiRoutes(devices, bleData, io));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    devices: devices.size,
    webClients: webClients.size,
    timestamp: new Date().toISOString()
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  // Device registration (Android BLE Scanner)
  socket.on('register_device', (data) => {
    const { deviceId, deviceName } = data;
    devices.set(deviceId, {
      socketId: socket.id,
      deviceName,
      lastSeen: Date.now(),
      status: 'online'
    });
    console.log(`[Device] Registered: ${deviceId} (${deviceName})`);
    socket.emit('registered', { deviceId, status: 'success' });
  });

  // Web client subscription (React App)
  socket.on('subscribe', (data) => {
    const { userId } = data;
    webClients.set(socket.id, { userId, type: 'web' });
    console.log(`[Web Client] Subscribed to user: ${userId}`);
    
    // Send current BLE data if available
    if (bleData.has(userId)) {
      socket.emit('ble_event', bleData.get(userId));
    }
  });

  // BLE scan result from Android device
  socket.on('ble_scan', (data) => {
    const { deviceId, beaconName, rssi, timestamp } = data;
    
    // Update device last seen
    if (devices.has(deviceId)) {
      const device = devices.get(deviceId);
      device.lastSeen = Date.now();
      devices.set(deviceId, device);
    }

    // Process BLE data
    const processedData = bleProcessor.processScan({
      userId: deviceId,
      beaconName,
      rssi,
      timestamp
    });

    // Store processed data
    bleData.set(deviceId, processedData);

    // Broadcast to subscribed web clients
    webClients.forEach((client, clientSocketId) => {
      if (client.userId === deviceId) {
        io.to(clientSocketId).emit('ble_event', processedData);
      }
    });

    console.log(`[BLE] ${deviceId} detected ${beaconName} (RSSI: ${rssi})`);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    // Remove from devices
    for (const [deviceId, device] of devices.entries()) {
      if (device.socketId === socket.id) {
        devices.delete(deviceId);
        console.log(`[Device] Disconnected: ${deviceId}`);
        break;
      }
    }
    
    // Remove from web clients
    if (webClients.has(socket.id)) {
      const client = webClients.get(socket.id);
      console.log(`[Web Client] Disconnected: ${client.userId}`);
      webClients.delete(socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 BLE Gateway Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🌐 REST API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});
