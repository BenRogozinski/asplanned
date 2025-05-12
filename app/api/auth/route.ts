import { z } from "zod";

const LoginSchema = z.object({
  username: z.string().min(1, "Username is required").max(255, "Username too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(255, "Password too long"),
});

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch (error) {
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
      JSON.stringify({ errors: result.error.flatten().fieldErrors }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { username, password } = result.data;

  return new Response(null, {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}