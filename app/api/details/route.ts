import Aspen from "@/lib/aspen";
import { jsonResponse, errorResponse } from "@/lib/api";
import { parseTableData } from "@/lib/aspen";
import * as cheerio from "cheerio";

// Edge runtime mode for Cloudflare
export const runtime = "edge";

export async function GET() {
  const aspen = await Aspen.fromSession();

  try {
    const demographicsData = await fetchDemographics(aspen);
    const { PhysicalAddress: physicalAddress, MailingAddress: mailingAddress } = await fetchAddresses(aspen);
    return jsonResponse({
      demographics: demographicsData,
      physicalAddress,
      mailingAddress
    }, 200);
  } catch (e) {
    return errorResponse(e);
  }
}

// Demographics data
async function fetchDemographics(aspen: Aspen) {
  await aspen.get("/portalStudentDetail.do?navkey=myInfo.details.detail");
  return parseTableData(aspen.document, "details");
}


// Physical and mailing address data
async function fetchAddresses(aspen: Aspen) {
  aspen.form.set("userEvent", "2030");
  aspen.form.set("userParam", "1");
  await aspen.submitForm();
  const addressTables = aspen.document("table[id^='Column']").toArray();
  return {
    PhysicalAddress: parseTableData(cheerio.load(addressTables[0]), "details"),
    MailingAddress: parseTableData(cheerio.load(addressTables[1]), "details")
  }
}