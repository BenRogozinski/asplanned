import { Cookie } from "tough-cookie";
import { AspenNavigator } from "../../../../lib/aspen";
import { z } from "zod";
import { newSession } from "@/lib/session";

const LoginSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
});

export async function POST(request: Request) {
  let body;

  // Parse the request body
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  // Validate the request body
  const result = LoginSchema.safeParse(body);
  if (!result.success) {
    return jsonResponse({ error: "Malformed request" }, 401);
  }

  const { username, password } = result.data;
  const aspen = new AspenNavigator();

  // Attempt login
  try {
    await aspen.navigate("/logon.do");
    aspen.setField("username", username);
    aspen.setField("password", password);
    await aspen.submit();
  } catch (e) {
    return handleError(e);
  }

  // Check if login was successful
  if (aspen.url.endsWith("/home.do")) {
    return handleSuccessfulLogin(aspen);
  } else {
    return jsonResponse({ error: "Authentication failed" }, 401);
  }
}

// Helper function to handle successful login
async function handleSuccessfulLogin(aspen: AspenNavigator): Promise<Response> {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const aspenCookies = await aspen.getCookies();
  const cookies: Record<string, string> = {};
  for (const cookie of aspenCookies) {
    cookies[cookie.key] = cookie.value;
  }

  await aspen.navigate("/home.do");

  const asplannedTokenCookie = new Cookie();
  asplannedTokenCookie.key = "AsplannedToken";
  asplannedTokenCookie.path = "/";
  asplannedTokenCookie.secure = false;
  asplannedTokenCookie.value = await newSession(
    cookies.AspenCookie || "",
    cookies.JSESSIONID || "",
    aspen.form["org.apache.struts.taglib.html.TOKEN"] || ""
  );
  headers.append("Set-Cookie", asplannedTokenCookie.toString());

  return new Response(null, { status: 200, headers });
}

// Helper function to handle errors
function handleError(e: unknown): Response {
  if (e instanceof Error) {
    return jsonResponse({ error: e.message }, 500);
  }
  return jsonResponse({ error: "Internal processing error" }, 500);
}

// Helper function to create JSON responses
function jsonResponse(data: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}