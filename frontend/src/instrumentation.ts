export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { startTenderSyncCron } = await import('./lib/cron');
      startTenderSyncCron();
    } catch (error) {
      console.error('Failed to register instrumentation cron job:', error);
    }
  }
}
