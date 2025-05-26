import BasePage from "@/components/BasePage/BasePage";
import DynamicList from "@/components/DynamicList/DynamicList";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import { getNavigator } from "@/lib/aspen";
import * as cheerio from "cheerio";
import Link from "next/link";
import React from "react";

const Home: React.FC = async () => {
  const aspen = await getNavigator();

  if (!aspen) {
    return;
  }

  // Get recent activity widget XML
  await aspen.navigate("/studentRecentActivityWidget.do?preferences=%3C?xml%20version=%221.0%22%20encoding=%22UTF-8%22?%3E%20%3Cpreference-set%3E%20%3Cpref%20id=%22dateRange%22%20type=%22int%22%3E2%3C/pref%3E%20%3C/preference-set%3E");

  // Recent activity mappings
  const activityListItems: React.ReactNode[] = aspen.dom("recent-activity *")
    .map((_, element) => {
      const $ = cheerio.load(element);
      const date = $(element).attr("date");
      let activityNode: React.ReactNode;

      if (element.tagName === "attendance") {
        activityNode = (
          <React.Fragment key={_}>
            {date} -{" "}
            <Link href={"#"}>
              <strong>Daily attendance posted</strong>{" "}
              ({$(element).attr("code")})
            </Link>
          </React.Fragment>
        )
      } else if (element.tagName === "periodattendance") {
        activityNode = (
          <React.Fragment key={_}>
            {date} -{" "}
            <Link href={`#id=${$(element).attr("sscoid")}`}>
              <strong>Attendance posted</strong> for{" "}
              <strong>{$(element).attr("classname")}</strong>{" "}
              ({$(element).attr("code")})
            </Link>

          </React.Fragment>
        )
      } else if (element.tagName === "gradebookscore") {
        activityNode = (
          <React.Fragment key={_}>
            {date} -{" "}
            <Link href={`#id=${$(element).attr("assignmentoid")}`}>
              <strong>{$(element).attr("assignmentname")}</strong> graded in{" "}
              <strong>{$(element).attr("classname")}</strong>{" "}
              (
              {$(element).attr("grade")} point
              {$(element).attr("grade") !== "1" ? "s" : ""}
              )
            </Link>

          </React.Fragment>
        )
      } else if (element.tagName === "gradepost") {
        activityNode = (
          <React.Fragment key={_}>
            {date} -{" "}
            <Link href={"#"}>            
              <strong>{ $(element).attr("type") === "1" ? "Term" : "Progress" }{" "}
              grades posted</strong> for {" "}
              <strong>{$(element).attr("classname")}</strong>
            </Link>
          </React.Fragment>
        )
      } else {
        activityNode = (
          <React.Fragment key={_}>
            {date} - <strong>Unknown activity</strong>
          </React.Fragment>
        )
      }
      
      return { date: new Date(date || 0), node: activityNode };
    })
    .get()
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(item => item.node);

  // Navigate to class list page
  await aspen.navigate("/portalClassList.do?navkey=academics.classes.list");

  const classTableData: Array<Record<string, React.ReactNode>> = aspen.dom(".listCell.listRowHeight")
    .map((_, element) => {
      const $ = cheerio.load(element);
      return {
        Name: $("td:nth-child(2)").text().trim(),
        Grade: $("td:nth-child(8)").text().trim(),
        expandedContent: (
          <React.Fragment>
            <p><strong>Teacher:</strong> {$("td:nth-child(3)").text().trim()}</p>
            <p><strong>Classroom:</strong> {$("td:nth-child(7)").text().trim()}</p>
            <p><strong>Absences:</strong> {$("td:nth-child(9)").text().trim()}</p>
            <p><strong>Tardies:</strong> {$("td:nth-child(10)").text().trim()}</p>
            <Link href={`/#id=${$("td:nth-child(2)").attr("id") || ""}`}>View class</Link>
          </React.Fragment>
        )
      };
    })
    .get();
  
  const classTableWidths = [ "auto", "80px" ];

  return (
    <BasePage>
      <DynamicTable
        title="Classes"
        data={classTableData}
        expandableRows={true}
        columnWidths={classTableWidths}
        colSpan={1}
      />
      <DynamicList
        title="Recent Activity"
        items={activityListItems}
        colSpan={1}
      />
    </BasePage>
  );
};

export default Home;