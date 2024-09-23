"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle} from '@/components/ui/card';

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

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Carregando...';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center items-center">
      <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">Custo Total
       </CardTitle>
        <p className="text-3xl font-bold text-red-500">
          {formatCurrency(totalCost)}
        </p>
    </Card>
  );
};

export default TotalCost;
