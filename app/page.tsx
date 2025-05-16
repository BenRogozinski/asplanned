import BasePage from "@/components/basepage";
import styles from "./page.module.css";
import { getNavigator } from "@/lib/aspen";
import { getSession } from "@/lib/session";
import trim from "@/lib/trim";
import LoginPage from "@/components/login";
import * as cheerio from "cheerio";
import React from "react";

// Edge runtime mode for Cloudflare
export const runtime = 'edge';

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
        classRows.push(
          <tr key={index} data-aspen-id={row("td:nth-child(2)").attr("id")}>
            <td>{trim(row("td:nth-child(2)").text())}</td>
            <td>{trim(row("td:nth-child(8)").text()) || "N/A"}</td>
          </tr>
        );
      });

      return (
        <BasePage>
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