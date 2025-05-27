import BasePage from "@/components/BasePage/BasePage";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import TabbedContainer from "@/components/TabbedContainer/TabbedContainer";
import { getNavigator } from "@/lib/aspen";
import { cleanSplit } from "@/lib/parsers";
import { Metadata } from "next";
import React from "react";
import * as cheerio from "cheerio";
import DynamicList from "@/components/DynamicList/DynamicList";

export const metadata: Metadata = {
  title: "My Info",
};

const MyInfo: React.FC = async () => {
  const aspen = await getNavigator();
  if (!aspen) return;

  // Fetch demographics data
  await aspen.navigate("/portalStudentDetail.do?navkey=myInfo.details.detail");
  const demographicsTableData = aspen
    .dom("tr[id^='Property']")
    .map((_, element) => {
      const $ = cheerio.load(element);
      const alertTitles = $("img")
        .map((_, image) => image.attribs["title"])
        .get()
        .join(", ");
      return {
        Field: $(".detailProperty").text().trim(),
        Value: (
          <strong>
            {$(".detailValue").text().trim()}
            {alertTitles && alertTitles}
          </strong>
        ),
      };
    })
    .get();

  // Fetch address data
  aspen.setField("userEvent", "2030");
  aspen.setField("userParam", "1");
  await aspen.submit();

  const addressTables = aspen.dom("table[id^='Column']").toArray();
  const extractAddressData = (table: cheerio.CheerioAPI) =>
    table("tr[id^='Property']")
      .map((_, field) => {
        const $ = cheerio.load(field);
        return {
          Field: $(".detailProperty").text().trim(),
          Value: $(".detailValue").text().trim(),
        };
      })
      .get();

  const physicalAddressTableData = extractAddressData(cheerio.load(addressTables[0]));
  const mailingAddressTableData = extractAddressData(cheerio.load(addressTables[1]));

  // Fetch schedule data
  await aspen.navigate("/studentScheduleContextList.do?navkey=myInfo.sch.list", true, true);
  const scheduleTableData = aspen
    .dom("table[cellspacing='1']>tbody>tr:not([class^='listHeader'])")
    .map((_, element) => {
      const $ = cheerio.load(element);
      const classTime = cleanSplit($("td").text())[1];
      const classes = $("td")
        .next()
        .find("table>tbody>tr:nth-child(odd)")
        .map((_, cls) => {
          const classDetails = cleanSplit(cheerio.load(cls)("td").html() || "", "<br>");
          return (
            <React.Fragment key={_}>
              {classDetails.slice(1).map((str, idx) =>
                idx === 0 ? (
                  <strong key={idx}>{str}<br /></strong>
                ) : (
                  <React.Fragment key={idx}>{str}<br /></React.Fragment>
                )
              )}
            </React.Fragment>
          );
        })
        .get();
      return { Time: classTime, Classes: classes };
    })
    .get();

  // Fetch contacts data
  await aspen.navigate("/contextList.do?navkey=myInfo.con.list");
  const contactsTableData = aspen
    .dom("#dataGrid tr.listCell")
    .map((_, element) => {
      const $ = cheerio.load(element);
      return {
        Name: $("td:nth-child(3)").text().trim(),
        Relationship: $("td:nth-child(4)").text().trim(),
        expandedContent: (
          <React.Fragment>
            <p><strong>Priority:</strong> {$("td:nth-child(2)").text().trim()}</p>
            <p><strong>Primary phone #:</strong> {$("td:nth-child(5)").text().trim()}</p>
            <p><strong>Secondary phone #:</strong> {$("td:nth-child(6)").text().trim()}</p>
          </React.Fragment>
        ),
      };
    })
    .get();

  // Fetch attendance data
  await aspen.navigate("/studentAttendanceList.do?navkey=myInfo.att.list");
  const attendanceTableData = aspen
    .dom("#dataGrid tr.listCell")
    .map((_, element) => {
      const $ = cheerio.load(element);
      return {
        Date: <strong>{$("td:nth-child(2)").text().trim()}</strong>,
        Code: <strong>{$("td:nth-child(3)").text().trim()}</strong>,
      };
    })
    .get();

  // Fetch requests data
  await aspen.navigate("/studentRequestList.do?navkey=myInfo.req.req");
  const requestsText = aspen
    .dom(".contentContainer > table:nth-child(5) > tbody:nth-child(1) > tr:nth-child(4)")
    .text()
    .trim();
  const requestsTableTitle = (
    <React.Fragment>
      <p>Class requests</p>
      <p style={{ fontSize: "16px" }}>{requestsText}</p>
    </React.Fragment>
  );
  const requestsTableData = aspen
    .dom("#dataGrid tr.listCell")
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
        direction="vertical"
        tabNames={["My Details", "Transcript", "Schedule", "Contacts", "Attendance", "Requests"]}
        colSpan={2}
      >
        { /* My Details */ }
        <TabbedContainer
          tabNames={["Demographics", "Addresses", "Ethnicity", "Photo", "Documents"]}
          colSpan={2}
        >
          { /* Demographics */ }
          <DynamicTable data={demographicsTableData} colSpan={2} />
          { /* Addresses */ }
          <React.Fragment>
            <DynamicTable title="Physical Address" data={physicalAddressTableData} />
            <DynamicTable title="Mailing Address" data={mailingAddressTableData} />
          </React.Fragment>
        </TabbedContainer>
        { /* Transcript */ }
        <h1>Nothing here yet!</h1>
        { /* Schedule */ }
        {scheduleTableData.length ? (
          <DynamicTable title="Today's schedule" data={scheduleTableData} colSpan={2} />
        ) : (
          <h1>No classes scheduled for today!</h1>
        )}
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