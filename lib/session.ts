import sqlite3 from "sqlite3";

class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AspenAuthenticationError";
  }
}

export function newSession(aspenCookie: string, aspenSessionId: string, aspenTaglib: string): string {
  const db = new sqlite3.Database(
    "./sessions.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        throw new SessionError("Failed to connect to session database");
      }
    }
  );

  const token = crypto.randomUUID();

  db.run(
    "INSERT INTO sessions(token, aspen_cookie, aspen_session_id, aspen_taglib, created_at) VALUES(?, ?, ?, ?, ?)",
    [token, aspenCookie, aspenSessionId, aspenTaglib, Date.now()],
    (err) => {
      if (err) {
        db.close();
        throw new SessionError("Failed to create a new login session");
      }

      db.close();
    }
  );

  return token;
}

type SessionRow = {
  token: string,
  aspen_cookie: string,
  aspen_session_id: string,
  aspen_taglib: string,
  created_at: number
}

type AspenSession = {
  aspenCookie: string,
  aspenSessionId: string,
  aspenTaglib: string
}

export async function getSession(token: string): Promise<AspenSession | null> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      "./sessions.db",
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          reject(new SessionError("Failed to connect to session database"));
          return;
        }
      }
    );

    db.get(
      "SELECT * FROM sessions WHERE token=?",
      [ token ],
      (err: Error | null, row: SessionRow) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (row) {
          if (new Date(row.created_at) > new Date(Date.now() - (10 * 60 * 1000))) {
            resolve({
              aspenCookie: row.aspen_cookie,
              aspenSessionId: row.aspen_session_id,
              aspenTaglib: row.aspen_taglib
            });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }

        db.close();
      }
    );
  });
}