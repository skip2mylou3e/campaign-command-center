import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/common/Sidebar";
import MigrationRunner from "@/components/MigrationRunner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Campaign Command Center — Dye & Durham",
  description: "Digital advertising strategy tool for the Dye & Durham marketing team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-dd-gray-light`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto pt-14 md:pt-0">
            <MigrationRunner>
              {children}
            </MigrationRunner>
          </main>
        </div>
      </body>
    </html>
  );
}
