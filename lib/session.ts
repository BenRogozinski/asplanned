import sqlite3 from "sqlite3";
import crypto from "crypto"; // Ensure this is imported for `crypto.randomUUID`

class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionError";
  }
}

export function newSession(aspenCookie: string, aspenSessionId: string, aspenTaglib: string): string {
  const db = new sqlite3.Database("./sessions.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      throw new SessionError("Failed to connect to session database");
    }
  });

  const token = crypto.randomUUID();
  const createdAt = Date.now();

  db.run(
    `INSERT INTO sessions(token, aspen_cookie, aspen_session_id, aspen_taglib, created_at) 
     VALUES(?, ?, ?, ?, ?)`,
    [token, aspenCookie, aspenSessionId, aspenTaglib, createdAt],
    (err) => {
      db.close();
      if (err) {
        throw new SessionError("Failed to create a new login session");
      }
    }
  );

  return token;
}

type SessionRow = {
  token: string;
  aspen_cookie: string;
  aspen_session_id: string;
  aspen_taglib: string;
  created_at: number;
};

export type AspenSession = {
  aspenCookie: string;
  aspenSessionId: string;
  aspenTaglib: string;
};

export async function getSession(token: string): Promise<AspenSession | null> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./sessions.db", sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        reject(new SessionError("Failed to connect to session database"));
        return;
      }
    });

    db.get(
      "SELECT * FROM sessions WHERE token = ?",
      [token],
      (err: Error | null, row: SessionRow) => {
        db.close();

        if (err) {
          reject(new SessionError("Failed to retrieve session"));
          return;
        }

        if (row) {
          const sessionAge = Date.now() - row.created_at;
          const sessionValid = sessionAge <= 30 * 60 * 1000; // 30 minutes

          if (sessionValid) {
            resolve({
              aspenCookie: row.aspen_cookie,
              aspenSessionId: row.aspen_session_id,
              aspenTaglib: row.aspen_taglib,
            });
          } else {
            resolve(null); // Session expired
          }
        } else {
          resolve(null); // No session found
        }
      }
    );
  });
}