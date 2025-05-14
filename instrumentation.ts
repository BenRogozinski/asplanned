import sqlite3 from "sqlite3";

export async function register() {
  const db = new sqlite3.Database(
    "./sessions.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        throw new Error("Failed to initialize session database");
      }
      console.log("Initialized sessions database");
    }
  );

  db.serialize(() => {
    //db.run (
    //  `
    //  DROP TABLE IF EXISTS sessions
    //  `
    //);
    db.run(
      `
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        aspen_cookie TEXT,
        aspen_session_id TEXT,
        aspen_taglib TEXT,
        created_at INTEGER
      )
      `
    );
  });

  //const test = newSession("aspencookie", "aspensessionid", "aspentaglib");
  //console.log(await getSession(test));
}