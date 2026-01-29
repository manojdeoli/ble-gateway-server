// BLE data processing logic
const rssiHistory = new Map(); // userId -> array of RSSI values

// Zone mapping based on beacon names
const ZONE_MAP = {
  'Gate': 'Hotel Entry Gate',
  'Entry': 'Hotel Entry Gate',
  'Kiosk': 'Check-in Kiosk',
  'Lobby': 'Check-in Kiosk',
  'Elevator': 'Elevator Lobby',
  'Lift': 'Elevator Lobby',
  'Room': 'Room 1337',
  'Door': 'Room 1337'
};

// RSSI smoothing using moving average
function smoothRSSI(userId, newRSSI) {
  const windowSize = parseInt(process.env.RSSI_SMOOTHING_WINDOW) || 5;
  
  if (!rssiHistory.has(userId)) {
    rssiHistory.set(userId, []);
  }
  
  const history = rssiHistory.get(userId);
  history.push(newRSSI);
  
  // Keep only last N values
  if (history.length > windowSize) {
    history.shift();
  }
  
  // Calculate average
  const sum = history.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / history.length);
}

// Map beacon name to zone
function mapBeaconToZone(beaconName) {
  for (const [key, zone] of Object.entries(ZONE_MAP)) {
    if (beaconName.includes(key)) {
      return zone;
    }
  }
  return 'Unknown Area';
}

// Calculate distance from RSSI (approximate)
function calculateDistance(rssi) {
  const txPower = -59; // Calibrated TX power at 1 meter
  if (rssi === 0) return -1;
  
  const ratio = rssi / txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio, 10);
  } else {
    return (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
  }
}

// Process BLE scan result
function processScan(data) {
  const { userId, beaconName, rssi, timestamp } = data;
  
  // Smooth RSSI
  const smoothedRSSI = smoothRSSI(userId, rssi);
  
  // Map to zone
  const zone = mapBeaconToZone(beaconName);
  
  // Calculate approximate distance
  const distance = calculateDistance(smoothedRSSI);
  
  return {
    userId,
    beaconName,
    rssi: smoothedRSSI,
    rawRSSI: rssi,
    zone,
    distance: distance.toFixed(2),
    timestamp: timestamp || Date.now(),
    processedAt: Date.now()
  };
}

// Clear history for user (call on disconnect)
function clearHistory(userId) {
  rssiHistory.delete(userId);
}

module.exports = {
  processScan,
  clearHistory,
  smoothRSSI,
  mapBeaconToZone,
  calculateDistance
};
