import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

// Build connection string with SSL parameters
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}?sslmode=require`;

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
    sslmode: "require",
  },
  // Add timeout and connection pool settings
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 10, // Maximum number of clients in the pool
  min: 1, // Minimum number of clients in the pool
});

console.log({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS ? "******" : "(no password)",
  connectionString: connectionString.replace(process.env.DB_PASS, "******"),
});

export default pool;
