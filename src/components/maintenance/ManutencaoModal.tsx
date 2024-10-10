// src/app/components/ManutencaoModal.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'; // Usando Dialog do Radix UI

interface Manutencao {
  id: string;
  data_problema: string;
  carreta: string;
  status: string;
  observation: string;
  city_id: { name: string };
  equipment_id: { frota: string };
  driver: string;
  diagnostic: string;
  problem_group_id?: { nome: string };
  workshop_id?: { razao_social: string };
  maintenance_type_id?: { nome: string };
}

interface ManutencaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  manutencao: Manutencao | null;
}

const ManutencaoModal: React.FC<ManutencaoModalProps> = ({
  isOpen,
  onClose,
  manutencao,
}) => {
  if (!manutencao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Manutenção</DialogTitle>
        </DialogHeader>
        <div>
          <p>
            <strong>Data do Problema:</strong> {manutencao.data_problema}
          </p>
          <p>
            <strong>Equipamento:</strong> {manutencao.equipment_id.frota}
          </p>
          <p>
            <strong>Motorista:</strong> {manutencao.driver}
          </p>
          <p>
            <strong>Carreta:</strong> {manutencao.carreta}
          </p>
          <p>
            <strong>Cidade:</strong> {manutencao.city_id.name}
          </p>
          <p>
            <strong>Diagnóstico:</strong> {manutencao.diagnostic}
          </p>
          <p>
            <strong>Grupo de Problema:</strong>{' '}
            {manutencao.problem_group_id?.nome}
          </p>
          <p>
            <strong>Oficina:</strong> {manutencao.workshop_id?.razao_social}
          </p>
          <p>
            <strong>Tipo de Manutenção:</strong>{' '}
            {manutencao.maintenance_type_id?.nome}
          </p>
          <p>
            <strong>Status:</strong> {manutencao.status}
          </p>
          <p>
            <strong>Observação:</strong> {manutencao.observation}
          </p>
        </div>
        <DialogFooter>
          <button onClick={onClose} className="btn">
            Fechar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManutencaoModal;
