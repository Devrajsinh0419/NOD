import { NextResponse } from 'next/server';
import pool, { initializeDatabase } from '@/lib/db';

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
    
    return NextResponse.json({
      success: true,
      stats: {
        totalTenders: total,
        relevantTenders: relevant,
        ministriesCount: ministries,
        departmentsCount: depts
      }
    });
  } catch (error: any) {
    console.warn('Error fetching tender stats from DB, falling back to mock stats:', error.message);
    
    const RELEVANT_KEYWORDS = [
      'cnc', 'machining', 'vertical machining centre', 'milling', 'lathe',
      'fabrication', 'metal', 'wood', 'plywood', 'interior', 'furniture'
    ];
    const total = MOCK_TENDERS.length;
    const relevant = MOCK_TENDERS.filter(t => 
      RELEVANT_KEYWORDS.some(kw => t.title.toLowerCase().includes(kw))
    ).length;
    
    const uniqueMinistries = new Set(MOCK_TENDERS.map(t => t.ministry).filter(Boolean));
    const uniqueDepts = new Set(MOCK_TENDERS.map(t => t.department).filter(Boolean));

    return NextResponse.json({
      success: true,
      stats: {
        totalTenders: total,
        relevantTenders: relevant,
        ministriesCount: uniqueMinistries.size,
        departmentsCount: uniqueDepts.size
      }
    });
  }
}
