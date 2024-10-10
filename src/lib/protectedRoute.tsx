'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, setUser } = useAuth(); // Supondo que useAuth tenha setUser
  const [tokenChecked, setTokenChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verifica se existe um token no localStorage
    const token = localStorage.getItem('authToken'); // O nome 'authToken' pode variar conforme sua implementação

    if (token) {
      // Se houver um token, simula a autenticação (aqui você pode fazer uma verificação real com o backend se necessário)
      setUser({ token }); // Atualiza o estado do usuário no contexto
    }

    setTokenChecked(true); // Indica que a verificação do token foi feita
  }, [setUser]);

  useEffect(() => {
    if (!loading && !user && tokenChecked) {
      // Redireciona para a página de login se o usuário não estiver logado e a verificação do token foi feita
      router.push('/login');
    }
  }, [user, loading, tokenChecked, router]);

  if (loading || !tokenChecked) {
    // Exibe um loader enquanto verifica o login e o token
    return <div>Loading...</div>;
  }

  return <>{user ? children : null}</>;
};
