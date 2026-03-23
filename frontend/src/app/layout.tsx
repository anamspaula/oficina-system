import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

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
        <AuthProvider>
          <DataProvider> 
            {/* Agora o Dashboard e todas as outras telas 
                terão acesso aos dados das OS e Veículos */}
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}