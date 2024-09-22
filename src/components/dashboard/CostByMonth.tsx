"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const CostByMonth = () => {
  const [data, setData] = useState<{ mes: string; custo: number }[]>([]);

  useEffect(() => {
    const fetchCostByMonth = async () => {
      const { data: result, error } = await supabase
        .from('payment')
        .select('data_vencimento, custo');

      if (error) {
        console.error('Erro ao buscar custo por mês:', error.message);
        return;
      }

      if (!result) {
        console.warn('Nenhum dado encontrado.');
        return;
      }

      const monthlyCosts = result.reduce((acc: { [key: string]: number }, curr: { data_vencimento: string; custo: string }) => {
        const month = new Date(curr.data_vencimento).toISOString().slice(0, 7); // Formato YYYY-MM
        acc[month] = (acc[month] || 0) + parseFloat(curr.custo || '0');
        return acc;
      }, {});

      // Converte o objeto para um array
      const formattedData = Object.entries(monthlyCosts).map(([mes, custo]) => ({
        mes,
        custo,
      }));

      setData(formattedData);
    };

    fetchCostByMonth();
  }, []);

  return (
    <Card className="p-6 rounded-lg bg-foreground dark:bg-card text-foreground shadow-md">
      <h3 className="text-xl font-semibold text-balance mb-4">Custo por Mês</h3>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.mes} className="flex justify-between text-xl text-primary font-medium">
            <span>{new Date(item.mes + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ {item.custo.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CostByMonth;
