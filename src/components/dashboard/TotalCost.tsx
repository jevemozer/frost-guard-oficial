"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const TotalCost = () => {
  const [totalCost, setTotalCost] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalCost = async () => {
      const { data, error } = await supabase
        .from('payment')
        .select('custo');

      if (error) {
        console.error('Erro ao buscar custo total:', error.message);
        return;
      }

      // Calcular o custo total
      const total = data.reduce((acc, curr) => acc + parseFloat(curr.custo || '0'), 0);
      setTotalCost(total);
    };

    fetchTotalCost();
  }, []);

  return (
    <Card className="p-4 text-center">
      <h3 className="text-lg font-semibold">Custo Total</h3>
      <p className="text-xl">
        {totalCost !== null ? `R$ ${totalCost.toFixed(2)}` : 'Carregando...'}
      </p>
    </Card>
  );
};

export default TotalCost;
