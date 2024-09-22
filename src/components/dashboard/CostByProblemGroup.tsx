"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface ProblemGroupCost {
  nome: string;
  custo: number;
}

const CostByProblemGroup = () => {
  const [data, setData] = useState<ProblemGroupCost[]>([]);

  useEffect(() => {
    const fetchCostByProblemGroup = async () => {
      const { data: result, error } = await supabase
        .from('payment')
        .select(`
          custo,
          maintenance (problem_group_id, problem_group (nome))
        `)
        .eq('status', 'pago'); // Filtrando apenas os pagamentos com status "pago"

      if (error) {
        console.error('Erro ao buscar custo por grupo de problema:', error.message);
        return;
      }

      const groupedData = result.reduce((acc: Record<string, { nome: string; custo: number }>, item: any) => {
        const groupName = item.maintenance?.problem_group?.nome; // Obtendo o nome do grupo de problema
        if (!groupName) return acc; // Se não tiver grupo, ignorar

        if (!acc[groupName]) {
          acc[groupName] = { nome: groupName, custo: 0 };
        }
        acc[groupName].custo += parseFloat(item.custo); // Somar o custo
        return acc;
      }, {});

      setData(Object.values(groupedData));
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
            <span>{item.nome.charAt(0).toUpperCase()+item.nome.slice(1)}</span>
            <span className="font-bold text-red-500">{formatCurrency(item.custo)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CostByProblemGroup;
