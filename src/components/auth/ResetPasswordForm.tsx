// src/components/auth/ResetPasswordForm.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface ResetPasswordFormProps {
  accessToken: string; // Adicionando a propriedade accessToken
}

export const ResetPasswordForm = ({ accessToken }: ResetPasswordFormProps) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    // Redefina a senha
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      access_token: accessToken, // Incluindo o accessToken
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Senha redefinida com sucesso! Você pode entrar agora.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <Card className="mx-auto max-w-sm shadow-lg border border-gray-200 rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
        <CardDescription>Insira sua nova senha abaixo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nova Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirmar Senha"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Lembrou da sua senha?{" "}
          <Link href="/login" className="underline">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
