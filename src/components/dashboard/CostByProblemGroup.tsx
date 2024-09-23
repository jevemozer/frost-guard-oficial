"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface ProblemGroupCost {
  nome: string;
  custo: number;
  quantidade: number; // Adicionando o campo para quantidade
}

const CostByProblemGroup = () => {
  const [data, setData] = useState<ProblemGroupCost[]>([]);

  useEffect(() => {
    const fetchCostByProblemGroup = async () => {
      // Buscando pagamentos com status 'Pago'
      const { data: payments, error: paymentError } = await supabase
        .from<Payment>('payment') // Definindo o tipo para 'payment'
        .select(`
          custo,
          maintenance (
            problem_group_id,
            problem_group (nome),
            status
          )
        `)
        .eq('status', 'Pago'); // Usando "Pago" com letra maiúscula

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError.message);
        return;
      }

      // Agrupando os dados pelo grupo de problema
      const groupedData = payments.reduce((acc: Record<string, { nome: string; custo: number; quantidade: number }>, item: Payment) => {
        const groupName = item.maintenance?.problem_group?.nome; // Obtendo o nome do grupo de problema
        const status = item.maintenance?.status; // Obtendo o status da manutenção

        if (!groupName || status !== 'Finalizada') return acc; // Ignorando se não tiver grupo ou não for finalizada

        if (!acc[groupName]) {
          acc[groupName] = { nome: groupName, custo: 0, quantidade: 0 }; // Inicializando a quantidade
        }
        acc[groupName].custo += parseFloat(item.custo.toString()); // Somando o custo
        acc[groupName].quantidade += 1; // Incrementando a quantidade
        return acc;
      }, {});

      setData(Object.values(groupedData)); // Atualizando o estado com os dados agrupados
    };

    fetchCostByProblemGroup();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col">
      <h3 className="text-xl font-semibold text-primary text-center mb-4">Custo por Grupo de Problema</h3>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.nome} className="p-3 rounded-md text-primary bg-muted flex justify-between items-center">
            <span>{item.nome.charAt(0).toUpperCase() + item.nome.slice(1)}</span>
            <span className="font-bold text-red-500">{formatCurrency(item.custo)} ({item.quantidade})</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CostByProblemGroup;
