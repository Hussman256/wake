import { createPool } from "./db.js";

/**
 * Cold start: don't wait for organic discovery. Seed the tracked-wallet
 * list from top Aquarius liquidity providers/traders (pulled manually from
 * stellar.expert for now — pass addresses via SEED_WALLETS, comma-separated).
 */
async function main() {
  const raw = process.env.SEED_WALLETS ?? "";
  const addresses = raw
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (addresses.length === 0) {
    console.error("Set SEED_WALLETS to a comma-separated list of G... addresses to seed.");
    process.exit(1);
  }

  const pool = createPool();
  try {
    for (const address of addresses) {
      await pool.query(
        `INSERT INTO tracked_wallets (address) VALUES ($1) ON CONFLICT DO NOTHING`,
        [address],
      );
    }
    console.log(`[wake-leaderboard] seeded ${addresses.length} tracked wallets`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
