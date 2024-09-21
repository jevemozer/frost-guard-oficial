"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const Top20MostMaintainedEquipment = () => {
  const [data, setData] = useState<{ equipamento: string; count: number }[]>([]);

  useEffect(() => {
    const fetchTop20MostMaintainedEquipment = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('equipamento, count(*) as count')
        .group('equipamento')
        .order('count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar equipamentos mais mantidos:', error.message);
        return;
      }

      setData(result);
    };

    fetchTop20MostMaintainedEquipment();
  }, []);

  return (
    <Card>
      <h3>Top 20 Equipamentos Mais Mantidos</h3>
      <ul>
        {data.map((item) => (
          <li key={item.equipamento}>
            {item.equipamento}: {item.count} manutenções
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default Top20MostMaintainedEquipment;
