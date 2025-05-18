import BasePage from "@/components/BasePage/BasePage";
//import styles from "./page.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance"
};

export default function Attendance() {
  return (
    <BasePage />
  );
}