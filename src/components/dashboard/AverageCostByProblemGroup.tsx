"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const AverageCostByProblemGroup = () => {
  const [data, setData] = useState<{ grupoProblema: string; custoMedio: number }[]>([]);

  useEffect(() => {
    const fetchAverageCostByProblemGroup = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('grupo_problema, custo')
        .eq('custo', 'avg'); // Mudei isso, pois você não pode usar 'avg' diretamente no select

      if (error) {
        console.error('Erro ao buscar custo médio por grupo de problema:', error.message);
        return;
      }

      const groupedData = result.reduce((acc, item) => {
        if (!acc[item.grupo_problema]) {
          acc[item.grupo_problema] = { grupoProblema: item.grupo_problema, custoMedio: 0, count: 0 };
        }
        acc[item.grupo_problema].custoMedio += item.custo;
        acc[item.grupo_problema].count += 1;
        return acc;
      }, {} as Record<string, { grupoProblema: string; custoMedio: number; count: number }>);

      const averageData = Object.values(groupedData).map(item => ({
        grupoProblema: item.grupoProblema,
        custoMedio: item.custoMedio / item.count,
      }));

      setData(averageData);
    };

    fetchAverageCostByProblemGroup();
  }, []);

  return (
    <Card>
      <h3>Custo Médio por Grupo de Problema</h3>
      <ul>
        {data.map((item) => (
          <li key={item.grupoProblema}>
            {item.grupoProblema}: R$ {item.custoMedio.toFixed(2)}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default AverageCostByProblemGroup;
