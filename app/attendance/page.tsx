import BasePage from "@/components/basepage";
//import styles from "./page.module.css";
import { Metadata } from "next";

// Edge runtime mode for Cloudflare
export const runtime = 'edge';

export const metadata: Metadata = {
  title: "Attendance"
};

export default function Attendance() {
  return (
    <BasePage />
  );
}