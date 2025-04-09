import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NEAR Protocol Rewards Dashboard",
  description: "Dashboard para visualização de recompensas do NEAR Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white text-black min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
