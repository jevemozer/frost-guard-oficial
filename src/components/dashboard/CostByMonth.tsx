"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { convertToBRL } from '@/lib/currencyConversion';
import { Loader2 } from 'lucide-react'; 

interface CostData {
  mes: string;
  custo: number;
  moeda: string;
}

const CostByMonth = () => {
  const [data, setData] = useState<CostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento

  useEffect(() => {
    const fetchCostByMonth = async () => {
      setLoading(true); // Começa o carregamento
      const { data: result, error } = await supabase
        .from('payment')
        .select('payment_date, custo, cost_center(moeda), maintenance(status)')
        .eq('maintenance.status', 'Finalizada')
        .eq('status', 'Pago');

      if (error) {
        console.error('Erro ao buscar custo por mês:', error.message);
        setLoading(false); // Para o carregamento em caso de erro
        return;
      }

      if (!result) {
        console.warn('Nenhum dado encontrado.');
        setLoading(false); // Para o carregamento se não houver dados
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
      setLoading(false); // Para o carregamento após os dados serem buscados
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
        {loading ? ( // Exibe o Loader2 enquanto os dados estão carregando
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-5 w-5 mr-2 text-primary" /> Carregando dados...
          </div>
        ) : (
          <ul className="space-y-2">
            {data.map((item) => (
              <li key={item.mes} className="flex justify-between text-xl text-primary font-medium">
                <span className="mr-4">{formatMonth(item.mes)}</span>
                <span className="font-bold text-red-500">{formatCurrency(item.custo)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default CostByMonth;
