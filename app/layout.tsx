import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TQ Task Tagger — Beamible Export",
  description: "Tag role tasks and export to Beamible — TQ Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
