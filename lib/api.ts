// Functions for API routes

export function jsonResponse(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function unauthorizedResponse() {
  return jsonResponse({ error: "Authentication failed" }, 401);
}

export function errorResponse(error: unknown, userError: boolean = false) {
  const code = userError ? 400 : 500;
  if (error instanceof Error) {
    return jsonResponse({ error: error.message }, code);
  } else if (error instanceof String) {
    return jsonResponse({ error }, code)
  } else {
    return jsonResponse({ error: "Unknown error" }, code);
  }
}