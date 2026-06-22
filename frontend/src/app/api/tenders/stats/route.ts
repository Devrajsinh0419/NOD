import { NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    
    // Total count
    const totalRes = await pool.query('SELECT COUNT(*) FROM tenders');
    const total = parseInt(totalRes.rows[0].count, 10);
    
    // Relevant count
    const relevantRes = await pool.query(`
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
    `);
    const relevant = parseInt(relevantRes.rows[0].count, 10);
    
    // Unique ministries
    const ministriesRes = await pool.query(`
      SELECT COUNT(DISTINCT ministry) 
      FROM tenders 
      WHERE ministry IS NOT NULL AND ministry != 'N/A' AND ministry != ''
    `);
    const ministries = parseInt(ministriesRes.rows[0].count, 10);
    
    // Unique departments
    const deptsRes = await pool.query(`
      SELECT COUNT(DISTINCT department) 
      FROM tenders 
      WHERE department IS NOT NULL AND department != 'N/A' AND department != ''
    `);
    const depts = parseInt(deptsRes.rows[0].count, 10);

    // Tender Value Breakdown
    const valRes = await pool.query(`
      SELECT 
        COUNT(CASE WHEN CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) < 1500000 THEN 1 END) as under_15l,
        COUNT(CASE WHEN CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) BETWEEN 1500000 AND 5000000 THEN 1 END) as between_15l_50l,
        COUNT(CASE WHEN CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) > 5000000 THEN 1 END) as above_50l
      FROM tenders
    `);
    const breakdown = {
      under15L: parseInt(valRes.rows[0].under_15l || 0, 10),
      between15L50L: parseInt(valRes.rows[0].between_15l_50l || 0, 10),
      above50L: parseInt(valRes.rows[0].above_50l || 0, 10)
    };

    // State Distribution
    const stateRes = await pool.query(`
      SELECT COALESCE(state, 'National') as state_name, COUNT(*) as count 
      FROM tenders 
      GROUP BY COALESCE(state, 'National') 
      ORDER BY count DESC 
      LIMIT 5
    `);
    const stateDistribution = stateRes.rows.map(row => ({
      state: row.state_name,
      count: parseInt(row.count, 10)
    }));
    
    return NextResponse.json({
      success: true,
      stats: {
        totalTenders: total,
        relevantTenders: relevant,
        ministriesCount: ministries,
        departmentsCount: depts,
        valueBreakdown: breakdown,
        stateDistribution: stateDistribution
      }
    });
  } catch (error: any) {
    console.error('Error fetching tender stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tender stats: ' + error.message },
      { status: 500 }
    );
  }
}
