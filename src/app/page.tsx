import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Image
        className="dark:invert"
        src="https://nextjs.org/icons/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      <h1 className="text-3xl font-bold text-center">
        Bem-vindo ao Frost Guard!
      </h1>
      <p className="text-lg text-center">
        Sua ferramenta de controle de manutenções para equipamentos de refrigeração.
      </p>
    </div>
  );
}
