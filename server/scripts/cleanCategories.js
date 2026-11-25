import { mysqlPool, isMysql, sqliteDb } from '../db.js';

async function run() {
  if (isMysql) {
    const [del] = await mysqlPool.query("DELETE FROM categories WHERE id IN ('groceries', 'sneakers', 'gaming-vr') OR count = 0");
    console.log('MySQL deleted dummy categories:', del.affectedRows);
    const [rows] = await mysqlPool.query('SELECT id, name, count FROM categories ORDER BY name ASC');
    console.log('Active categories in MySQL:');
    console.table(rows);
  }
  if (sqliteDb) {
    try {
      const res = sqliteDb.prepare("DELETE FROM categories WHERE id IN ('groceries', 'sneakers', 'gaming-vr') OR count = 0").run();
      console.log('SQLite deleted dummy categories:', res.changes);
    } catch (_) {}
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
