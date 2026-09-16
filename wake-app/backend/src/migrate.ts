import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createPool } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const pool = createPool();
  try {
    await pool.query(sql);
    console.log("[wake-leaderboard] schema applied");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
