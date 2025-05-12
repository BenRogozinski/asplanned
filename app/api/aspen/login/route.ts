import { AspenNavigator } from "../aspen";
import { z } from "zod";

export const runtime = 'edge';

const LoginSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
});

export async function POST(request: Request) {
  let body;

  try {
    body = await request.json();
  } catch  {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const result = LoginSchema.safeParse(body);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: "Malformed request" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { username, password } = result.data;

  const aspen = new AspenNavigator(process.env.ASPEN_BASE_URL || "https://aspen.cps.edu/aspen");

  try {
    await aspen.navigate("/logon.do");
    aspen.setField("username", username);
    aspen.setField("password", password);
    await aspen.submit();
  } catch (e: unknown) {
    if (e instanceof Error) {
      return new Response(
        JSON.stringify({ error: e.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Internal processing error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  if (aspen.url.endsWith("/home.do")) {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const aspenCookies = await aspen.getCookies();
    for (const cookie of aspenCookies) {
      cookie.key = `ASPEN_${cookie.key}`;
      headers.append("Set-Cookie", cookie.toString());
    }

    return new Response(null, {
      status: 200,
      headers,
    });
  } else {
    return new Response(
      JSON.stringify({ error: "Authentication failed" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}