import Aspen from "@/lib/aspen";
import { deleteSession } from "@/lib/session";
import { errorResponse } from "@/lib/api";

// Edge runtime mode for Cloudflare
export const runtime = "edge";

export async function GET() {
  try {
    const aspen = await Aspen.fromSession();

    // Log navigator out from Aspen
    if (aspen) {
      await aspen.get("/logout.do");
    }

    // Delete session from database
    await deleteSession();

    return new Response(null, { status: 200 });
  } catch (e) {
    return errorResponse(e);
  }
}