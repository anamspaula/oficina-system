import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oficina Apollo Veículos - Login",
  description: "Sistema de gerenciamento para oficinas mecânicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* O AuthProvider envolve toda a aplicação */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}