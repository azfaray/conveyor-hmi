// File: conveyor-hmi/scripts/mqtt-logger.js
const mqtt = require('mqtt');
const Database = require('better-sqlite3');
const path = require('path');

const BROKER_URL = 'ws://localhost:8888'; 
const DB_PATH = path.join(__dirname, '..', 'local_history.db');

const client = mqtt.connect(BROKER_URL);
const db = new Database(DB_PATH);

// --- 1. MEMORY STATE (The Fix) ---
// This remembers the last known value for everything.
const CURRENT_STATE = {
    system_mode: 0,
    ir_sensor: 0,
    inductive_sensor: 0,
    capacitive_sensor: 0,
    pos_inner: 0,
    pos_outer: 0,
    count_inner: 0,
    count_outer: 0,
    stepper_inner_running: 0,
    stepper_outer_running: 0,
    stepper_speed_level: 0,
    dl_push: 0,
    dl_pull: 0,
    ld_push: 0,
    ld_pull: 0
};

// De-duplication cache
const lastLogs = {}; 

console.log(`🔌 Logger connecting to ${BROKER_URL}...`);

const TOPIC_COLUMNS = {
    'ITB/IIOT/conveyor/mode/manual': 'system_mode',

    // Sensors
    'ITB/IIOT/conveyor/sensor/ir/state': 'ir_sensor',
    'ITB/IIOT/conveyor/sensor/inductive/state': 'inductive_sensor',
    'ITB/IIOT/conveyor/sensor/capacitive/state': 'capacitive_sensor',
    'ITB/IIOT/conveyor/sensor/position_inner/state': 'pos_inner',
    'ITB/IIOT/conveyor/sensor/position_outer/state': 'pos_outer',
    'ITB/IIOT/conveyor/sensor/object_inner/state': 'count_inner',
    'ITB/IIOT/conveyor/sensor/object_outer/state': 'count_outer',

    // Steppers
    'ITB/IIOT/conveyor/actuator/stepper/inner': 'stepper_inner_running',
    'ITB/IIOT/conveyor/feedback/actuator/stepper/inner': 'stepper_inner_running',
    'ITB/IIOT/conveyor/actuator/stepper/outer': 'stepper_outer_running',
    'ITB/IIOT/conveyor/feedback/actuator/stepper/outer': 'stepper_outer_running',
    'ITB/IIOT/conveyor/actuator/stepper/speed': 'stepper_speed_level',

    // Pistons
    'ITB/IIOT/conveyor/actuator/DL/push': 'dl_push',
    'ITB/IIOT/conveyor/feedback/actuator/DL/push': 'dl_push',
    'ITB/IIOT/conveyor/actuator/DL/pull': 'dl_pull',
    'ITB/IIOT/conveyor/feedback/actuator/DL/pull': 'dl_pull',
    'ITB/IIOT/conveyor/actuator/LD/push': 'ld_push',
    'ITB/IIOT/conveyor/feedback/actuator/LD/push': 'ld_push',
    'ITB/IIOT/conveyor/actuator/LD/pull': 'ld_pull',
    'ITB/IIOT/conveyor/feedback/actuator/LD/pull': 'ld_pull'
};

client.on('connect', () => {
    console.log('✅ Connected! Listening...');
    Object.keys(TOPIC_COLUMNS).forEach(topic => client.subscribe(topic));
});

client.on('message', (topic, message) => {
    const column = TOPIC_COLUMNS[topic];
    if (column) {
        try {
            const msgString = message.toString();
            let val;

            // --- PARSING ---
            try {
                const payload = JSON.parse(msgString);
                if (payload.state !== undefined) val = payload.state;
                else if (payload.value !== undefined) val = payload.value;
                else if (typeof payload === 'number') val = payload;
                else {
                    const keys = Object.keys(payload);
                    if (keys.length > 0) {
                        const firstVal = payload[keys[0]];
                        if (Array.isArray(firstVal) && firstVal.length > 0) val = firstVal[0];
                        else val = firstVal;
                    }
                }
            } catch (e) {
                val = msgString;
            }

            // --- NORMALIZE ---
            if (val === true || val === 'true') val = 1;
            if (val === false || val === 'false') val = 0;
            if (val === undefined || val === null || typeof val === 'object') val = 0;
            else if (!isNaN(parseFloat(val))) val = parseFloat(val);

            // --- DUPLICATE CHECK ---
            const now = Date.now();
            const lastLog = lastLogs[column];
            if (lastLog && lastLog.value === val && (now - lastLog.time < 500)) return;
            lastLogs[column] = { value: val, time: now };

            // --- 2. UPDATE MEMORY STATE ---
            // Update the global state with the new value
            CURRENT_STATE[column] = val;

            // --- 3. INSERT FULL STATE ROW ---
            // Instead of inserting just one column, we insert the WHOLE state.
            // This ensures that if we update speed, 'running' stays 1 (from memory).
            const columns = Object.keys(CURRENT_STATE).join(', ');
            const placeholders = Object.keys(CURRENT_STATE).map(() => '?').join(', ');
            const values = Object.values(CURRENT_STATE);

            const stmt = db.prepare(`INSERT INTO sensor_logs (${columns}) VALUES (${placeholders})`);
            stmt.run(...values);
            
            console.log(`📝 Logged ${column}: ${val} (Full State Saved)`);

        } catch (err) {
            console.error(`❌ Error on ${topic}:`, err.message);
        }
    }
});