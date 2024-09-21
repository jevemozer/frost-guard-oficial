"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const Top20CostlyEquipment = () => {
  const [data, setData] = useState<{ equipamento: string; custo: number }[]>([]);

  useEffect(() => {
    const fetchTop20CostlyEquipment = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('equipamento, sum(custo) as custo')
        .group('equipamento')
        .order('custo', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar equipamentos mais caros:', error.message);
        return;
      }

      setData(result);
    };

    fetchTop20CostlyEquipment();
  }, []);

  return (
    <Card>
      <h3>Top 20 Equipamentos Mais Caros</h3>
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

export default Top20CostlyEquipment;
