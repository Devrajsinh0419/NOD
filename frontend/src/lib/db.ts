import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'nightowl',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
);

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) return;

  const client = await pool.connect();
  try {
    // Fast path: Check if table exists and has all required columns
    try {
      await client.query('SELECT id, state, city, category, estimated_value, tender_url, document_urls, status, ministry FROM tenders LIMIT 1');
      console.log('PostgreSQL Database tenders table is already initialized and matches schema. Skipping updates.');
      isInitialized = true;
      return;
    } catch (checkErr) {
      console.log('Tenders table check failed or incomplete. Proceeding with database schema initialization...');
    }

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
        state VARCHAR(100),
        city VARCHAR(100),
        category VARCHAR(100),
        estimated_value VARCHAR(100),
        tender_url TEXT,
        document_urls TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Add columns dynamically in case table already exists
    await client.query(`
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS estimated_value VARCHAR(100);
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS tender_url TEXT;
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS document_urls TEXT;
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
      ALTER TABLE tenders ADD COLUMN IF NOT EXISTS ministry VARCHAR(200);
    `);

    // Create unique constraint to prevent duplicates
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tenders_source_bid_number ON tenders (source, bid_number);
    `);
    
    // Create indices for search, sorting, and filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tenders_search ON tenders (title, ministry, department);
      CREATE INDEX IF NOT EXISTS idx_tenders_state ON tenders (state);
      CREATE INDEX IF NOT EXISTS idx_tenders_source ON tenders (source);
      CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders (category);
      CREATE INDEX IF NOT EXISTS idx_tenders_end_date ON tenders (end_date);
      CREATE INDEX IF NOT EXISTS idx_tenders_estimated_value ON tenders (estimated_value);
    `);
    
    isInitialized = true;
    console.log('PostgreSQL Database initialized successfully (tenders table and indexes verified).');
  } catch (error) {
    console.error('Error initializing PostgreSQL Database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
