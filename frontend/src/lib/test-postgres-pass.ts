import { Client } from 'pg';

async function testDockerConnection() {
  console.log("Testing connection to Docker PostgreSQL on localhost:5433...");
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'Manish1_121',
    database: 'nod'
  });
  try {
    await client.connect();
    console.log("SUCCESS! Connected successfully to Docker PostgreSQL!");
    await client.end();
    process.exit(0);
  } catch (err: any) {
    console.error(`Failed: ${err.message}`);
    process.exit(1);
  }
}

testDockerConnection();
