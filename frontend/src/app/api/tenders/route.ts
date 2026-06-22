import { NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';
import { startTenderSyncCron } from '@/lib/cron';

function parseDocUrls(val: any): string[] {
  if (!val) return [];
  try {
    if (typeof val === 'string') {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    }
    if (Array.isArray(val)) {
      return val;
    }
  } catch (e) {
    if (typeof val === 'string' && val.includes(',')) {
      return val.split(',').map((u: string) => u.trim());
    }
  }
  return [];
}

export async function GET(request: Request) {
  // Safe lazy boot database setup
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
    
    // Filters
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const source = searchParams.get('source') || '';
    const department = searchParams.get('department') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const closingDate = searchParams.get('closing_date') || '';
    const budgetMin = searchParams.get('budget_min') || '';
    const budgetMax = searchParams.get('budget_max') || '';

    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM tenders WHERE 1=1';
    let countQueryText = 'SELECT COUNT(*) FROM tenders WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Search by keyword
    if (search) {
      const searchWildcard = `%${search}%`;
      queryText += ` AND (title ILIKE $${paramIndex} OR bid_number ILIKE $${paramIndex} OR department ILIKE $${paramIndex})`;
      countQueryText += ` AND (title ILIKE $${paramIndex} OR bid_number ILIKE $${paramIndex} OR department ILIKE $${paramIndex})`;
      queryParams.push(searchWildcard);
      paramIndex++;
    }

    // Filter by State
    if (state) {
      queryText += ` AND state ILIKE $${paramIndex}`;
      countQueryText += ` AND state ILIKE $${paramIndex}`;
      queryParams.push(state);
      paramIndex++;
    }

    // Filter by City
    if (city) {
      queryText += ` AND city ILIKE $${paramIndex}`;
      countQueryText += ` AND city ILIKE $${paramIndex}`;
      queryParams.push(city);
      paramIndex++;
    }

    // Filter by Source Portal (supports multi-select comma separated)
    if (source) {
      const sources = source.split(',').map(s => s.trim());
      const sourcePlaceholders = sources.map((_, i) => `$${paramIndex + i}`).join(', ');
      
      queryText += ` AND source IN (${sourcePlaceholders})`;
      countQueryText += ` AND source IN (${sourcePlaceholders})`;
      
      sources.forEach(s => queryParams.push(s));
      paramIndex += sources.length;
    }

    // Filter by Department
    if (department) {
      queryText += ` AND department ILIKE $${paramIndex}`;
      countQueryText += ` AND department ILIKE $${paramIndex}`;
      queryParams.push(`%${department}%`);
      paramIndex++;
    }

    // Filter by Category
    if (category) {
      queryText += ` AND category ILIKE $${paramIndex}`;
      countQueryText += ` AND category ILIKE $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // Filter by Status
    if (status) {
      queryText += ` AND status ILIKE $${paramIndex}`;
      countQueryText += ` AND status ILIKE $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Filter by Closing Date (Deadline)
    if (closingDate) {
      queryText += ` AND end_date <= $${paramIndex}`;
      countQueryText += ` AND end_date <= $${paramIndex}`;
      queryParams.push(new Date(closingDate));
      paramIndex++;
    }

    // Filter by Estimated Value Range (budget_min)
    if (budgetMin) {
      const minVal = parseFloat(budgetMin.replace(/[^0-9.]/g, ''));
      if (!isNaN(minVal)) {
        queryText += ` AND CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) >= $${paramIndex}`;
        countQueryText += ` AND CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) >= $${paramIndex}`;
        queryParams.push(minVal);
        paramIndex++;
      }
    }

    // Filter by Estimated Value Range (budget_max)
    if (budgetMax) {
      const maxVal = parseFloat(budgetMax.replace(/[^0-9.]/g, ''));
      if (!isNaN(maxVal)) {
        queryText += ` AND CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) <= $${paramIndex}`;
        countQueryText += ` AND CAST(regexp_replace(estimated_value, '[^0-9]', '', 'g') AS NUMERIC) <= $${paramIndex}`;
        queryParams.push(maxVal);
        paramIndex++;
      }
    }

    // Order by end_date ASC (closing soonest)
    queryText += ' ORDER BY end_date ASC NULLS LAST';
    
    // Add pagination params
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
        documentUrls: parseDocUrls(t.document_urls),
        status: t.status || 'active'
      })),
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error('Error fetching tenders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tenders: ' + error.message },
      { status: 500 }
    );
  }
}
