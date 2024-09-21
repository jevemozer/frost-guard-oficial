"use client"; // Marca este arquivo como um componente cliente

import { useAuth } from '@/lib/contexts/AuthContext'; // Importando useAuth
import { usePathname } from 'next/navigation'; // Importando usePathname
import Sidebar from '@/components/sidebar/Sidebar'; // Importação correta para exportação padrão

// Páginas onde o sidebar deve aparecer
const pagesWithSidebar = ["/home", "/dashboard", "/manutencao", "/financeiro", "/cadastros", "/relatorios", "/configuracoes"];

export const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth(); // Obtendo o usuário logado
  const pathname = usePathname(); // Pegando a rota atual

  const shouldRenderSidebar = user && pagesWithSidebar.includes(pathname); // Verificando se o sidebar deve ser exibido

  return (
    <div className="flex">
      {shouldRenderSidebar && <Sidebar />} {/* Renderiza o Sidebar se o usuário estiver logado e na página correta */}
      <main className={`flex-1 ${shouldRenderSidebar ? 'pl-64' : ''}`}> {/* Adiciona padding se o Sidebar estiver visível */}
        {children}
      </main>
    </div>
  );
};
