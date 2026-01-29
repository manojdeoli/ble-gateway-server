# BLE Gateway Server

WebSocket and REST API server that bridges Android BLE scanners with web clients for real-time beacon tracking.

## Architecture

```
Android BLE Scanner → WebSocket/REST → Gateway Server → WebSocket → React Web App
```

## Features

- **WebSocket Server**: Real-time BLE event streaming
- **REST API**: Device registration and BLE data submission
- **RSSI Smoothing**: Moving average filter for stable readings
- **Zone Mapping**: Automatic beacon-to-zone translation
- **Multi-client Support**: Multiple devices and web clients simultaneously
- **Distance Calculation**: Approximate distance from RSSI

## Installation

```bash
npm install
```

## Configuration

Edit `.env` file:

```env
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://your-react-app.com
RSSI_SMOOTHING_WINDOW=5
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Documentation

### REST Endpoints

#### Register Device
```http
POST /api/devices/register
Content-Type: application/json

{
  "deviceId": "+61412345678",
  "deviceName": "Pixel 7"
}
```

#### Submit BLE Scan
```http
POST /api/ble/scan
Content-Type: application/json

{
  "deviceId": "+61412345678",
  "beaconName": "HotelGate",
  "rssi": -65,
  "timestamp": 1234567890
}
```

#### Get Device Status
```http
GET /api/devices/:deviceId/status
```

#### Get All Devices
```http
GET /api/devices
```

#### Get BLE Data
```http
GET /api/ble/:userId
```

### WebSocket Events

#### Client → Server

**Register Device (Android)**
```javascript
socket.emit('register_device', {
  deviceId: '+61412345678',
  deviceName: 'Pixel 7'
});
```

**Subscribe to User (Web Client)**
```javascript
socket.emit('subscribe', {
  userId: '+61412345678'
});
```

**Submit BLE Scan (Android)**
```javascript
socket.emit('ble_scan', {
  deviceId: '+61412345678',
  beaconName: 'HotelGate',
  rssi: -65,
  timestamp: Date.now()
});
```

#### Server → Client

**Registration Confirmation**
```javascript
socket.on('registered', (data) => {
  // { deviceId, status: 'success' }
});
```

**BLE Event (to Web Clients)**
```javascript
socket.on('ble_event', (data) => {
  // {
  //   userId: '+61412345678',
  //   beaconName: 'HotelGate',
  //   rssi: -65,
  //   zone: 'Hotel Entry Gate',
  //   distance: '2.5',
  //   timestamp: 1234567890
  // }
});
```

## Testing

### Test with cURL

```bash
# Register device
curl -X POST http://localhost:3001/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"+61412345678","deviceName":"Test Device"}'

# Submit BLE scan
curl -X POST http://localhost:3001/api/ble/scan \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"+61412345678","beaconName":"HotelGate","rssi":-65}'

# Get device status
curl http://localhost:3001/api/devices/+61412345678/status

# Health check
curl http://localhost:3001/health
```

### Test with WebSocket Client

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

// Web client subscribing
socket.emit('subscribe', { userId: '+61412345678' });

socket.on('ble_event', (data) => {
  console.log('BLE Event:', data);
});
```

## Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t ble-gateway-server .
docker run -p 3001:3001 --env-file .env ble-gateway-server
```

### Cloud Deployment

#### AWS EC2
1. Launch EC2 instance (t2.micro sufficient for testing)
2. Install Node.js
3. Clone repository
4. Run `npm install && npm start`
5. Configure security group to allow port 3001

#### Heroku
```bash
heroku create ble-gateway-server
git push heroku main
```

#### Azure App Service
```bash
az webapp up --name ble-gateway-server --runtime "NODE:18-lts"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:3000 |
| WS_PING_INTERVAL | WebSocket ping interval (ms) | 25000 |
| WS_PING_TIMEOUT | WebSocket timeout (ms) | 60000 |
| RSSI_SMOOTHING_WINDOW | RSSI smoothing window size | 5 |

## Zone Mapping

Beacon names are automatically mapped to zones:

| Beacon Name Contains | Zone |
|---------------------|------|
| Gate, Entry | Hotel Entry Gate |
| Kiosk, Lobby | Check-in Kiosk |
| Elevator, Lift | Elevator Lobby |
| Room, Door | Room 1337 |

## Monitoring

- Health check: `GET /health`
- Returns: Active devices, web clients, server status

## Security Considerations

- Add authentication for production
- Use HTTPS/WSS in production
- Implement rate limiting
- Validate all inputs
- Use environment variables for secrets

## License

MIT
