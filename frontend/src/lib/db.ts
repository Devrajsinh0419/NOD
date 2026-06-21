import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'nightowl',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create tenders table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenders (
        id BIGINT PRIMARY KEY,
        bid_number VARCHAR(100),
        title TEXT,
        ministry TEXT,
        department TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        source VARCHAR(50) DEFAULT 'GeM',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create an index on search fields for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_search 
      ON tenders (title, ministry, department);
    `);
    
    console.log('PostgreSQL Database initialized successfully (tenders table exists).');
  } catch (error) {
    console.error('Error initializing PostgreSQL Database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
