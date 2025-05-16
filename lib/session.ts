import { createClient } from "@libsql/client";
import { cookies } from "next/headers";

class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionError";
  }
}

const TURSO_URL = process.env.TURSO_URL || ""; // Turso database URL
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || ""; // Turso database auth token

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  throw new Error("Please define the TURSO_URL and TURSO_AUTH_TOKEN environment variables");
}

// Create a libSQL client
const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Create a new session
export async function newSession(aspenCookie: string, aspenSessionId: string, aspenTaglib: string): Promise<string> {
  try {
    const token = crypto.randomUUID();
    const createdAt = Date.now();

    await client.execute({
      sql: `INSERT INTO sessions (token, aspen_cookie, aspen_session_id, aspen_taglib, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [token, aspenCookie, aspenSessionId, aspenTaglib, createdAt],
    });

    return token;
  } catch {
    throw new SessionError("Failed to create a new login session");
  }
}

// Retrieve an existing session
export async function getSession(): Promise<AspenSession | null> {
  const cookieJar = await cookies();
  const token = cookieJar.get("AsplannedToken")?.value || "";

  if (!token) {
    return null;
  }

  try {
    const result = await client.execute({
      sql: `SELECT aspen_cookie, aspen_session_id, aspen_taglib, created_at FROM sessions WHERE token = ?`,
      args: [token],
    });

    const row = result.rows[0];

    if (row) {
      const sessionAge = Date.now() - Number(row.created_at);
      const sessionValid = sessionAge <= 30 * 60 * 1000; // 30 minutes

      if (sessionValid) {
        return {
          aspenCookie: row.aspen_cookie?.toString() || "",
          aspenSessionId: row.aspen_session_id?.toString() || "",
          aspenTaglib: row.aspen_taglib?.toString() || "",
        };
      }
    }

    return null; // No session found or session expired
  } catch {
    throw new SessionError("Failed to retrieve session");
  }
}

export type AspenSession = {
  aspenCookie: string;
  aspenSessionId: string;
  aspenTaglib: string;
};