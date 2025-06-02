import Aspen from "@/lib/aspen";
import { jsonResponse, errorResponse } from "@/lib/api";
import * as cheerio from "cheerio";
import { cleanSplit } from "@/lib/parsers";

// Edge runtime mode for Cloudflare
export const runtime = "edge";

export async function GET() {
  const aspen = await Aspen.fromSession();

  try {
    const scheduleData = await fetchSchedule(aspen);

    if (scheduleData.length) {
      return jsonResponse(scheduleData, 200);
    } else {
      return jsonResponse([{
        Message: "No classes scheduled for today!"
      }], 200);
    }
  } catch (e) {
    return errorResponse(e);
  }
}

async function fetchSchedule(aspen: Aspen) {
  await aspen.get("/studentScheduleContextList.do?navkey=myInfo.sch.list");

  return aspen
    .document("table[cellspacing='1']>tbody>tr:not([class^='listHeader'])")
    .map((_, element) => {
      const $ = cheerio.load(element);
      const classTime = cleanSplit($("td").text())[1];
      const classes = $("td")
        .next()
        .find("table>tbody>tr:nth-child(odd)")
        .map((_, cls) => (
          cheerio.load(cls)("td")
            .html()
            ?.split(/<br\s*\/?>/i)
            .map(line => line.trim())
            .slice(1)
            .join("\n")
        ))
        .get()
        .join("\n");
      return { Time: classTime, Classes: classes };
    })
    .get();
}