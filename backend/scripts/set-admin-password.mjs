import readline from 'node:readline';
import { getDb, logAudit } from '../db/database.mjs';
import { hashPassword } from '../lib/security.mjs';

function askHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const stdin = process.openStdin();
    process.stdin.on('data', (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(query + '*'.repeat(rl.line.length));
          break;
      }
    });
    rl.question(query, (value) => {
      rl.history = rl.history.slice(1);
      rl.close();
      console.log('');
      resolve(value);
    });
  });
}

async function main() {
  const username = process.argv[2] || 'admin';
  const pass1 = await askHidden(`Enter new password for admin user '${username}' (min 10 chars): `);
  if (pass1.length < 10) {
    console.error('Error: Password must be at least 10 characters.');
    process.exit(1);
  }
  const pass2 = await askHidden('Repeat new password: ');
  if (pass1 !== pass2) {
    console.error('Error: Passwords do not match.');
    process.exit(1);
  }

  const db = getDb();
  const hash = hashPassword(pass1);
  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
  if (existing) {
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(hash, username);
  } else {
    db.prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, 'superadmin')").run(username, hash);
  }

  logAudit(db, {
    actor: 'cli_admin',
    action: 'admin.password_updated',
    entityType: 'admin_user',
    entityId: username,
  });

  console.log(`Success: Password for '${username}' has been securely updated.`);
  db.close();
}

main();
