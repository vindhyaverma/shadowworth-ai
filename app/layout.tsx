import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadowWorth AI | Your Habits Are Pricing Your Future",
  description:
    "A cinematic AI psychological mirror that estimates invisible financial damage from behavior, procrastination, spending, and attention leaks.",
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
