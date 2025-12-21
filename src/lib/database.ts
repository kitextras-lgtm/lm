import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

export async function initDatabase() {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const savedData = localStorage.getItem('submissions_db');

  if (savedData) {
    const uint8Array = new Uint8Array(JSON.parse(savedData));
    db = new SQL.Database(uint8Array);
  } else {
    db = new SQL.Database();

    db.run(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // OTP codes table
    db.run(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TEXT NOT NULLW
      )
    `);

    saveDatabase();
  }

  return db;
}

function saveDatabase() {
  if (!db) return;

  const data = db.export();
  const dataStr = JSON.stringify(Array.from(data));
  localStorage.setItem('submissions_db', dataStr);
}

export interface ContactSubmission {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  created_at?: string;
}

export async function insertSubmission(
  submission: Omit<ContactSubmission, 'id' | 'created_at' | 'status'>
) {
  const database = await initDatabase();

  database.run(
    'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [submission.name, submission.email, submission.subject, submission.message]
  );

  saveDatabase();

  return {
    lastInsertRowid: database.exec('SELECT last_insert_rowid()')[0]
      .values[0][0],
  };
}

export async function getAllSubmissions(): Promise<ContactSubmission[]> {
  const database = await initDatabase();

  const result = database.exec(
    'SELECT * FROM contact_submissions ORDER BY created_at DESC'
  );

  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as ContactSubmission;
  });
}

export async function getSubmissionById(
  id: number
): Promise<ContactSubmission | undefined> {
  const database = await initDatabase();

  const result = database.exec(
    'SELECT * FROM contact_submissions WHERE id = ?',
    [id]
  );

  if (result.length === 0 || result[0].values.length === 0) return undefined;

  const columns = result[0].columns;
  const row = result[0].values[0];

  const obj: any = {};
  columns.forEach((col, i) => {
    obj[col] = row[i];
  });

  return obj as ContactSubmission;
}

export async function updateSubmissionStatus(id: number, status: string) {
  const database = await initDatabase();

  database.run('UPDATE contact_submissions SET status = ? WHERE id = ?', [
    status,
    id,
  ]);
  saveDatabase();
}

/* ------------------ OTP FUNCTIONS ------------------ */
export async function saveOtp(email: string, code: string) {
  const database = await initDatabase();
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins

  database.run(
    'INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)',
    [email, code, expires]
  );

  saveDatabase();
}

export async function validateOtp(
  email: string,
  code: string
): Promise<boolean> {
  const database = await initDatabase();

  const result = database.exec(
    'SELECT * FROM otp_codes WHERE email = ? ORDER BY id DESC LIMIT 1',
    [email]
  );

  if (result.length === 0) return false;

  const row = result[0].values[0];
  const storedCode = row[2];
  const expiresAt = new Date(row[3]);

  return storedCode === code && expiresAt > new Date();
}

/* ------------------ USER FUNCTIONS ------------------ */
export async function findOrCreateUser(email: string) {
  const database = await initDatabase();

  let result = database.exec(`SELECT * FROM users WHERE email = ? LIMIT 1`, [
    email,
  ]);

  // Already exists → return it
  if (result.length > 0) {
    const row = result[0].values[0];
    return { id: row[0], email: row[1], created_at: row[2] };
  }

  // Create new user
  database.run(`INSERT INTO users (email) VALUES (?)`, [email]);
  saveDatabase();

  // Fetch new user
  result = database.exec(`SELECT * FROM users WHERE email = ? LIMIT 1`, [
    email,
  ]);

  const row = result[0].values[0];
  return { id: row[0], email: row[1], created_at: row[2] };
}
