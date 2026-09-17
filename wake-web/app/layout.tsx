import type { Metadata } from "next";
import { Lora, Inter, IBM_Plex_Mono } from "next/font/google";
import { StoreHydration } from "@/components/StoreHydration";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Wake — Follow a proven trader. Keep your keys.",
  description:
    "Wake reads Stellar's public ledger, ranks the wallets that actually perform, and mirrors the ones you pick — sized to limits you set, signed by you. Non-custodial by construction.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-wake-ink">
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}
