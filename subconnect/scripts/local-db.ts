/**
 * Starts a local PostgreSQL server for development, with no system install needed.
 * Data is kept in ./.pgdata. Press Ctrl+C to stop.
 * Matches the default DATABASE_URL in .env.example.
 */
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve(".pgdata");
const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "subconnect",
  password: "subconnect",
  port: 5433,
  persistent: true,
});

async function main() {
  if (!fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase("subconnect");
  } catch {
    // already exists
  }
  console.log("Local Postgres running at postgresql://subconnect:subconnect@localhost:5433/subconnect");
  console.log("Press Ctrl+C to stop.");
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch(async (err) => {
  console.error(err);
  await pg.stop().catch(() => {});
  process.exit(1);
});
