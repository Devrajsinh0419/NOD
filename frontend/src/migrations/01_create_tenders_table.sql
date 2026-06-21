-- Migration: Create Tenders Table
-- Created: 2026-06-20

CREATE TABLE IF NOT EXISTS tenders (
    id BIGINT PRIMARY KEY,
    bid_number VARCHAR(100) NOT NULL,
    title TEXT,
    ministry TEXT,
    department TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    source VARCHAR(50) DEFAULT 'GeM',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_tenders_bid_number ON tenders(bid_number);
CREATE INDEX IF NOT EXISTS idx_tenders_ministry ON tenders(ministry);
CREATE INDEX IF NOT EXISTS idx_tenders_department ON tenders(department);
CREATE INDEX IF NOT EXISTS idx_tenders_end_date ON tenders(end_date);
