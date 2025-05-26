import BasePage from "@/components/BasePage/BasePage";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import TabbedContainer from "@/components/TabbedContainer/TabbedContainer";
import { getNavigator } from "@/lib/aspen";
import { cleanSplit } from "@/lib/parsers";
import { Metadata } from "next";
import React from "react";
import * as cheerio from "cheerio"

export const metadata: Metadata = {
  title: "My Info"
};

const MyInfo: React.FC = async () => {
  const aspen = await getNavigator();

  if (!aspen) {
    return;
  }

  // Get demographics data
  await aspen.navigate("/portalStudentDetail.do?navkey=myInfo.details.detail");
  const demographicsTableData: Array<Record<string, React.ReactNode>> = aspen.dom("tr[id^='Property']")
    .map((_, element) => {
      const $ = cheerio.load(element);
      const alertTitles = $("img").map((_, image) => image.attribs["title"]).get().join(", ");

      return {
        Field: $(".detailProperty").text().trim(),
        Value: <strong>{$(".detailValue").text().trim()}{alertTitles && alertTitles}</strong>,
      };
    })
    .get();

  // Get address data
  aspen.setField("userEvent", "2030");
  aspen.setField("userParam", "1");
  await aspen.submit();

  // Extract physical and mailing address data
  const addressTables = aspen.dom("table[id^='Column']").toArray();

  const physicalAddressTableData = cheerio.load(addressTables[0])("tr[id^='Property']")
    .map((_, field) => {
      const $ = cheerio.load(field);
      return {
        Field: $(".detailProperty").text().trim(),
        Value: $(".detailValue").text().trim(),
      };
    })
    .get();

  const mailingAddressTableData = cheerio.load(addressTables[1])("tr[id^='Property']")
    .map((_, field) => {
      const $ = cheerio.load(field);
      return {
        Field: $(".detailProperty").text().trim(),
        Value: $(".detailValue").text().trim(),
      };
    })
    .get();
  
  // Get schedule data
  await aspen.navigate("/studentScheduleContextList.do?navkey=myInfo.sch.list", false, false);
  aspen.setField("userEvent", "2000");
  aspen.setField("matrixDate", "5/7/2025");
  await aspen.submit();

  const scheduleRows = aspen.dom("table[cellspacing='1']>tbody>tr:not([class^='listHeader'])");

  const scheduleTableData = scheduleRows
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
              {classDetails.slice(1).map((str, idx) => {
                if (idx === 0) {
                  return <strong key={idx}>{str}<br /></strong>;
                } else {
                  return <React.Fragment key={idx}>{str}<br /></React.Fragment>;
                }
              })}
            </React.Fragment>
          );
        })
        .get();


      return {
        Time: classTime,
        Classes: classes
      };
    })
    .get();
  
  return (
    <BasePage>
      <TabbedContainer
      direction="horizontal"
        tabNames={["Demographics", "Addresses", "Schedule", "Contacts", "Attendance", "Requests"]}
        colSpan={2}
      >
        {/* Demographics */}
        <DynamicTable
          data={demographicsTableData}
          colSpan={2}
        />

        {/* Addresses */}
        <React.Fragment>
          <DynamicTable
            title="Physical Address"
            data={physicalAddressTableData}
          />
          <DynamicTable
            title="Mailing Address"
            data={mailingAddressTableData}
          />
        </React.Fragment>

        {/* Schedule */}
        <DynamicTable
          title="Current Schedule"
          data={scheduleTableData}
          colSpan={2}
        />
      </TabbedContainer>
    </BasePage>
  );
};

export default MyInfo;