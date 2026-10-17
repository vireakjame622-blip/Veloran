/**
 * ============================================================================
 * 🏍️ VELORAN Cybernetic Smart Helmet - Full-Stack Express Server & IoT Backend
 * ============================================================================
 * Provides RESTful telemetry, Guardian™ security alarm logging, pre-order reservation
 * management, and static asset streaming.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// ============================================================================
// 📁 File Database & Storage Engine (data/db.json)
// ============================================================================
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DB = {
  telemetry: {
    imu: { pitch: 0.2, roll: -0.1, yaw: 184.2 },
    gForce: 1.02,
    speed: 74,
    battery: 94,
    gps: { lat: 11.5564, lng: 104.9282, location: "CADT Innovation Hub, Phnom Penh" },
    isArmed: true,
    alarmStatus: "SAFE",
    sirenActive: false,
    updatedAt: new Date().toISOString()
  },
  logs: [
    { id: 1, time: "00:00:01", msg: "VELORAN Guardian™ Cloud Security Subsystem Online.", type: "info" },
    { id: 2, time: "00:00:02", msg: "IMU 6-Axis Gyro calibrated: Baseline 1.02G.", type: "info" },
    { id: 3, time: "00:00:03", msg: "GPS Geofence established at CADT Innovation Campus.", type: "info" },
    { id: 4, time: "00:00:04", msg: "Anti-Theft Guardian Mode: ARMED. High-G Accelerometer Ready.", type: "warn" }
  ],
  preorders: [
    {
      id: "VEL-2026-0001",
      customerName: "Alex Vance",
      email: "alex.vance@veloran-riders.com",
      finish: "carbon",
      size: "L",
      region: "Cambodia / Southeast Asia",
      notes: "Early access test rider",
      createdAt: "2026-10-15T08:30:00.000Z",
      status: "CONFIRMED"
    }
  ],
  inquiries: []
};

// Initialize DB file
function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf8');
      return JSON.parse(JSON.stringify(INITIAL_DB));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Database read error, falling back to memory:", err);
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }
}

function saveDatabase(db) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Database write error:", err);
  }
}

let db = loadDatabase();

// ============================================================================
// 📡 REST API ENDPOINTS
// ============================================================================

/**
 * Health check & hardware connection status
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    system: "VELORAN Cybernetic Helmet IoT Core",
    version: "2.4.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    hardware: {
      connected: true,
      serialNumber: "VEL-HELMET-009-ALPHA",
      firmware: "v4.1.2-OTA-ARMED",
      batteryPercent: db.telemetry.battery,
      guardianStatus: db.telemetry.isArmed ? "ARMED" : "DISARMED"
    }
  });
});

/**
 * Pre-Order Reservation API
 * POST /api/preorder
 */
app.post('/api/preorder', (req, res) => {
  const { name, email, finish, size, region, notes } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: "Name and email are required to reserve a helmet."
    });
  }

  // Generate unique reservation ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reservationId = `VEL-2026-${randomSuffix}`;

  const newPreorder = {
    id: reservationId,
    customerName: name.trim(),
    email: email.trim(),
    finish: finish || "veloran",
    size: size || "M",
    region: region || "Global / Express Air",
    notes: notes ? notes.trim() : "",
    createdAt: new Date().toISOString(),
    status: "CONFIRMED",
    batch: "Alpha Wave #1",
    estimatedDispatch: "Q1 2027 (Phnom Penh CADT Hub)"
  };

  db.preorders.push(newPreorder);

  // Add notification to security logs
  const logTime = new Date().toTimeString().split(' ')[0];
  db.logs.push({
    id: db.logs.length + 1,
    time: logTime,
    msg: `New Reservation [${reservationId}] registered for ${newPreorder.customerName} (${newPreorder.finish.toUpperCase()}, Size ${newPreorder.size}).`,
    type: "info"
  });

  saveDatabase(db);

  res.status(201).json({
    success: true,
    message: "Pre-order reservation confirmed successfully!",
    reservation: newPreorder
  });
});

/**
 * Retrieve all pre-orders (Admin / Inventory inspect)
 * GET /api/preorders
 */
app.get('/api/preorders', (req, res) => {
  res.json({
    success: true,
    totalReservations: db.preorders.length,
    preorders: db.preorders
  });
});

/**
 * Guardian™ Security Alarm Control & Trigger
 * POST /api/guardian/alarm
 */
