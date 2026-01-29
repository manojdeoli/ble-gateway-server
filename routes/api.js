const express = require('express');

module.exports = (devices, bleData, io) => {
  const router = express.Router();

  // Register device (REST alternative to WebSocket)
  router.post('/devices/register', (req, res) => {
    const { deviceId, deviceName } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    devices.set(deviceId, {
      socketId: null,
      deviceName: deviceName || 'Unknown',
      lastSeen: Date.now(),
      status: 'registered'
    });

    console.log(`[REST] Device registered: ${deviceId}`);
    res.json({ status: 'success', deviceId });
  });

  // Submit BLE scan result (REST alternative to WebSocket)
  router.post('/ble/scan', (req, res) => {
    const { deviceId, beaconName, rssi, timestamp } = req.body;

    if (!deviceId || !beaconName || rssi === undefined) {
      return res.status(400).json({ error: 'deviceId, beaconName, and rssi are required' });
    }

    // Update device last seen
    if (devices.has(deviceId)) {
      const device = devices.get(deviceId);
      device.lastSeen = Date.now();
      devices.set(deviceId, device);
    }

    // Process and store BLE data
    const bleProcessor = require('../bleProcessor');
    const processedData = bleProcessor.processScan({
      userId: deviceId,
      beaconName,
      rssi,
      timestamp: timestamp || Date.now()
    });

    bleData.set(deviceId, processedData);

    // Broadcast to web clients via WebSocket
    io.emit('ble_event', processedData);

    console.log(`[REST] BLE scan: ${deviceId} -> ${beaconName} (${rssi})`);
    res.json({ status: 'received', data: processedData });
  });

  // Get device status
  router.get('/devices/:deviceId/status', (req, res) => {
    const { deviceId } = req.params;
    
    if (!devices.has(deviceId)) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const device = devices.get(deviceId);
    const isOnline = (Date.now() - device.lastSeen) < 30000; // 30 seconds timeout

    res.json({
      deviceId,
      deviceName: device.deviceName,
      status: isOnline ? 'online' : 'offline',
      lastSeen: new Date(device.lastSeen).toISOString()
    });
  });

  // Get all devices
  router.get('/devices', (req, res) => {
    const deviceList = Array.from(devices.entries()).map(([deviceId, device]) => ({
      deviceId,
      deviceName: device.deviceName,
      status: device.status,
      lastSeen: new Date(device.lastSeen).toISOString()
    }));

    res.json({ devices: deviceList, count: deviceList.length });
  });

  // Get BLE data for user
  router.get('/ble/:userId', (req, res) => {
    const { userId } = req.params;
    
    if (!bleData.has(userId)) {
      return res.status(404).json({ error: 'No BLE data found for this user' });
    }

    res.json(bleData.get(userId));
  });

  // Clear BLE data for user
  router.delete('/ble/:userId', (req, res) => {
    const { userId } = req.params;
    
    if (bleData.has(userId)) {
      bleData.delete(userId);
      const bleProcessor = require('../bleProcessor');
      bleProcessor.clearHistory(userId);
      res.json({ status: 'cleared', userId });
    } else {
      res.status(404).json({ error: 'No data found for this user' });
    }
  });

  return router;
};
