"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        setUser(session?.user ?? null);

        if (session) {
          localStorage.setItem('session', JSON.stringify(session));
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    // Verifica se há uma sessão armazenada no localStorage e restaura o estado
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      const parsedSession: Session = JSON.parse(storedSession);
      setSession(parsedSession);
      setUser(parsedSession?.user ?? null);
    }

    // Escuta mudanças na autenticação e atualiza o estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session) {
        localStorage.setItem('session', JSON.stringify(session));
      } else {
        localStorage.removeItem('session');
      }
    });

    setData();

    // Limpa a inscrição para evitar vazamentos de memória
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
