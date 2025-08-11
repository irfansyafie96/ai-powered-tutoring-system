import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
    sslmode: "require",
  },
});

console.log({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS ? "******" : "(no password)",
});

export default pool;
