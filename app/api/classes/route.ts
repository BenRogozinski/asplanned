import { getNavigator } from "@/lib/aspen";
import { jsonResponse, unauthorizedResponse, errorResponse } from "@/lib/api";
import * as cheerio from "cheerio";

// Edge runtime mode for Cloudflare
export const runtime = "edge";

export async function GET() {
  const aspen = await getNavigator();
  if (!aspen) return unauthorizedResponse();

  try {
    // Navigate to classes page
    await aspen.navigate("/portalClassList.do?navkey=academics.classes.list");
    if (!aspen.dom) {
      return errorResponse("Failed to load DOM from Aspen");
    }

    const classesData = aspen
      .dom(".listCell.listRowHeight")
      .map((_, element) => {
        const $ = cheerio.load(element);
        return {
          Name: $("td:nth-child(2)").text().trim(),
          Grade: $("td:nth-child(8)").text().trim(),
          expandedContent: {
            Teacher: $("td:nth-child(3)").text().trim(),
            Classroom: $("td:nth-child(7)").text().trim(),
            Absences: $("td:nth-child(9)").text().trim(),
            Tardies: $("td:nth-child(10)").text().trim(),
            VIEWCLASSURL: {
              url: `/#id=${$("td:nth-child(2)").attr("id") || ""}`,
              text: "View class >"
            }
          }
        };
      })
      .get();
    
    return jsonResponse(classesData, 200);

  } catch (e) {
    return errorResponse(e);
  }
}