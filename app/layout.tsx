import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "S-Rank Arena | eSports",
  description: "Tournament platform and Arena competitive progression",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0b0e14] text-white min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer /> 
      </body>
    </html>
  );
}