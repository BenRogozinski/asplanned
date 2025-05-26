import { Cookie } from "tough-cookie";
import { AspenNavigator } from "../../../../lib/aspen";
import { z } from "zod";
import { newSession } from "@/lib/session";
import { trim } from "@/lib/parsers";
import { decodeImageResponse, nearestNeighborResize, encodeImageBase64 } from "@/lib/images";

// Edge runtime mode for Cloudflare
export const runtime = 'edge';

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
  try {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const aspenCookies = await aspen.getCookies();
    const cookies: Record<string, string> = {};
    for (const cookie of aspenCookies) {
      cookies[cookie.key] = cookie.value;
    }

    await aspen.navigate("/home.do");

    // AsPlanned token
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

    // Store Aspen username in cookie
    if (aspen.dom) {
      const asplannedUsername = trim(aspen.dom("#userPreferenceMenu").text());
      const asplannedUsernameCookie = new Cookie();
      asplannedUsernameCookie.key = "AsplannedUsername";
      asplannedUsernameCookie.path = "/";
      asplannedUsernameCookie.secure = true;
      asplannedUsernameCookie.value = asplannedUsername;
      headers.append("Set-Cookie", asplannedUsernameCookie.toString());
    }

    /*
      Get profile picture from Aspen, decode,
      resize to 44x44 pixels, then re-encode to
      base64 and set a cookie with the result.
      Prevents needing to make more requests to
      Aspen every time the profile picture has to
      be loaded.
    */
    await aspen.navigate("/portalStudentDetail.do?navkey=myInfo.details.detail");

    aspen.setField("userEvent", "2030");
    aspen.setField("userParam", "3");

    await aspen.submit();

    if (aspen.dom) {
      const imageUrl = aspen.dom(".templateTextSmall img").attr("src");
      if (imageUrl) {
        await aspen.navigate(imageUrl, false);
        if (aspen.response) {
          const decodedImage = await decodeImageResponse(aspen.response);
          const resizedImage = nearestNeighborResize(decodedImage, 28, 28);
          const encodedImage = encodeImageBase64(resizedImage, 50);

          const asplannedPfpCookie = new Cookie();
          asplannedPfpCookie.key = "AsplannedPfp";
          asplannedPfpCookie.path = "/";
          asplannedPfpCookie.secure = true;
          asplannedPfpCookie.value = encodedImage;
          headers.append("Set-Cookie", asplannedPfpCookie.toString());
        }
      }
    }

    return new Response(null, { status: 200, headers });
  } catch (e) {
    return handleError(e);
  }
}

// Helper function to handle errors
function handleError(e: unknown): Response {
  console.log(e);
  if (e instanceof Error) {
    return jsonResponse({ error: `Internal processing error: ${e.name}` }, 500);
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