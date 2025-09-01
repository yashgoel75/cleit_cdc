import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cleit - Career Development Centre | VIPS-TC",
  description:
    "Cleit is the official career platform of VIPS, built with the Career Development Centre (CDC), offering students a single space to explore placements, internships, assessments, and job opportunities while staying updated and empowered for professional growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
