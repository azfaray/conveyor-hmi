// File: conveyor-hmi/scripts/db-init.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'local_history.db');
const db = new Database(dbPath);

console.log(`🔨 Creating Database at: ${dbPath}`);

const schema = `
  CREATE TABLE IF NOT EXISTS sensor_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- 1. SYSTEM MODE (Stores 'mode/manual': 1=Manual, 0=Auto)
    system_mode INTEGER DEFAULT 0,

    -- 2. SENSORS
    ir_sensor INTEGER DEFAULT 0,
    inductive_sensor INTEGER DEFAULT 0,
    capacitive_sensor INTEGER DEFAULT 0,
    pos_inner INTEGER DEFAULT 0,
    pos_outer INTEGER DEFAULT 0,
    
    -- 3. COUNTERS
    count_inner INTEGER DEFAULT 0,
    count_outer INTEGER DEFAULT 0,

    -- 4. STEPPER STATUS
    stepper_inner_running INTEGER DEFAULT 0,
    stepper_outer_running INTEGER DEFAULT 0,
    stepper_speed_level INTEGER DEFAULT 0,

    -- 5. ACTUATORS (DL / LA1)
    dl_push INTEGER DEFAULT 0,
    dl_pull INTEGER DEFAULT 0,

    -- 6. ACTUATORS (LD / LA2)
    ld_push INTEGER DEFAULT 0,
    ld_pull INTEGER DEFAULT 0
  );
`;

db.exec(schema);
console.log("✅ Offline Database initialized successfully!");