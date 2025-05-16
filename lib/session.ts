import { cookies } from "next/headers";

class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionError";
  }
}

const API_PROXY_URL = `${process.env.BASE_URL || "http://localhost:3000"}/api/mongodb-proxy`;

// Helper function to call the serverless API
async function callMongoDBProxy(action: string, data: Record<string, unknown>) {
  const response = await fetch(API_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, data }),
  });

  if (!response.ok) {
    throw new SessionError(`MongoDB Proxy request failed: ${response.statusText}`);
  }

  return response.json();
}

// Create a new session
export async function newSession(aspenCookie: string, aspenSessionId: string, aspenTaglib: string): Promise<string> {
  try {
    const token = crypto.randomUUID();
    const createdAt = Date.now();

    await callMongoDBProxy("insertOne", {
      document: {
        token,
        aspen_cookie: aspenCookie,
        aspen_session_id: aspenSessionId,
        aspen_taglib: aspenTaglib,
        created_at: createdAt,
      },
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
    const result = await callMongoDBProxy("findOne", {
      filter: { token },
    });

    const row = result.result;

    if (row) {
      const sessionAge = Date.now() - row.created_at;
      const sessionValid = sessionAge <= 30 * 60 * 1000; // 30 minutes

      if (sessionValid) {
        return {
          aspenCookie: row.aspen_cookie,
          aspenSessionId: row.aspen_session_id,
          aspenTaglib: row.aspen_taglib,
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