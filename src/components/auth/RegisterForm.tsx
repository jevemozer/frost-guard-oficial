"use client"; // Adicione esta linha no topo

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // Importando useRouter
import md5 from 'md5'; // Importando md5 para gerar o hash do e-mail

export function RegisterForm() {
  const router = useRouter(); // Inicializando useRouter
  const [fullName, setFullName] = useState(""); // Renomeando para fullName
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

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, avatar_url: "" }, // URL do avatar será definida depois
      },
    });

    if (signupError) {
      setError(signupError.message);
    } else {
      // Verificando se data.user não é null
      if (data.user) {
        // Gerar uma URL de avatar a partir do e-mail usando Gravatar
        const gravatarHash = md5(email.trim().toLowerCase());
        const avatarUrl = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon`;

        // Salvar o perfil na tabela profile
        const { error: profileError } = await supabase
          .from('profile') // Alterando para a tabela correta
          .insert([{ id: data.user.id, full_name: fullName, email, avatar_url: avatarUrl }]); // Adicionando a URL do avatar

        if (profileError) {
          setError("Erro ao criar perfil: " + profileError.message);
        } else {
          setSuccess("Cadastro realizado com sucesso!");
          setTimeout(() => {
            router.push("/login"); // Redireciona para a página de login após 2 segundos
          }, 2000);
        }
      } else {
        setError("Erro ao obter informações do usuário.");
      }
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
