import { NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';

let cachedStats: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

export async function GET() {
  try {
    const now = Date.now();
    if (cachedStats && (now - lastCacheTime < CACHE_TTL)) {
      return NextResponse.json({
        success: true,
        stats: cachedStats,
        cached: true
      });
    }

    await initializeDatabase();
    
    // Execute all queries in parallel to optimize response time
    const [
      totalRes,
      relevantRes,
      ministriesRes,
      deptsRes,
      valRes,
      stateRes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tenders'),
      pool.query(`
        SELECT COUNT(*) FROM tenders 
        WHERE (
          title ILIKE '%cnc%' OR
          title ILIKE '%machining%' OR
          title ILIKE '%vertical machining centre%' OR
          title ILIKE '%milling%' OR
          title ILIKE '%lathe%' OR
          title ILIKE '%fabrication%' OR
          title ILIKE '%metal%' OR
          title ILIKE '%wood%' OR
          title ILIKE '%plywood%' OR
          title ILIKE '%interior%' OR
          title ILIKE '%furniture%'
        )
      `),
      pool.query(`
        SELECT COUNT(DISTINCT ministry) 
        FROM tenders 
        WHERE ministry IS NOT NULL AND ministry != 'N/A' AND ministry != ''
      `),
      pool.query(`
        SELECT COUNT(DISTINCT department) 
        FROM tenders 
        WHERE department IS NOT NULL AND department != 'N/A' AND department != ''
      `),
      pool.query(`
        SELECT 
          COUNT(CASE WHEN CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) < 1500000 THEN 1 END) as under_15l,
          COUNT(CASE WHEN CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) BETWEEN 1500000 AND 5000000 THEN 1 END) as between_15l_50l,
          COUNT(CASE WHEN CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) > 5000000 THEN 1 END) as above_50l
        FROM tenders
      `),
      pool.query(`
        SELECT COALESCE(state, 'National') as state_name, COUNT(*) as count 
        FROM tenders 
        GROUP BY COALESCE(state, 'National') 
        ORDER BY count DESC 
        LIMIT 5
      `)
    ]);

    const total = parseInt(totalRes.rows[0].count, 10);
    const relevant = parseInt(relevantRes.rows[0].count, 10);
    const ministries = parseInt(ministriesRes.rows[0].count, 10);
    const depts = parseInt(deptsRes.rows[0].count, 10);
    
    const breakdown = {
      under15L: parseInt(valRes.rows[0].under_15l || 0, 10),
      between15L50L: parseInt(valRes.rows[0].between_15l_50l || 0, 10),
      above50L: parseInt(valRes.rows[0].above_50l || 0, 10)
    };

    const stateDistribution = stateRes.rows.map(row => ({
      state: row.state_name,
      count: parseInt(row.count, 10)
    }));

    cachedStats = {
      totalTenders: total,
      relevantTenders: relevant,
      ministriesCount: ministries,
      departmentsCount: depts,
      valueBreakdown: breakdown,
      stateDistribution: stateDistribution
    };
    lastCacheTime = now;
    
    return NextResponse.json({
      success: true,
      stats: cachedStats,
      cached: false
    });
  } catch (error: any) {
    console.error('Error fetching tender stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tender stats: ' + error.message },
      { status: 500 }
    );
  }
}
