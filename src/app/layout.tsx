import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import Script from "next/script";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gotoo Move | Studio Fitness",
  description: "Treinamentos de musculação, corrida e funcional com suporte em vídeo profissional.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  other: {
    "facebook-domain-verification": "vum68cax8rz3u0hdc9hev37cso7leg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR} appearance={{ baseTheme: dark }} afterSignOutUrl="/">
      <html lang="pt-BR">
        <head>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '945276428426892');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src="https://www.facebook.com/tr?id=945276428426892&ev=PageView&noscript=1"
            />
          </noscript>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Navbar />
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
