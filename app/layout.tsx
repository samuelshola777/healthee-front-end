import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  title: "HEALTHEE — Good days. Start juicy.",
  description:
    "Five flavours. Find your favourite. Explore Orange, Watermelon, Pineapple, Zobo and Tigernut.",
  icons: { icon: "/assets/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#0f2a1b" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
