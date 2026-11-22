import "dotenv/config";
import { readFileSync } from "fs";
import { pool } from "./index";

async function main() {
  await pool.query(readFileSync("db/schema.sql", "utf8"));
  console.log("tables ready");
  await pool.end();
}
main();
