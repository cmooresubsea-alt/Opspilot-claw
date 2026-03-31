const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/opspilot.db' 
  : path.join(__dirname, '../opspilot.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeTables();
  }
});

// Convert PostgreSQL queries to SQLite
const query = async (text, params = []) => {
  return new Promise((resolve, reject) => {
    // Convert PostgreSQL $1, $2 syntax to SQLite ? syntax
    const sqliteQuery = text.replace(/\$(\d+)/g, '?');
    
    if (sqliteQuery.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sqliteQuery, params, (err, rows) => {
        if (err) {
          console.error('SQLite query error:', err);
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    } else {
      db.run(sqliteQuery, params, function(err) {
        if (err) {
          console.error('SQLite query error:', err);
          reject(err);
        } else {
          resolve({ 
            rows: [],
            rowCount: this.changes,
            insertId: this.lastID
          });
        }
      });
    }
  });
};

// Initialize tables
function initializeTables() {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Tasks table
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date DATETIME,
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Locations table
    `CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      type TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Assets table
    `CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      location_id INTEGER REFERENCES locations(id),
      name TEXT NOT NULL,
      asset_type TEXT,
      serial_number TEXT,
      status TEXT DEFAULT 'operational',
      last_maintenance DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Incidents table
    `CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      location_id INTEGER REFERENCES locations(id),
      asset_id INTEGER REFERENCES assets(id),
      title TEXT NOT NULL,
      description TEXT,
      severity TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      reported_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Messages table
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      sender_id INTEGER REFERENCES users(id),
      recipient_id INTEGER REFERENCES users(id),
      message TEXT NOT NULL,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];
  
  tables.forEach(tableSQL => {
    db.run(tableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  });
  
  console.log('✅ SQLite tables initialized');
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('SQLite database connection closed.');
    process.exit(0);
  });
});

module.exports = { query, db };