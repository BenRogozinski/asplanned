import Aspen from "@/lib/aspen";
import { jsonResponse, errorResponse } from "@/lib/api";
import * as cheerio from "cheerio";

// Edge runtime mode for Cloudflare
export const runtime = "edge";

export async function GET() {
  const aspen = await Aspen.fromSession();

  try {
    const classesData = await fetchClasses(aspen);
    return jsonResponse(classesData, 200);
  } catch (e) {
    return errorResponse(e);
  }
}

async function fetchClasses(aspen: Aspen): Promise<ClassData[]> {
  await aspen.get("/portalClassList.do?navkey=academics.classes.list");

  return aspen
    .document(".listCell.listRowHeight")
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
          VIEWCLASSLINK: {
            url: `/#id=${$("td:nth-child(2)").attr("id") || ""}`,
            text: "View class >",
          },
        },
      };
    })
    .get();
}

interface ClassData {
  Name: string;
  Grade: string;
  expandedContent: {
    Teacher: string;
    Classroom: string;
    Absences: string;
    Tardies: string;
    VIEWCLASSLINK: {
      url: string;
      text: string;
    };
  };
}