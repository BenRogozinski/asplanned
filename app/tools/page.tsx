import BasePage from "@/components/basepage";
//import styles from "./page.module.css";
import { Metadata } from "next";

// Edge runtime mode for Cloudflare
export const runtime = 'edge';

export const metadata: Metadata = {
  title: "Tools"
};

export default function Tools() {
  return (
    <BasePage />
  )
}