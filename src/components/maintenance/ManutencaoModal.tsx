// src/app/components/ManutencaoModal.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns'; // Importando a função de formatação de data

interface Manutencao {
  id: string;
  data_problema: string;
  carreta: string;
  status: string;
  observation: string;
  city_id: { name: string };
  equipment_id: { frota: string };
  driver: string; // Pode ser uma string, mas vamos formatar
  diagnostic: string;
  problem_group_id?: { nome: string };
  workshop_id?: { razao_social: string };
  maintenance_type_id?: { nome: string };
  created_by?: { full_name: string };
}

interface ManutencaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  manutencao: Manutencao | null;
}

const formatName = (
  name: string | undefined,
  capitalizeWords: boolean = false,
) => {
  if (!name) return ''; // Verificação condicional

  if (capitalizeWords) {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    const [firstName, lastName] = name.split(' ');
    return `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${
      lastName?.charAt(0)?.toUpperCase() + lastName?.slice(1) // Uso de optional chaining
    }`;
  }
};

const ManutencaoModal: React.FC<ManutencaoModalProps> = ({
  isOpen,
  onClose,
  manutencao,
}) => {
  if (!manutencao) return null;

  // Formatando a data do problema
  const formattedDate = format(
    new Date(manutencao.data_problema),
    'dd/MM/yyyy',
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Detalhes da Manutenção
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ul className="space-y-3">
            <li>
              <strong>Data do Problema:</strong> <span>{formattedDate}</span>
            </li>
            <li>
              <strong>Equipamento:</strong>{' '}
              <span>{manutencao.equipment_id.frota}</span>
            </li>
            <li>
              <strong>Motorista:</strong>{' '}
              <span>{formatName(manutencao.driver)}</span>
            </li>
            <li>
              <strong>Carreta:</strong> <span>{manutencao.carreta}</span>
            </li>
            <li>
              <strong>Cidade:</strong> <span>{manutencao.city_id.name}</span>
            </li>
            <li>
              <strong>Diagnóstico:</strong> <span>{manutencao.diagnostic}</span>
            </li>
            <li>
              <strong>Grupo de Problema:</strong>{' '}
              <span>{manutencao.problem_group_id?.nome || 'N/A'}</span>
            </li>
            <li>
              <strong>Oficina:</strong>{' '}
              <span>
                {formatName(manutencao.workshop_id?.razao_social, true)}
              </span>
            </li>
            <li>
              <strong>Tipo de Manutenção:</strong>{' '}
              <span>{manutencao.maintenance_type_id?.nome || 'N/A'}</span>
            </li>
            <li>
              <strong>Status:</strong> <span>{manutencao.status}</span>
            </li>
            <li>
              <strong>Observação:</strong>{' '}
              <span>{manutencao.observation || 'N/A'}</span>
            </li>
            <li>
              <strong>Cadastrado Por:</strong>{' '}
              <span>{manutencao.created_by?.full_name || 'N/A'}</span>
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManutencaoModal;
