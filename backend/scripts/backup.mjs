import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { getDb } from '../db/database.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = process.env.AITOPINDEX_BACKUP_DIR || path.resolve(__dirname, '../backups');

export function runBackupAndVerify() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `aitopindex-${stamp}.sqlite`);

  const db = getDb();
  const safePath = backupFile.replace(/'/g, "''");
  db.exec(`VACUUM INTO '${safePath}';`);

  // Verify backup integrity and row counts by opening the backup DB
  const verifyDb = new DatabaseSync(backupFile, { readOnly: true });
  const integrity = verifyDb.prepare('PRAGMA integrity_check;').get();
  const companiesCnt = verifyDb.prepare('SELECT COUNT(*) AS c FROM companies').get().c;
  const subsCnt = verifyDb.prepare('SELECT COUNT(*) AS c FROM submissions').get().c;
  const leadsCnt = verifyDb.prepare('SELECT COUNT(*) AS c FROM leads').get().c;
  verifyDb.close();

  if (integrity?.integrity_check !== 'ok') {
    throw new Error(`Backup integrity check failed: ${JSON.stringify(integrity)}`);
  }

  return {
    backupFile,
    integrity: 'ok',
    counts: { companies: companiesCnt, submissions: subsCnt, leads: leadsCnt },
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const res = runBackupAndVerify();
  console.log('[BACKUP VERIFIED]', JSON.stringify(res));
}
