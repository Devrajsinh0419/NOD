import fs from 'fs';
import path from 'path';

// Load environment variables before importing db module
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (key && !key.startsWith('#')) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.error("Failed to load environment manually:", e);
}

async function main() {
  console.log("Loading modules dynamically...");
  const { initializeDatabase } = await import('./db');
  const { syncGemTenders } = await import('../services/gem.service');

  console.log("Validating DB initialization...");
  await initializeDatabase();
  console.log("Triggering initial mock/GeM sync...");
  await syncGemTenders();
  console.log("DB and sync validations successful!");
  process.exit(0);
}

main().catch(err => {
  console.error("Validation failed:", err);
  process.exit(1);
});
