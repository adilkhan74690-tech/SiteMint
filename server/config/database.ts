import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

// Enforce that mandatory database environment variables are present
if (!DB_HOST || !DB_USER || !DB_NAME) {
  console.error("❌ Fatal Error: Missing database environment variables (DB_HOST, DB_USER, DB_NAME). Terminating server.");
  process.exit(1);
}

let pool: mysql.Pool;

try {
  pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD || "",
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  });
  
  // Listen for database pool error events (e.g. connection loss) and fail immediately
  (pool as any).on("error", (err: any) => {
    console.error("❌ Fatal Database Pool Error: Connection lost or failed.", err);
    process.exit(1);
  });
  
  console.log("⚡ MySQL connection pool initialized successfully.");
} catch (error) {
  console.error("❌ Fatal Error: Failed to create MySQL connection pool.", error);
  process.exit(1);
}

// Deprecated configuration flag (retained as true to maintain import compatibility but enforce DB-only)
const isConfigured = true;

/**
 * Execute a SQL query on the database.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    console.error(`❌ SQL Error for query: "${sql}"`, error);
    throw error;
  }
}

/**
 * Get a connection from the pool for transactions.
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error("❌ Failed to obtain database connection from pool:", error);
    throw error;
  }
}

export { pool, isConfigured };
