// Use SQLite if no DATABASE_URL is provided, otherwise use PostgreSQL
if (process.env.DATABASE_URL) {
  console.log('Using PostgreSQL database');
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  const query = async (text, params) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  };
  
  module.exports = { query, pool };
} else {
  console.log('Using SQLite database (fallback)');
  module.exports = require('./sqlite');
}