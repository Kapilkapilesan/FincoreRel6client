import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keep fonts
import "./globals.css";
import { MainLayout } from "../components/layout/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinCore LMS",
  description: "Microfinance Loan Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 transition-colors`}
      >
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem("theme");
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = storedTheme === "dark" || (!storedTheme && prefersDark);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        /> */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
