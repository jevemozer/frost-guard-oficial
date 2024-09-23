'use client';

import { useState } from 'react';
import AddMaintenanceModal from '@/components/maintenance/AddMaintenanceModal';
import MaintenanceGrid from '@/components/maintenance/MaintenanceGrid';

export default function ManutencoesPage() {
  const [refresh, setRefresh] = useState(false);

  // Função para atualizar a grid após cadastrar ou concluir manutenção
  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Manutenções</h1>
        <AddMaintenanceModal onAdd={handleRefresh} />
      </div>

      <MaintenanceGrid refresh={refresh} />
    </div>
  );
}