app.post('/api/guardian/alarm', (req, res) => {
  const { event, source } = req.body;
  const timeStr = new Date().toTimeString().split(' ')[0];

  let logMsg = "";
  let logType = "info";

  if (event === "theft") {
    db.telemetry.alarmStatus = "THEFT_TRIGGERED";
    db.telemetry.sirenActive = true;
    db.telemetry.gForce = 3.45;
    logMsg = `🚨 TAMPER DETECTED! Unauthorized helmet movement. 110dB Piezo siren active.`;
    logType = "alert";
  } else if (event === "crash") {
    db.telemetry.alarmStatus = "CRASH_SOS_TRIGGERED";
    db.telemetry.sirenActive = true;
    db.telemetry.gForce = 28.4;
    logMsg = `💥 CRASH SOS! 28.4G impact registered. Autonomous eCall broadcast initialized.`;
    logType = "alert";
  } else if (event === "silence") {
    db.telemetry.alarmStatus = "SAFE";
    db.telemetry.sirenActive = false;
    db.telemetry.gForce = 1.02;
    logMsg = `🔕 Alarm silenced and telemetry reset to baseline standby.`;
    logType = "info";
  } else if (event === "arm") {
    db.telemetry.isArmed = true;
    db.telemetry.alarmStatus = "SAFE";
    logMsg = `🛡️ Guardian System ARMED by ${source || 'operator'}. Motion monitoring active.`;
    logType = "warn";
  } else if (event === "disarm") {
    db.telemetry.isArmed = false;
    db.telemetry.alarmStatus = "DISARMED";
    db.telemetry.sirenActive = false;
    logMsg = `🔓 Guardian System DISARMED by ${source || 'operator'}.`;
    logType = "info";
  } else {
    return res.status(400).json({ success: false, error: "Invalid alarm event type." });
  }

  db.telemetry.updatedAt = new Date().toISOString();

  const newLog = {
    id: db.logs.length + 1,
    time: timeStr,
    msg: logMsg,
    type: logType
  };

  db.logs.push(newLog);
  if (db.logs.length > 100) db.logs.shift(); // Keep last 100 logs
  saveDatabase(db);

  res.json({
    success: true,
    telemetry: db.telemetry,
    newLog: newLog
  });
});

/**
 * Retrieve Guardian™ Security Logs
 * GET /api/guardian/logs
 */
app.get('/api/guardian/logs', (req, res) => {
  res.json({
    success: true,
    totalLogs: db.logs.length,
    logs: db.logs.slice(-30) // Return last 30 logs
  });
});

/**
 * Get Live Helmet Telemetry
 * GET /api/guardian/telemetry
 */
app.get('/api/guardian/telemetry', (req, res) => {
  res.json({
    success: true,
    telemetry: db.telemetry
  });
});

/**
 * Update Helmet Telemetry from device / simulator
 * POST /api/guardian/telemetry
 */
app.post('/api/guardian/telemetry', (req, res) => {
  const { gForce, speed, battery, pitch, roll, yaw } = req.body;

  if (gForce !== undefined) db.telemetry.gForce = parseFloat(gForce);
  if (speed !== undefined) db.telemetry.speed = parseFloat(speed);
  if (battery !== undefined) db.telemetry.battery = parseInt(battery, 10);
  if (pitch !== undefined) db.telemetry.imu.pitch = parseFloat(pitch);
  if (roll !== undefined) db.telemetry.imu.roll = parseFloat(roll);
  if (yaw !== undefined) db.telemetry.imu.yaw = parseFloat(yaw);

  db.telemetry.updatedAt = new Date().toISOString();
  saveDatabase(db);

  res.json({
    success: true,
    telemetry: db.telemetry
  });
});

/**
 * Rider Contact & Inquiries API
 * POST /api/contact
 */
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }

  const newInquiry = {
    id: `INQ-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  db.inquiries.push(newInquiry);
  saveDatabase(db);

  res.status(201).json({
    success: true,
    message: "Thank you for reaching out! A Veloran engineer will contact you shortly."
  });
});

// Clean routes for modular pages
const modularPages = ['innovations', 'rider-lab', 'gallery', 'alarm', 'specs'];
modularPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${page}.html`));
  });
});

// Fallback to index.html for root navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 VELORAN Full-Stack Server Running on: http://localhost:${PORT}`);
  console.log(`📡 REST API Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🛡️ Guardian Telemetry API: http://localhost:${PORT}/api/guardian/telemetry`);
  console.log(`🛒 Pre-Orders API: http://localhost:${PORT}/api/preorders`);
  console.log(`================================================================`);
});
