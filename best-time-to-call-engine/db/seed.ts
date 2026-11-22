import "dotenv/config"; // must come first so DATABASE_URL is loaded
import { pool } from "./index";
import { seedWorkspace } from "./seedWorkspace";

// A fixed ID for the demo data. Real visitors get a random one from their cookie.
const DEMO_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";

async function main() {
  const r = await seedWorkspace(DEMO_WORKSPACE_ID);
  console.log(`seeded ${r.contacts} contacts and ${r.attempts} call attempts`);
  await pool.end();
}

main();
