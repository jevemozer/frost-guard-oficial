"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface AverageCostData {
  grupoProblema: string;
  custoMedio: number;
}

const AverageCostByProblemGroup = () => {
  const [data, setData] = useState<AverageCostData[]>([]);

  useEffect(() => {
    const fetchAverageCostByProblemGroup = async () => {
      const { data: result, error } = await supabase
        .from('payment')
        .select(`
          custo,
          maintenance (problem_group_id, problem_group (nome))
        `)
        .eq('status', 'pago'); // Filtrando apenas os pagamentos com status "pago"

      if (error) {
        console.error('Erro ao buscar custo médio por grupo de problema:', error.message);
        return;
      }

      const groupedData = result.reduce((acc: Record<string, { grupoProblema: string; custoTotal: number; count: number }>, item: any) => {
        const groupName = item.maintenance?.problem_group?.nome; // Obter o nome do grupo

        if (!groupName) return acc; // Se não tiver grupo, ignorar

        if (!acc[groupName]) {
          acc[groupName] = { grupoProblema: groupName, custoTotal: 0, count: 0 };
        }
        acc[groupName].custoTotal += parseFloat(item.custo); // Somar o custo
        acc[groupName].count += 1; // Contar a manutenção
        return acc;
      }, {});

      const averageData = Object.values(groupedData).map(item => ({
        grupoProblema: item.grupoProblema,
        custoMedio: item.count > 0 ? item.custoTotal / item.count : 0, // Calcular a média
      }));

      setData(averageData);
    };

    fetchAverageCostByProblemGroup();
  }, []);

  return (
    <Card className="p-6 rounded-lg bg-card dark:bg-card border border-border shadow-md">
      <h3 className="text-xl font-semibold mb-4">Custo Médio por Grupo de Problema</h3>
      <ul className="space-y-2">
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.grupoProblema} className="p-2 rounded bg-muted text-muted-foreground border border-border">
              {item.grupoProblema}: R$ {item.custoMedio.toFixed(2)}
            </li>
          ))
        ) : (
          <li className="p-2 rounded bg-muted text-muted-foreground border border-border">Nenhum dado encontrado.</li>
        )}
      </ul>
    </Card>
  );
};

export default AverageCostByProblemGroup;
