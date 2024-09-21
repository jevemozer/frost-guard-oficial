"use client"; // Adicione esta linha no topo

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validação simples
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("E-mail inválido.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, avatar_url: "" }, // Adicione o URL do avatar depois
      },
    });

    if (signupError) {
      setError(signupError.message);
    } else {
      setSuccess("Cadastro realizado com sucesso!");
    }

    setLoading(false);
  };

  return (
    <Card className="mx-auto max-w-sm shadow-lg border border-gray-200 rounded-lg">
      <CardHeader className="items-center justify-center">
        <CardTitle className="text-2xl">Cadastrar</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para criar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu Nome"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
          </div>
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600" disabled={loading}>
            {loading ? "Criando Conta..." : "Criar Conta"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Já tem uma conta?{" "}
          <Link href="/login" className="underline">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
