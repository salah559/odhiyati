import mysql from "mysql2/promise";

export default async function handler(req, res) {
  try {
    const db = await mysql.createConnection({
      host: "srv50.octenium.net",
      user: "ctdccyqq_salah",
      password: "silo@salah55",
      database: "ctdccyqq_odh",
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await db.query("SELECT 1");
    res.json({ ok: true, rows });
  } catch (err) {
    res.json({ error: err.message });
  }
}
