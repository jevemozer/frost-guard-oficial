// src/app/maintenance/page.tsx

'use client';
import { ProtectedRoute } from '@/lib/protectedRoute';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CadastroManutencao from '@/components/maintenance/CadastroManutencao';
import AcompanhamentoManutencao from '@/components/maintenance/AcompanhamentoManutencao';

export default function Maintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para abrir e fechar o modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            className="text-primary text-lg font-bold bg-primary-foreground"
            onClick={toggleModal}
          >
            Nova Manutenção
          </Button>
        </div>

        <AcompanhamentoManutencao />

        {isModalOpen && (
          <CadastroManutencao isOpen={isModalOpen} onClose={toggleModal} />
        )}
      </div>
    </ProtectedRoute>
  );
}
