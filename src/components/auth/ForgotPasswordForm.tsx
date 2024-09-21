"use client"; // Adicione esta linha

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Verifique seu e-mail para redefinir sua senha.");
    }
    
    setLoading(false);
  };

  return (
    <Card className="mx-auto max-w-sm shadow-lg border border-gray-200 rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
        <CardDescription>
          Insira seu e-mail abaixo para redefinir sua senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleForgotPassword} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
          </div>
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Link de Redefinição"}
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
}
