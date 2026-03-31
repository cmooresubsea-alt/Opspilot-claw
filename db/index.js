// Use SQLite if no DATABASE_URL is provided, otherwise use PostgreSQL
if (process.env.DATABASE_URL) {
  console.log('🔌 Using PostgreSQL database');
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Add connection timeouts to prevent hanging
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
    statement_timeout: 10000
  });
  
  // Test initial connection
  pool.on('connect', () => {
    console.log('✅ PostgreSQL connection established');
  });
  
  pool.on('error', (err) => {
    console.error('🚨 PostgreSQL connection error:', err);
  });
  
  const query = async (text, params) => {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`📊 Query executed in ${duration}ms`);
      return result;
    } catch (err) {
      console.error('🚨 Database query error:', err);
      throw err;
    }
  };
  
  module.exports = { query, pool };
} else {
  console.log('🗃️ Using SQLite database (fallback)');
  module.exports = require('./sqlite');
}