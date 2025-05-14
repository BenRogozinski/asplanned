const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
    "./sessions.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Connected to SQlite database :D");
    }
)

db.serialize(() => {
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