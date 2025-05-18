import BasePage from "@/components/BasePage/BasePage";
import { getNavigator } from "@/lib/aspen";
import trim from "@/lib/trim";
import * as cheerio from "cheerio";
import React from "react";
import ClassTable, { ClassInformation } from "@/components/ClassTable/ClassTable";

export default async function Home() {
  const aspen = await getNavigator();

  // Navigate to class list page
  await aspen.navigate("/portalClassList.do?navkey=academics.classes.list");
  if (!aspen.dom) {
    throw new Error("Failed to load DOM from Aspen. Ensure the page is accessible.");
  }

  // Create array of class information from scraped table
  const classInformation: ClassInformation[] = aspen.dom(".listCell.listRowHeight")
    .map((_, element) => {
      const row = cheerio.load(element);
      return {
        id: row("td:nth-child(2)").attr("id") || "",
        name: trim(row("td:nth-child(2)").text()),
        teacher: trim(row("td:nth-child(3)").text()),
        classroom: trim(row("td:nth-child(7)").text()),
        grade: trim(row("td:nth-child(8)").text()),
        absences: trim(row("td:nth-child(9)").text()),
        tardies: trim(row("td:nth-child(10)").text()),
      };
    })
    .get(); // Convert cheerio object to array

  return (
    <BasePage>
      <h1>Classes</h1>
      <ClassTable classInformation={classInformation} />
    </BasePage>
  );
}