import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; // Importamos el nuevo Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "S-Rank Arena | eSports",
  description: "Plataforma de torneos y progresión de Arena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#0b0e14] text-white min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer /> {/* Footer global añadido al final */}
      </body>
    </html>
  );
}