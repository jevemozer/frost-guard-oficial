import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/lib/contexts/AuthContext';

// Carregamento das fontes locais
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadados do projeto
export const metadata: Metadata = {
  title: "Frost Guard",
  description: "Controle de manutenções para equipamentos de refrigeração",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Provider de autenticação para gerenciamento de sessão do usuário */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
