import BasePage from "@/components/basepage";
//import styles from "./page.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar"
};

export default function Calendar() {
  return (
    <BasePage />
  );
}