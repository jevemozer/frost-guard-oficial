"use client"; // Isso transforma o componente em um Client Component

import Image from "next/image";
import { Button } from "@/components/ui/button"; // Importa o botão do Shadcn UI
import { useRouter } from "next/navigation"; // Hook para navegação

export default function Home() {
  const router = useRouter();

  const goToHome = () => {
    router.push('/dashboard'); // Redireciona para a home
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[var(--font-geist-sans)] bg-primary-foreground text-primary-foreground">
      <Image
        className="dark:invert"
        src="https://nextjs.org/icons/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      <h1 className="text-3xl font-bold text-center text-primary">
        Bem-vindo ao Frost Guard!
      </h1>
      <p className="text-lg text-center text-primary">
        Sua ferramenta de controle de manutenções para equipamentos de refrigeração.
      </p>
      
      {/* Botão estilizado de acordo com o CSS global */}
      <Button
        onClick={goToHome}
        className="bg-emerald-400 hover:bg-emerald-400 font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 text-primary"
      >
        Clique aqui para começar!
      </Button>
    </div>
  );
}
