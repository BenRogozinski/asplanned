import Aspen from "@/lib/aspen";
import { jsonResponse, errorResponse } from "@/lib/api";
import * as cheerio from "cheerio";

// Edge runtime mode for Cloudflare
export const runtime = "edge";

export async function GET() {
  const aspen = await Aspen.fromSession();

  try {
    const recentActivityData = await fetchRecentActivity(aspen);

    if (recentActivityData.length) {
      return jsonResponse(recentActivityData, 200);
    } else {
      return jsonResponse([
        "No recent activity!"
      ], 200);
    }
  } catch (e) {
    return errorResponse(e);
  }
}

async function fetchRecentActivity(aspen: Aspen): Promise<RecentActivityData[]> {
  await aspen.get(
    "/studentRecentActivityWidget.do?preferences=%3C?xml%20version=%221.0%22%20encoding=%22UTF-8%22?%3E%20%3Cpreference-set%3E%20%3Cpref%20id=%22dateRange%22%20type=%22int%22%3E2%3C/pref%3E%20%3C/preference-set%3E"
  );
  return aspen
  .document("recent-activity *")
  .map((_, element) => {
    const $ = cheerio.load(element);
    const date = $(element).attr("date");
    let activityData: RecentActivityData;

    switch (element.tagName) {
      case "attendance":
        activityData = {
          text: [
            `${date} - `,
            { bold: true, content: "Daily attendance posted" },
            ` (${$(element).attr("code")})`
          ],
          url: "#"
        };
        break;

      case "periodAttendance":
        activityData = {
          text: [
            `${date} - `,
            { bold: true, content: "Attendance posted" },
            " for ",
            { bold: true, content: $(element).attr("classname") || "" },
            ` (${$(element).attr("code")})`
          ],
          url: "#"
        };
        break;

      case "gradebookScore":
        activityData = {
          text: [
            `${date} - `,
            { bold: true, content: $(element).attr("assignmentname") || "" },
            " graded in ",
            { bold: true, content: $(element).attr("classname") || "" },
            ` (${$(element).attr("grade")} point`,
            $(element).attr("grade") !== "1" ? "s" : "",
            ")"
          ],
          url: `#${$(element).attr("assignmentoid")}`
        };
        break;

      case "gradePost":
        activityData = {
          text: [
            `${date} - `,
            {
              bold: true,
              content: `${$(element).attr("type") === "1" ? "Term" : "Progress"} grades posted`
            },
            " for ",
            { bold: true, content: $(element).attr("classname") || "" }
          ],
          url: "#"
        };
        break;

      default:
        activityData = {
          text: [
            `${date} - `,
            { bold: true, content: `Unknown activity (TAG: ${element.tagName})` }
          ]
        };
    }

    return { date: new Date(date || 0), data: activityData };
  })
  .get()
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .map((item) => item.data);
}

interface RecentActivityData {
  text: (string | { bold: boolean; content: string })[];
  url?: string;
}