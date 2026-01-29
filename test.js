// Simple test script for BLE Gateway Server
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_DEVICE_ID = '+61412345678';

async function runTests() {
  console.log('🧪 Testing BLE Gateway Server\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', health.data);

    // Test 2: Register device
    console.log('\n2️⃣ Registering device...');
    const register = await axios.post(`${BASE_URL}/api/devices/register`, {
      deviceId: TEST_DEVICE_ID,
      deviceName: 'Test Device'
    });
    console.log('✅ Device registered:', register.data);

    // Test 3: Submit BLE scan
    console.log('\n3️⃣ Submitting BLE scan...');
    const scan = await axios.post(`${BASE_URL}/api/ble/scan`, {
      deviceId: TEST_DEVICE_ID,
      beaconName: 'HotelGate',
      rssi: -65,
      timestamp: Date.now()
    });
    console.log('✅ BLE scan submitted:', scan.data);

    // Test 4: Get device status
    console.log('\n4️⃣ Getting device status...');
    const status = await axios.get(`${BASE_URL}/api/devices/${TEST_DEVICE_ID}/status`);
    console.log('✅ Device status:', status.data);

    // Test 5: Get all devices
    console.log('\n5️⃣ Getting all devices...');
    const devices = await axios.get(`${BASE_URL}/api/devices`);
    console.log('✅ All devices:', devices.data);

    // Test 6: Get BLE data
    console.log('\n6️⃣ Getting BLE data...');
    const bleData = await axios.get(`${BASE_URL}/api/ble/${TEST_DEVICE_ID}`);
    console.log('✅ BLE data:', bleData.data);

    console.log('\n✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
runTests();
