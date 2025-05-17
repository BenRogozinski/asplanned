import BasePage from "@/components/basepage";
import styles from "./page.module.css";
import { getNavigator } from "@/lib/aspen";
import { getSession } from "@/lib/session";
import Image from "next/image";
import trim from "@/lib/trim";
import LoginPage from "@/components/login";
import * as cheerio from "cheerio";
import React from "react";
import Script from "next/script";

export default async function Home() {
  try {
    const session = await getSession();
    if (session) {
      const aspen = await getNavigator(session);
      await aspen.navigate("/portalClassList.do?navkey=academics.classes.list");
      const $ = aspen.dom;

      if (!$) {
        throw new Error("Failed to load DOM from Aspen.");
      }

      const classRows: React.ReactNode[] = [];
      $(".listCell.listRowHeight").each((index, element) => {
        const row = cheerio.load(element);
        const aspenId = row("td:nth-child(2)").attr("id") || null;
        classRows.push(
          <tr key={index} data-id={aspenId} className={styles.classrow}>
            <td className={styles.classcolumn}>
              <div className={styles.classname}>
                <Image
                  src="/arrow.svg"
                  alt="Arrow"
                  width={20}
                  height={20}
                  priority
                  className={`${styles.arrow}`}
                  id={`arrow-${aspenId}`}
                />
                <p>{trim(row("td:nth-child(2)").text())}</p>
              </div>
              <div className={styles.classinfo} id={`classinfo-${aspenId}`}>
                <p>Teacher: {trim(row("td:nth-child(3)").text())}</p>
                <p>Classroom: {trim(row("td:nth-child(7)").text()) || "N/A"}</p>
                <p>Absences: {trim(row("td:nth-child(9)").text())}</p>
                <p>Tardies: {trim(row("td:nth-child(10)").text())}</p>
              </div>
            </td>
            <td><p>{trim(row("td:nth-child(8)").text()) || "N/A"}</p></td>
          </tr>
        );
      });

      return (
        <BasePage username={trim($("#userPreferenceMenu").text()) || "N/A"}>
          <h1>Classes</h1>
          <table className={styles.gradetable}>
            <thead>
              <tr>
                <th>Class</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>{classRows}</tbody>
          </table>
          <Script strategy="afterInteractive">
            {`
              const rows = document.querySelectorAll("tr[data-id]");
              rows.forEach((row) => {
                row.addEventListener("click", (event) => {
                  const id = event.target.closest("tr").getAttribute("data-id");
                  const arrow = document.getElementById(\`arrow-\${id}\`);
                  const classinfo = document.getElementById(\`classinfo-\${id}\`);
                  if (arrow) {
                    arrow.classList.toggle("${styles.rotated}");
                  }
                  if (classinfo) {
                    classinfo.classList.toggle("${styles.shown}");
                  }
                });
              });
            `}
          </Script>
        </BasePage>
      );
    } else {
      return <LoginPage />;
    }
  } catch (error) {
    console.error("Error loading classes:", error);
    return (
      <BasePage>
        <h1>Error</h1>
        <p>There was an issue loading your classes. Please try again later.</p>
      </BasePage>
    );
  }
}