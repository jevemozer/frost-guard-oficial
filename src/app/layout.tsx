import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/lib/contexts/AuthContext'; 
import { LayoutContent } from '@/components/LayoutContent';
import { ThemeProvider } from "@/components/theme/ThemeProvider";  
import { ModeToggle } from "@/components/theme/ModeToggle";  // Importando o ModeToggle

export const metadata: Metadata = {
  title: "Frost Guard",
  description: "Controle de manutenções para equipamentos de refrigeração",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-background text-foreground`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {/* Botão de alternância de tema com posicionamento absoluto */}
              <div className="fixed top-4 right-4 z-50">
                <ModeToggle /> {/* Botão de alternar tema */}
              </div>
              <LayoutContent>{children}</LayoutContent>
               </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
