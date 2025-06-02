import { Cookie } from "tough-cookie";
import Aspen from "@/lib/aspen";
import { z } from "zod";
import { newSession } from "@/lib/session";
import { decodeImageResponse, nearestNeighborResize, encodeImageBase64 } from "@/lib/images";
import { errorResponse, unauthorizedResponse } from "@/lib/api";

// Edge runtime mode for Cloudflare
export const runtime = "edge";

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
    return errorResponse("Invalid JSON payload", true);
  }

  // Validate the request body
  const result = LoginSchema.safeParse(body);
  if (!result.success) {
    return errorResponse("Malformed request", true);
  }

  const { username, password } = result.data;
  const aspen = new Aspen();

  // Attempt login
  try {
    await aspen.get("/logon.do");
    aspen.form.set("username", username);
    aspen.form.set("password", password);
    await aspen.submitForm();
  } catch (e) {
    return handleError(e);
  }

  // Check if login was successful
  if (aspen.url.endsWith("/home.do")) {
    return handleSuccessfulLogin(aspen);
  } else {
    return unauthorizedResponse();
  }
}

// Helper function to handle successful login
async function handleSuccessfulLogin(aspen: Aspen): Promise<Response> {
  try {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    const aspenCookies = await aspen.dumpCookies();
    const cookies: Record<string, string> = {};
    for (const cookie of aspenCookies) {
      cookies[cookie.key] = cookie.value;
    }

    await aspen.get("/home.do");

    // AsPlanned token
    const asplannedTokenCookie = new Cookie();
    asplannedTokenCookie.key = "AsplannedToken";
    asplannedTokenCookie.path = "/";
    asplannedTokenCookie.secure = false;
    asplannedTokenCookie.value = await newSession(
      cookies.AspenCookie || "",
      cookies.JSESSIONID || "",
      aspen.form.get("org.apache.struts.taglib.html.TOKEN")?.toString() || ""
    );
    headers.append("Set-Cookie", asplannedTokenCookie.toString());

    // Get Aspen username
    const username = aspen.document("#userPreferenceMenu").text().trim();

    /*
      Get profile picture from Aspen, decode,
      resize to 44x44 pixels, then re-encode to
      base64. Prevents needing to make more
      requests to Aspen every time the profile
      picture has to be loaded.
    */
    await aspen.get("/portalStudentDetail.do?navkey=myInfo.details.detail");

    aspen.form.set("userEvent", "2030");
    aspen.form.set("userParam", "3");

    await aspen.submitForm();

    let profilePictureBase64: string = "";
    const imageUrl = aspen.document(".templateTextSmall img").attr("src");
    if (imageUrl) {
      await aspen.get(imageUrl);
      if (aspen.response) {
        const decodedImage = await decodeImageResponse(aspen.response);
        const resizedImage = nearestNeighborResize(decodedImage, 28, 28);
        profilePictureBase64 = encodeImageBase64(resizedImage, 50);
      }
    }

    return new Response(JSON.stringify({
      username,
      profilePictureBase64
    }), { status: 200, headers });
  } catch (e) {
    return handleError(e);
  }
}

// Helper function to handle errors
function handleError(e: unknown): Response {
  console.log(e);
  if (e instanceof Error) {
    return errorResponse(`Internal processing error: ${e.name}`);
  }
  return errorResponse("Internal processing error");
}