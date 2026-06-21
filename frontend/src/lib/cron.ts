import cron from 'node-cron';
import { syncGemTenders } from '@/services/gem.service';

let cronStarted = false;

export function startTenderSyncCron() {
  if (cronStarted) {
    return;
  }
  
  // Check if we are running in server side
  if (typeof window !== 'undefined') {
    return;
  }

  cronStarted = true;
  console.log('Initializing GeM Tender Sync Cron Job. Schedule: every hour (0 * * * *).');
  
  // Trigger initial sync on startup asynchronously to not block
  syncGemTenders()
    .then(() => console.log('Initial startup tender sync completed.'))
    .catch((err) => console.error('Initial startup tender sync failed:', err));

  // Schedule every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Cron triggered: Starting hourly GeM tender sync...');
    try {
      await syncGemTenders();
      console.log('Cron: GeM tender sync finished successfully.');
    } catch (error) {
      console.error('Cron: GeM tender sync failed with error:', error);
    }
  });
}
