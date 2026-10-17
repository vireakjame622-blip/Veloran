/**
 * ============================================================================
 * 🌐 VELORAN Netlify Serverless API Function
 * ============================================================================
 * Handles /api/health, /api/preorder, /api/preorders, /api/guardian/alarm,
 * /api/guardian/logs, and /api/guardian/telemetry on Netlify edge.
 */

// In-memory state for serverless execution
let serverlessTelemetry = {
  imu: { pitch: 0.2, roll: -0.1, yaw: 184.2 },
  gForce: 1.02,
  speed: 74,
  battery: 94,
  gps: { lat: 11.5564, lng: 104.9282, location: "CADT Innovation Hub, Phnom Penh" },
  isArmed: true,
  alarmStatus: "SAFE",
  sirenActive: false,
  updatedAt: new Date().toISOString()
};

let serverlessLogs = [
  { id: 1, time: "00:00:01", msg: "VELORAN Guardian™ Cloud Security Subsystem Online.", type: "info" },
  { id: 2, time: "00:00:02", msg: "IMU 6-Axis Gyro calibrated: Baseline 1.02G.", type: "info" },
  { id: 3, time: "00:00:03", msg: "GPS Geofence established at CADT Innovation Campus.", type: "info" },
  { id: 4, time: "00:00:04", msg: "Anti-Theft Guardian Mode: ARMED. High-G Accelerometer Ready.", type: "warn" }
];

let serverlessPreorders = [
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
];

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ message: "OK" }) };
  }

  // Parse path: /api/something or /.netlify/functions/api/something
  const fullPath = event.path || "";
  const subPath = fullPath.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
  const method = event.httpMethod;

  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = {};
    }
  }

  // 1. GET /api/health
  if (subPath === "/health" || subPath === "") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "online",
        system: "VELORAN Cybernetic Helmet IoT Core (Serverless Netlify)",
        version: "2.4.0",
        timestamp: new Date().toISOString(),
        hardware: {
          connected: true,
          serialNumber: "VEL-HELMET-009-ALPHA",
          firmware: "v4.1.2-OTA-ARMED",
          batteryPercent: serverlessTelemetry.battery,
          guardianStatus: serverlessTelemetry.isArmed ? "ARMED" : "DISARMED"
        }
      })
    };
  }

  // 2. POST /api/preorder
  if (subPath === "/preorder" && method === "POST") {
    const { name, email, finish, size, region, notes } = body;
    if (!name || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: "Name and email are required." })
      };
    }

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

    serverlessPreorders.push(newPreorder);

    const logTime = new Date().toTimeString().split(' ')[0];
    serverlessLogs.push({
      id: serverlessLogs.length + 1,
      time: logTime,
      msg: `New Reservation [${reservationId}] registered for ${newPreorder.customerName} (${newPreorder.finish.toUpperCase()}, Size ${newPreorder.size}).`,
      type: "info"
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Pre-order reservation confirmed successfully!",
        reservation: newPreorder
      })
    };
  }

  // 3. GET /api/preorders
  if (subPath === "/preorders" && method === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        totalReservations: serverlessPreorders.length,
        preorders: serverlessPreorders
      })
    };
  }

  // 4. POST /api/guardian/alarm
  if (subPath === "/guardian/alarm" && method === "POST") {
    const { event: alarmEv, source } = body;
    const timeStr = new Date().toTimeString().split(' ')[0];
    let logMsg = "";
    let logType = "info";

    if (alarmEv === "theft") {
      serverlessTelemetry.alarmStatus = "THEFT_TRIGGERED";
      serverlessTelemetry.sirenActive = true;
      serverlessTelemetry.gForce = 3.45;
      logMsg = `🚨 TAMPER DETECTED! Unauthorized helmet movement. 110dB Piezo siren active.`;
      logType = "alert";
    } else if (alarmEv === "crash") {
      serverlessTelemetry.alarmStatus = "CRASH_SOS_TRIGGERED";
      serverlessTelemetry.sirenActive = true;
      serverlessTelemetry.gForce = 28.4;
      logMsg = `💥 CRASH SOS! 28.4G impact registered. Autonomous eCall broadcast initialized.`;
      logType = "alert";
    } else if (alarmEv === "silence") {
      serverlessTelemetry.alarmStatus = "SAFE";
      serverlessTelemetry.sirenActive = false;
      serverlessTelemetry.gForce = 1.02;
      logMsg = `🔕 Alarm silenced and telemetry reset to baseline standby.`;
      logType = "info";
    } else if (alarmEv === "arm") {
      serverlessTelemetry.isArmed = true;
      serverlessTelemetry.alarmStatus = "SAFE";
      logMsg = `🛡️ Guardian System ARMED by ${source || 'operator'}. Motion monitoring active.`;
      logType = "warn";
    } else if (alarmEv === "disarm") {
      serverlessTelemetry.isArmed = false;
      serverlessTelemetry.alarmStatus = "DISARMED";
      serverlessTelemetry.sirenActive = false;
      logMsg = `🔓 Guardian System DISARMED by ${source || 'operator'}.`;
      logType = "info";
    }

    serverlessTelemetry.updatedAt = new Date().toISOString();

    const newLog = {
      id: serverlessLogs.length + 1,
      time: timeStr,
      msg: logMsg,
      type: logType
    };

    serverlessLogs.push(newLog);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        telemetry: serverlessTelemetry,
        newLog
      })
    };
  }

  // 5. GET /api/guardian/logs
  if (subPath === "/guardian/logs" && method === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        totalLogs: serverlessLogs.length,
        logs: serverlessLogs.slice(-30)
      })
    };
  }

  // 6. GET /api/guardian/telemetry
  if (subPath === "/guardian/telemetry") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        telemetry: serverlessTelemetry
      })
    };
  }

  // Default fallback
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: `Route ${subPath} not found.` })
  };
};
