'use client';

import { useState } from 'react';
import { Select, SelectItem } from '@/components/ui/select'; // Supondo que você tenha um componente de Select
import { Button } from '@/components/ui/button';
import { LucideCheck } from 'lucide-react';
import { updateMaintenanceStatus } from '@/lib/supabase'; // Função que atualiza o status no Supabase

interface StatusUpdateProps {
  maintenanceId: string;
  status: string;
  onStatusChange: (newStatus: string) => void; // Função para atualizar o status na UI
}

const statusOptions = [
  { label: 'Em Tratativa', value: 'em_tratativa' },
  { label: 'Enviado para Manutenção', value: 'enviado_para_manutencao' },
  { label: 'Em Manutenção', value: 'em_manutencao' },
];

export const StatusUpdate: React.FC<StatusUpdateProps> = ({ maintenanceId, status, onStatusChange }) => {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async () => {
    setIsLoading(true);
    const success = await updateMaintenanceStatus(maintenanceId, selectedStatus);
    if (success) {
      onStatusChange(selectedStatus);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        {statusOptions.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </Select>
      <Button onClick={handleStatusChange} disabled={isLoading} variant="primary">
        {isLoading ? 'Atualizando...' : 'Atualizar Status'}
        <LucideCheck className="ml-2" />
      </Button>
    </div>
  );
};
