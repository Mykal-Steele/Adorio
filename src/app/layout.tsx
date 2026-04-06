import type { Metadata } from "next";
import { Permanent_Marker, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import {
  DEFAULT_SOCIAL_THEME,
  SOCIAL_THEME_IDS,
  SOCIAL_THEME_STORAGE_KEY,
} from "@/lib/theme";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
});

export const metadata: Metadata = {
  title: "New Adorio",
  description: "Portfolio and community board",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ backgroundColor: "#000" }}
    >
      <body
        className={`${poppins.variable} ${marker.variable} font-poppins`}
        style={{ backgroundColor: "#000" }}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_SOCIAL_THEME}
          themes={SOCIAL_THEME_IDS}
          storageKey={SOCIAL_THEME_STORAGE_KEY}
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
