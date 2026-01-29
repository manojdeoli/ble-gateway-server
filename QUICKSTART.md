# Quick Start Guide

## 1. Start the Server

```bash
npm start
```

You should see:
```
🚀 BLE Gateway Server running on port 3001
📡 WebSocket endpoint: ws://localhost:3001
🌐 REST API: http://localhost:3001/api
💚 Health check: http://localhost:3001/health
```

## 2. Test the Server

Open a new terminal and run:

```bash
node test.js
```

This will test all REST API endpoints.

## 3. Test WebSocket Connection

Open your browser console and paste:

```javascript
const socket = io('http://localhost:3001');

// Subscribe to user events
socket.emit('subscribe', { userId: '+61412345678' });

// Listen for BLE events
socket.on('ble_event', (data) => {
  console.log('BLE Event received:', data);
});

// Simulate BLE scan
socket.emit('ble_scan', {
  deviceId: '+61412345678',
  beaconName: 'HotelGate',
  rssi: -65,
  timestamp: Date.now()
});
```

## 4. Test with cURL

```bash
# Health check
curl http://localhost:3001/health

# Register device
curl -X POST http://localhost:3001/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"+61412345678","deviceName":"Test Phone"}'

# Submit BLE scan
curl -X POST http://localhost:3001/api/ble/scan \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"+61412345678","beaconName":"HotelGate","rssi":-65}'

# Get device status
curl http://localhost:3001/api/devices/+61412345678/status
```

## 5. Monitor Server Logs

The server will log all activities:
- Device registrations
- BLE scan submissions
- WebSocket connections/disconnections
- Processed BLE data

## Next Steps

1. **Deploy to Cloud**: Follow deployment instructions in README.md
2. **Update React App**: Connect to this gateway server
3. **Build Android Scanner**: Create BLE scanner app that connects to this server

## Troubleshooting

### Port already in use
Change PORT in `.env` file:
```
PORT=3002
```

### CORS errors
Add your React app URL to `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.15:3000
```

### WebSocket connection fails
Check firewall settings and ensure port 3001 is open.
