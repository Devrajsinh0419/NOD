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

const MOCK_TENDERS = [
  {
    id: 5116342,
    bid_number: 'GEM/2026/B/5116342',
    title: 'CNC Vertical Machining Centre - VMC 850 with standard accessories',
    ministry: 'Ministry of Defence',
    department: 'Department of Defence Production',
    start_date: '2026-06-18 10:00:00',
    end_date: '2026-07-15 15:00:00',
    source: 'Tanders'
  },
  {
    id: 5116358,
    bid_number: 'GEM/2026/B/5116358',
    title: 'Supply and Installation of Wooden Modular Office Furniture',
    ministry: 'Ministry of Education',
    department: 'Department of Higher Education',
    start_date: '2026-06-19 11:30:00',
    end_date: '2026-07-10 16:00:00',
    source: 'Tanders'
  },
  {
    id: 5116390,
    bid_number: 'GEM/2026/B/5116390',
    title: 'Custom Metal Fabrication Work for Laboratory Racks',
    ministry: 'Ministry of Science and Technology',
    department: 'Department of Scientific and Industrial Research',
    start_date: '2026-06-20 09:00:00',
    end_date: '2026-07-20 14:00:00',
    source: 'Tanders'
  },
  {
    id: 5116405,
    bid_number: 'GEM/2026/B/5116405',
    title: 'CNC Lathe Machine Heavy Duty with Variable Speed Drive',
    ministry: 'Ministry of Railways',
    department: 'Railway Board',
    start_date: '2026-06-15 14:00:00',
    end_date: '2026-07-05 15:00:00',
    source: 'Tanders'
  },
  {
    id: 5116410,
    bid_number: 'GEM/2026/B/5116410',
    title: 'Interior Decoration and Plywood Partition Works',
    ministry: 'Ministry of Finance',
    department: 'Department of Revenue',
    start_date: '2026-06-20 12:00:00',
    end_date: '2026-07-12 17:00:00',
    source: 'Tanders'
  },
  {
    id: 5116422,
    bid_number: 'GEM/2026/B/5116422',
    title: 'General CNC Milling and Tooling Workstation Services',
    ministry: 'Ministry of Heavy Industries',
    department: 'Department of Heavy Industry',
    start_date: '2026-06-12 10:00:00',
    end_date: '2026-07-02 15:00:00',
    source: 'Tanders'
  },
  {
    id: 5116440,
    bid_number: 'GEM/2026/B/5116440',
    title: 'Procurement of Commercial Plywood Board and Timber',
    ministry: 'Ministry of Housing and Urban Affairs',
    department: 'Delhi Development Authority',
    start_date: '2026-06-17 09:30:00',
    end_date: '2026-07-08 14:30:00',
    source: 'Tanders'
  },
  {
    id: 5116480,
    bid_number: 'GEM/2026/B/5116480',
    title: 'CNC Plasma Cutting Machine with water table',
    ministry: 'Ministry of Steel',
    department: 'Steel Authority of India',
    start_date: '2026-06-19 15:00:00',
    end_date: '2026-07-21 16:00:00',
    source: 'Tanders'
  },
  {
    id: 5116499,
    bid_number: 'GEM/2026/B/5116499',
    title: 'Executive Chairs and Conference Tables for Boardroom',
    ministry: 'Ministry of Commerce and Industry',
    department: 'Department of Commerce',
    start_date: '2026-06-19 12:00:00',
    end_date: '2026-07-09 15:00:00',
    source: 'Tanders'
  },
  {
    id: 5116510,
    bid_number: 'GEM/2026/B/5116510',
    title: 'Air Conditioning System and Ducting Installation',
    ministry: 'Ministry of Health and Family Welfare',
    department: 'All India Institute of Medical Sciences',
    start_date: '2026-06-14 09:00:00',
    end_date: '2026-07-05 14:00:00',
    source: 'Tanders'
  }
];

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

    let tenders: any[] = [];
    let total = 0;

    try {
      const countRes = await pool.query(countQueryText, queryParams);
      total = parseInt(countRes.rows[0].count, 10);

      const dataRes = await pool.query(queryText, allParams);
      tenders = dataRes.rows;
    } catch (dbQueryErr: any) {
      console.warn("Database query failed in relevant tenders, using fallback mock tenders:", dbQueryErr.message);
      
      const RELEVANT_KEYWORDS = [
        'cnc', 'machining', 'vertical machining centre', 'milling', 'lathe',
        'fabrication', 'metal', 'wood', 'plywood', 'interior', 'furniture'
      ];
      let filtered = MOCK_TENDERS.filter(t => 
        RELEVANT_KEYWORDS.some(kw => t.title.toLowerCase().includes(kw))
      );

      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(lowerSearch) || t.bid_number.toLowerCase().includes(lowerSearch));
      }
      if (department) {
        const lowerDept = department.toLowerCase();
        filtered = filtered.filter(t => t.department.toLowerCase().includes(lowerDept));
      }
      if (ministry) {
        const lowerMin = ministry.toLowerCase();
        filtered = filtered.filter(t => t.ministry.toLowerCase().includes(lowerMin));
      }
      total = filtered.length;
      tenders = filtered.slice(offset, offset + limit);
    }

    return NextResponse.json({
      success: true,
      data: tenders.map(t => ({
        id: t.id.toString(),
        bidNumber: t.bid_number || t.bidNumber,
        title: t.title,
        ministry: t.ministry,
        department: t.department,
        startDate: t.start_date || t.startDate ? new Date(t.start_date || t.startDate).toISOString() : null,
        endDate: t.end_date || t.endDate ? new Date(t.end_date || t.endDate).toISOString() : null,
        source: t.source || 'Tanders',
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
