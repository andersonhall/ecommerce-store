import pg from "pg";
const { Pool } = pg;
import "dotenv/config";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

export const query = async (text, params, callback) => {
  // const start = Date.now();
  // const res = await pool.query(text, params);
  // const duration = Date.now() - start;
  // console.log("executed query", { text, duration, rows: res.rowCount });
  return pool.query(text, params, callback);
};
