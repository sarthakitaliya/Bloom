import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Bloom",
  description: "Build stunning websites with AI.",
  alternates: {
    canonical: "https://bloom.sxrk.tech/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} bg-background text-primary font-sans antialiased h-screen w-full overflow-hidden flex flex-col selection:bg-indigo-500/20 selection:text-indigo-200`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid opacity-[0.07]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] bg-indigo-900/10 rounded-full blur-[120px] opacity-40"></div>
        </div>
        {children}
        <Toaster position="top-center" theme="dark" closeButton richColors />
      </body>
    </html>
  );
}
