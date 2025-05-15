import { getSession } from "@/lib/session";
import { getNavigator } from "@/lib/aspen";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const aspen = await getNavigator(session);
  await aspen.navigate("/portalClassList.do");

  if (aspen.dom) {
    const tableText = aspen.dom("table").text();
    return new Response(JSON.stringify({ tableText }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
}