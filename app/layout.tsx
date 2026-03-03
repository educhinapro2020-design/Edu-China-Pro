import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduChina Pro",
  description: "Your gateway to Chinese Universities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter)",

              fontSize: "14px",
              fontWeight: 500,
            },
            success: {
              style: {
                color: "var(--color-success)",
              },
              iconTheme: {
                primary: "var(--color-success)",
                secondary: "#ffffff",
              },
            },
            error: {
              style: {
                color: "var(--color-error)",
              },
              iconTheme: {
                primary: "var(--color-error)",
                secondary: "#ffffff",
              },
            },
          }}
        />
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
