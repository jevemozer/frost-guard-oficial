// src/app/maintenance/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CadastroManutencao from "@/components/maintenance/CadastroManutencao"; 
import AcompanhamentoManutencao from "@/components/maintenance/AcompanhamentoManutencao";

export default function Maintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para abrir e fechar o modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Acompanhamento de Manutenções</h1>
        <Button onClick={toggleModal}>Nova Manutenção</Button>
      </div>

      <AcompanhamentoManutencao />

      {isModalOpen && <CadastroManutencao isOpen={isModalOpen} onClose={toggleModal} />}
    </div>
  );
}
