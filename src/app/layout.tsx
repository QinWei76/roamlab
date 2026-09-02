import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoamLab",
  description:
    "Plan smarter. Prepare better. Go further. Share cooler.",
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
