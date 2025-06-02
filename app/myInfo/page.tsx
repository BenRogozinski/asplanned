import BasePage from "@/components/BasePage/BasePage";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import TabbedContainer from "@/components/TabbedContainer/TabbedContainer";
import Aspen from "@/lib/aspen";
import { cleanSplit } from "@/lib/parsers";
import { Metadata } from "next";
import React from "react";
import * as cheerio from "cheerio";

export const metadata: Metadata = {
  title: "My Info",
};

const MyInfo: React.FC = async () => {
  const aspen = await Aspen.fromSession();

  // Fetch contacts data
  await aspen.get("/contextList.do?navkey=myInfo.con.list");
  const contactsTableData = aspen
    .document("#dataGrid tr.listCell")
    .map((_, element) => {
      const $ = cheerio.load(element);
      return {
        Name: $("td:nth-child(3)").text().trim(),
        Relationship: $("td:nth-child(4)").text().trim(),
        expandedContent: {
            Priority: $("td:nth-child(2)").text().trim(),
            "Primary phone #": $("td:nth-child(5)").text().trim(),
            "Secondary phone #": $("td:nth-child(6)").text().trim()
        },
      };
    })
    .get();

  // Fetch attendance data
  await aspen.get("/studentAttendanceList.do?navkey=myInfo.att.list");
  const attendanceTableData = aspen
    .document("#dataGrid tr.listCell")
    .map((_, element) => {
      const $ = cheerio.load(element);
      return {
        Date: <strong>{$("td:nth-child(2)").text().trim()}</strong>,
        Code: <strong>{$("td:nth-child(3)").text().trim()}</strong>,
      };
    })
    .get();

  // Fetch requests data
  await aspen.get("/studentRequestList.do?navkey=myInfo.req.req");
  const requestsText = aspen
    .document(".contentContainer > table:nth-child(5) > tbody:nth-child(1) > tr:nth-child(4)")
    .text()
    .trim();
  const requestsTableTitle = (
    <React.Fragment>
      <p>Class requests</p>
      <p style={{ fontSize: "16px" }}>{requestsText}</p>
    </React.Fragment>
  );
  const requestsTableData = aspen
    .document("#dataGrid tr.listCell")
    .map((_, element) => {
      const $ = cheerio.load(element);
      return {
        Class: <strong>{$("td:nth-child(3)").text().trim()}</strong>,
        expandedContent: (
          <React.Fragment>
            <p><strong>Alternate 1:</strong> {$("td:nth-child(4)").text().trim()}</p>
            <p><strong>Alternate 2:</strong> {$("td:nth-child(6)").text().trim()}</p>
          </React.Fragment>
        )
      };
    })
    .get();

  return (
    <BasePage>
      <TabbedContainer
        tabNames={["My Details", "Transcript", "Schedule", "Contacts", "Attendance", "Requests"]}
        colSpan={2}
        >
        { /* My Details */ }
        <TabbedContainer
          direction="vertical"
          tabNames={["Demographics", "Addresses"]}
          colSpan={2}
        >
          { /* Demographics */ }
          <DynamicTable dataUrl="/api/details" multiPartKey="demographics" colSpan={2} />
          { /* Addresses */ }
          <React.Fragment>
            <DynamicTable title="Physical Address"  dataUrl="/api/details" multiPartKey="physicalAddress" />
            <DynamicTable title="Mailing Address"  dataUrl="/api/details" multiPartKey="mailingAddress" />
          </React.Fragment>
        </TabbedContainer>
        { /* Transcript */ }
        <h1>Nothing here yet!</h1>
        { /* Schedule */ }
        <DynamicTable title="Today's schedule" dataUrl="/api/schedule" colSpan={2} />
        { /* Contacts */ }
        <DynamicTable title="Contacts" data={contactsTableData} expandableRows colSpan={2} />
        { /* Attendance */ }
        <DynamicTable title="Attendance" data={attendanceTableData} colSpan={2} />
        { /* Requests */ }
        <DynamicTable title={requestsTableTitle} data={requestsTableData} expandableRows />
      </TabbedContainer>
    </BasePage>
  );
};

export default MyInfo;