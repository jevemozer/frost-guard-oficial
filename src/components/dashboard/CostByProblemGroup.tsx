"use client"; // Adicione esta linha


import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const CostByProblemGroup = () => {
  const [data, setData] = useState<{ grupoProblema: string; custo: number }[]>([]);

  useEffect(() => {
    const fetchCostByProblemGroup = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('grupo_problema, custo');

      if (error) {
        console.error('Erro ao buscar custo por grupo de problema:', error.message);
        return;
      }

      const groupedData = result.reduce((acc, item) => {
        if (!acc[item.grupo_problema]) {
          acc[item.grupo_problema] = { grupoProblema: item.grupo_problema, custo: 0 };
        }
        acc[item.grupo_problema].custo += item.custo;
        return acc;
      }, {} as Record<string, { grupoProblema: string; custo: number }>);

      setData(Object.values(groupedData));
    };

    fetchCostByProblemGroup();
  }, []);

  return (
    <Card>
      <h3>Custo por Grupo de Problema</h3>
      <ul>
        {data.map((item) => (
          <li key={item.grupoProblema}>
            {item.grupoProblema}: R$ {item.custo.toFixed(2)}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CostByProblemGroup;
