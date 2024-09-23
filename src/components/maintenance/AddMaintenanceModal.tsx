'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'; 
import { Input } from '@/components/ui/input';  
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'; 

export default function AddMaintenanceModal({ onAdd }: { onAdd: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({
    dataProblema: '',
    equipamento: '',
    motorista: '',
    carreta: '',
    cidadeQuebra: '',
    diagnostico: '',
    grupoProblema: '',
    oficina: '',
    tipoManutencao: '',
    observacoes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!data.dataProblema || !data.equipamento || !data.motorista || !data.carreta || !data.cidadeQuebra) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const { error } = await supabase.from('maintenance').insert([
      {
        data_problema: data.dataProblema,
        equipamento_id: data.equipamento,
        motorista_id: data.motorista,
        carreta: data.carreta,
        cidade_id: data.cidadeQuebra,
        diagnostico_id: data.diagnostico,
        grupo_problema_id: data.grupoProblema,
        oficina_id: data.oficina,
        tipo_manutencao_id: data.tipoManutencao,
        observacoes: data.observacoes,
      },
    ]);

    if (error) {
      alert('Erro ao adicionar manutenção.');
    } else {
      alert('Manutenção adicionada com sucesso.');
      setIsOpen(false);
      onAdd(); // Notifica o parent para atualizar a grid
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Cadastrar Nova Manutenção</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogTitle>Nova Manutenção</DialogTitle>
          <form>
            <Input placeholder="Data do Problema" name="dataProblema" onChange={handleInputChange} />
            <Select name="equipamento" onValueChange={(value) => setData((prev) => ({ ...prev, equipamento: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Equipamento" />
              </SelectTrigger>
              <SelectContent>
                {/* Popule as opções com os dados do Supabase */}
              </SelectContent>
            </Select>
            {/* Outros campos do formulário */}
          </form>
          <Button onClick={handleSubmit}>Cadastrar</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
