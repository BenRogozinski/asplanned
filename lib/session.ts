import { createClient } from "@libsql/client";
import { cookies } from "next/headers";
import { Logger } from "./logger";

const logger = new Logger("Session");

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
  logger.debug("Generating new session");
  try {
    const token = crypto.randomUUID();
    const createdAt = Date.now();

    // Cleanup expired sessions
    logger.debug("Cleaning up expired sessions");
    const expirationThreshold = createdAt - 30 * 60 * 1000; // 30 minutes ago
    await client.execute({
      sql: `DELETE FROM sessions WHERE created_at < ?`,
      args: [expirationThreshold],
    });

    // Insert the new session
    logger.debug("Inserting new session into database");
    await client.execute({
      sql: `INSERT INTO sessions (token, aspen_cookie, aspen_session_id, aspen_taglib, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [token, aspenCookie, aspenSessionId, aspenTaglib, createdAt],
    });

    return token;
  } catch {
    throw new SessionError("Failed to create new login session");
  }
}

// Retrieve an existing session
export async function getSession(): Promise<AspenSession | null> {
  logger.debug("Getting current session");

  const cookieJar = await cookies();
  const token = cookieJar.get("AsplannedToken")?.value || "";

  // No token to begin with
  if (!token) {
    logger.debug("No token found");
    return null;
  }

  try {
    const result = await client.execute({
      sql: `SELECT aspen_cookie, aspen_session_id, aspen_taglib, created_at FROM sessions WHERE token = ?`,
      args: [token],
    });

    // No session in database
    if (!result.rows.length) {
      return null;
    }
    const row = result.rows[0];

    if (row) {
      const sessionAge = Date.now() - Number(row.created_at);
      const sessionValid = sessionAge <= 30 * 60 * 1000; // 30 minutes

      if (sessionValid) {
        const aspenCookie = row.aspen_cookie?.toString() || "";
        const aspenSessionId = row.aspen_session_id?.toString() || "";
        const aspenTaglib = row.aspen_taglib?.toString() || "";
        if (aspenCookie && aspenSessionId && aspenTaglib) {
          return {
            aspenCookie,
            aspenSessionId,
            aspenTaglib
          };
        }
      }
    }

    return null; // Session expired or is missing information
  } catch {
    throw new SessionError("Failed to get session");
  }
}


export async function deleteSession(): Promise<boolean> {
  logger.debug("Deleting current session");

  const cookieJar = await cookies();
  const token = cookieJar.get("AsplannedToken")?.value || "";

  // No token to begin with
  if (!token) {
    logger.debug("No token found in cookies");
    return false;
  }

  try {
    const result = await client.execute({
      sql: `DELETE FROM sessions WHERE token = ?`,
      args: [token],
    });

    // Check if any rows were affected (i.e., a session was deleted)
    const success = result.rowsAffected > 0;
    if (success) {
      logger.debug("Session successfully deleted");
    } else {
      logger.debug("No session found to delete");
    }
    return success;
  } catch {
    throw new SessionError("Failed to delete session");
  }
}

export type AspenSession = {
  aspenCookie: string;
  aspenSessionId: string;
  aspenTaglib: string;
};