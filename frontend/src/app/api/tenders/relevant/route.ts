import { NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';
import { startTenderSyncCron } from '@/lib/cron';

const RELEVANT_CLAUSE = `
  AND (
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
`;

export async function GET(request: Request) {
  try {
    await initializeDatabase();
    startTenderSyncCron();
  } catch (dbErr) {
    console.error('API init db warning:', dbErr);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const ministry = searchParams.get('ministry') || '';

    const offset = (page - 1) * limit;

    let queryText = `SELECT * FROM tenders WHERE 1=1 ${RELEVANT_CLAUSE}`;
    let countQueryText = `SELECT COUNT(*) FROM tenders WHERE 1=1 ${RELEVANT_CLAUSE}`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR bid_number ILIKE $${paramIndex})`;
      countQueryText += ` AND (title ILIKE $${paramIndex} OR bid_number ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (department) {
      queryText += ` AND department ILIKE $${paramIndex}`;
      countQueryText += ` AND department ILIKE $${paramIndex}`;
      queryParams.push(`%${department}%`);
      paramIndex++;
    }

    if (ministry) {
      queryText += ` AND ministry ILIKE $${paramIndex}`;
      countQueryText += ` AND ministry ILIKE $${paramIndex}`;
      queryParams.push(`%${ministry}%`);
      paramIndex++;
    }

    queryText += ' ORDER BY end_date ASC NULLS LAST';
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    const allParams = [...queryParams, limit, offset];

    const countRes = await pool.query(countQueryText, queryParams);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataRes = await pool.query(queryText, allParams);
    const tenders = dataRes.rows;

    return NextResponse.json({
      success: true,
      data: tenders.map(t => ({
        id: t.id.toString(),
        bidNumber: t.bid_number,
        title: t.title,
        ministry: t.ministry || 'N/A',
        department: t.department || 'N/A',
        startDate: t.start_date ? new Date(t.start_date).toISOString() : null,
        endDate: t.end_date ? new Date(t.end_date).toISOString() : null,
        source: t.source || 'GeM',
        state: t.state || 'National',
        city: t.city || 'Various',
        category: t.category || 'General Construction',
        estimatedValue: t.estimated_value || 'N/A',
        tenderUrl: t.tender_url || '',
        documentUrls: t.document_urls ? (typeof t.document_urls === 'string' ? JSON.parse(t.document_urls) : t.document_urls) : [],
        status: t.status || 'active'
      })),
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching relevant tenders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch relevant tenders: ' + error.message },
      { status: 500 }
    );
  }
}
