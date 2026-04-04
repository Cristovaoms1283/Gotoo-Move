import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gotoo Move | Studio Fitness",
  description: "Treinamentos de musculação, corrida e funcional com suporte em vídeo profissional.",
};

import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }} afterSignOutUrl="/">
      <html lang="pt-BR">
        <body className="antialiased">
          <Toaster position="top-center" richColors theme="dark" />
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
