'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redireciona para a página de login se o usuário não estiver logado
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    // Opcional: exibe um loader enquanto verifica o login
    return <div>Loading...</div>;
  }

  return <>{user ? children : null}</>;
};
