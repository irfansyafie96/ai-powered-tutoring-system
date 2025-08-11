import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

// Azure Database for PostgreSQL configuration
const connectionConfig = {
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,

  // Azure PostgreSQL SSL configuration
  ssl: {
    rejectUnauthorized: false, // Azure uses self-signed certificates
  },

  // Azure-optimized connection pool settings
  connectionTimeoutMillis: 30000, // 30 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  max: 10, // Azure allows more connections
  min: 2, // Keep some connections ready

  // Connection parameters
  application_name: "tutoring-app-azure",
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

export const pool = new Pool(connectionConfig);

// Enhanced error handling
pool.on("error", (err, client) => {
  console.error("Pool error occurred:", {
    message: err.message,
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
  });
});

pool.on("connect", (client) => {
  console.log("✅ New Azure database client connected");

  // Set session parameters for Azure PostgreSQL
  client
    .query(
      `
    SET statement_timeout = 30000;
    SET lock_timeout = 10000;
    SET idle_in_transaction_session_timeout = 30000;
  `
    )
    .catch((err) => {
      console.log("Warning: Could not set session parameters:", err.message);
    });
});

// Function to get a reliable connection
export async function getConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Azure connection attempt ${i + 1}/${retries}`);
      const client = await pool.connect();
      console.log("✅ Azure database connection acquired");
      return client;
    } catch (error) {
      console.log(`❌ Connection attempt ${i + 1} failed:`, error.message);

      if (i === retries - 1) {
        throw error; // Last attempt failed
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Test connection with retry logic
export async function testConnection() {
  let client;
  try {
    client = await getConnection();
    const result = await client.query(
      "SELECT NOW() as current_time, version()"
    );
    console.log("✅ Azure database test successful:", result.rows[0]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error("❌ Azure database test failed:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    return { success: false, error: error.message };
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Log connection configuration (without sensitive data)
console.log({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS ? "******" : "(no password)",
  poolSettings: {
    max: connectionConfig.max,
    min: connectionConfig.min,
    connectionTimeout: connectionConfig.connectionTimeoutMillis,
    idleTimeout: connectionConfig.idleTimeoutMillis,
  },
  provider: "Azure Database for PostgreSQL",
});

export default pool;
