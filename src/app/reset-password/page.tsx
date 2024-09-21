// src/app/reset-password/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    if (token) {
      setAccessToken(token);
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!accessToken) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ResetPasswordForm accessToken={accessToken} /> {/* Passando accessToken */}
    </div>
  );
};

export default ResetPasswordPage;
