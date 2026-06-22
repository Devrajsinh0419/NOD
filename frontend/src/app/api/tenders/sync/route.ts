import { NextResponse } from 'next/server';
import { syncAllTenders } from '@/services/tender.service';

export async function POST() {
  try {
    console.log('Manual sync requested via API for all portals...');
    await syncAllTenders();
    return NextResponse.json({
      success: true,
      message: 'All government tenders sync completed successfully.'
    });
  } catch (error: any) {
    console.error('Manual sync failed:', error);
    return NextResponse.json(
      { success: false, message: 'Sync failed: ' + error.message },
      { status: 500 }
    );
  }
}
