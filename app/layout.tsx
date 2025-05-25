import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LoginPage from "@/components/LoginPage/LoginPage";
import { getSession } from "@/lib/session";
import "./globals.css";

// Edge runtime mode for Cloudflare
export const runtime = 'edge';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "AsPlanned", template: "%s | AsPlanned" },
  description: "AsPlanned: Take charge of your classes!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(await getSession())) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <LoginPage />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}