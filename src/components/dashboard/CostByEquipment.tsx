"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const CostByEquipment = () => {
  const [data, setData] = useState<{ equipamento: string; custo: number }[]>([]);

  useEffect(() => {
    const fetchCostByEquipment = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('equipamento, custo');

      if (error) {
        console.error('Erro ao buscar custo por equipamento:', error.message);
        return;
      }

      const groupedData = result.reduce((acc, item) => {
        if (!acc[item.equipamento]) {
          acc[item.equipamento] = { equipamento: item.equipamento, custo: 0 };
        }
        acc[item.equipamento].custo += item.custo;
        return acc;
      }, {} as Record<string, { equipamento: string; custo: number }>);

      setData(Object.values(groupedData));
    };

    fetchCostByEquipment();
  }, []);

  return (
    <Card>
      <h3>Custo por Equipamento</h3>
      <ul>
        {data.map((item) => (
          <li key={item.equipamento}>
            {item.equipamento}: R$ {item.custo.toFixed(2)}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CostByEquipment;
