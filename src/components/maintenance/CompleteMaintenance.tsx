'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LucideCheckCircle } from 'lucide-react';
import { completeMaintenance } from '@/lib/supabase'; // Função que conclui a manutenção no Supabase

interface CompleteMaintenanceProps {
  maintenanceId: string;
  requiredFieldsFilled: boolean;
  onComplete: () => void;
}

export const CompleteMaintenance: React.FC<CompleteMaintenanceProps> = ({ maintenanceId, requiredFieldsFilled, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (!requiredFieldsFilled) {
      alert('Preencha todos os campos obrigatórios antes de concluir a manutenção.');
      return;
    }

    setIsCompleting(true);
    const success = await completeMaintenance(maintenanceId);
    if (success) {
      onComplete();
    }
    setIsCompleting(false);
  };

  return (
    <Button onClick={handleComplete} disabled={!requiredFieldsFilled || isCompleting} variant="success">
      {isCompleting ? 'Concluindo...' : 'Concluir Manutenção'}
      <LucideCheckCircle className="ml-2" />
    </Button>
  );
};
