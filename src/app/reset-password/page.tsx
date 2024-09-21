// src/app/reset-password/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Usar window.location.hash para pegar o token após o '#'
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove o '#' e utiliza URLSearchParams
    const token = params.get("access_token");
    
    if (token) {
      setAccessToken(token);
    } else {
      // Se não houver token, redireciona para a página de login
      router.push("/login");
    }
  }, [router]);

  if (!accessToken) {
    return <p>Carregando...</p>; // Exibe uma mensagem enquanto o token é carregado
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ResetPasswordForm accessToken={accessToken} />
    </div>
  );
};

export default ResetPasswordPage;
