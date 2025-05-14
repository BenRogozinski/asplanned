import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LoginPage from "@/components/login";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "AsPlanned", template: "%s | AsPlanned"},
  description: "AsPlanned: Take charge of your classes!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieJar = await cookies();
  const token = cookieJar.get("AsplannedToken")?.value || "";
  if (!(token && await getSession(token))) {
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