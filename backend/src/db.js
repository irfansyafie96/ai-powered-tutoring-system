import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
});

export default pool;
