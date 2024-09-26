"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { convertToBRL } from '@/lib/currencyConversion';

interface CostData {
  mes: string;
  custo: number;
  moeda: string;
}

const CostByMonth = () => {
  const [data, setData] = useState<CostData[]>([]);

  useEffect(() => {
    const fetchCostByMonth = async () => {
      const { data: result, error } = await supabase
        .from('payment')
        .select('payment_date, custo, cost_center(moeda), maintenance(status)')
        .eq('maintenance.status', 'Finalizada')
        .eq('status', 'Pago');

      if (error) {
        console.error('Erro ao buscar custo por mês:', error.message);
        return;
      }

      if (!result) {
        console.warn('Nenhum dado encontrado.');
        return;
      }

      const monthlyCosts = await result.reduce<Promise<Record<string, number>>>(
        async (accPromise, curr) => {
          const acc = await accPromise;
          const month = new Date(curr.payment_date).toISOString().slice(0, 7);

          const cost = curr.custo ? parseFloat(curr.custo.toString()) : 0;
          const currency = curr.cost_center.moeda;

          const conversionResult =
            currency !== 'BRL'
              ? await convertToBRL(cost, currency)
              : { convertedAmount: cost, exchangeRate: 1 };

          if (conversionResult) {
            if (!acc.hasOwnProperty(month)) {
              acc[month] = 0;
            }
            acc[month] += conversionResult.convertedAmount;
          }

          return acc;
        },
        Promise.resolve({})
      );

      const formattedData = Object.entries(monthlyCosts).map(
        ([mes, custo]) => ({
          mes,
          custo: Number(custo),
          moeda: 'BRL',
        })
      );

      // Ordenar os meses cronologicamente
      const sortedData = formattedData.sort((a, b) => a.mes.localeCompare(b.mes));

      setData(sortedData);
    };

    fetchCostByMonth();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long' })
      .charAt(0).toUpperCase() + date.toLocaleString('default', { month: 'long' }).slice(1); // Capitaliza a primeira letra
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Custo por Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.mes} className="flex justify-between text-xl text-primary font-medium">
              <span className="mr-4">{formatMonth(item.mes)}</span>
              <span className="font-bold text-red-500">{formatCurrency(item.custo)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CostByMonth;
