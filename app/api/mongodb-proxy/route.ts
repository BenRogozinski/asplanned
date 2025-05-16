import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || ""; // MongoDB connection string
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const DATABASE_NAME = "asplanned";
const COLLECTION_NAME = "sessions";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Initialize MongoDB client
async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise!;
}

export async function POST(request: Request): Promise<Response> {
  let body;

  // Parse the request body
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { action, data } = body;

  try {
    const client = await getMongoClient();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    let result;

    switch (action) {
      case "insertOne":
        result = await collection.insertOne(data.document);
        break;
      case "findOne":
        result = await collection.findOne(data.filter);
        break;
      default:
        return jsonResponse({ error: "Invalid action" }, 400);
    }

    return jsonResponse({ result }, 200);
  } catch (err) {
    console.error(err);
    return handleError(err);
  }
}

// Helper function to handle errors
function handleError(e: unknown): Response {
  if (e instanceof Error) {
    return jsonResponse({ error: e.message }, 500);
  }
  return jsonResponse({ error: "Internal server error" }, 500);
}

// Helper function to create JSON responses
function jsonResponse(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}