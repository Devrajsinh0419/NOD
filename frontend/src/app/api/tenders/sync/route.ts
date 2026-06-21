import { NextResponse } from 'next/server';
import { syncGemTenders } from '@/services/gem.service';

export async function POST() {
  try {
    console.log('Manual sync requested via API...');
    await syncGemTenders();
    return NextResponse.json({
      success: true,
      message: 'GeM tender sync completed successfully.'
    });
  } catch (error: any) {
    console.error('Manual sync failed:', error);
    return NextResponse.json(
      { success: false, message: 'Sync failed: ' + error.message },
      { status: 500 }
    );
  }
}
