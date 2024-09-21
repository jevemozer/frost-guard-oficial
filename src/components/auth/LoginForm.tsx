"use client"; // Adicione esta linha

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <Card className="mx-auto max-w-sm shadow-lg border border-gray-200 rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Insira seu e-mail e senha abaixo para acessar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
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
            <div className="flex items-center">
              <Label htmlFor="password">Senha</Label>
              <Link href="/forgot-password" className="ml-auto text-sm underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
            Entrar
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{" "}
          <Link href="/register" className="underline">
            Cadastre-se
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
