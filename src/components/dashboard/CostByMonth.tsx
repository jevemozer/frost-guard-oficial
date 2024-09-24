"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent} from '@/components/ui/card';

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
        .select('data_vencimento, custo, cost_center (moeda)');

      if (error) {
        console.error('Erro ao buscar custo por mês:', error.message);
        return;
      }

      if (!result) {
        console.warn('Nenhum dado encontrado.');
        return;
      }

      const monthlyCosts = result.reduce((acc: { [key: string]: { [key: string]: number } }, curr: { data_vencimento: string; custo: string; cost_center: { moeda: string } }) => {
        const month = new Date(curr.data_vencimento).toISOString().slice(0, 7); // Formato YYYY-MM
        const cost = parseFloat(curr.custo || '0');
        const currency = curr.cost_center.moeda;

        if (!acc[month]) {
          acc[month] = {};
        }

        if (!acc[month][currency]) {
          acc[month][currency] = 0; // Inicializa se a moeda não existe ainda
        }

        acc[month][currency] += cost;

        return acc;
      }, {});

      // Converte o objeto para um array
      const formattedData = Object.entries(monthlyCosts).flatMap(([mes, costs]) =>
        Object.entries(costs).map(([moeda, custo]) => ({
          mes,
          custo,
          moeda
        }))
      );

      setData(formattedData);
    };

    fetchCostByMonth();
  }, []);

  const formatCurrency = (value: number, currency: string) => {
    const locales: { [key: string]: string } = {
      'BRL': 'pt-BR',
      'ARS': 'es-AR',
      'CLP': 'es-CL',
      'PYG': 'es-PY',
      'UYU': 'es-UY'
    };

    const selectedLocale = locales[currency] || 'pt-BR'; // Fallback para pt-BR

    return new Intl.NumberFormat(selectedLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,  // Garante que tenha pelo menos 2 casas decimais
      maximumFractionDigits: 2,  // Garante que tenha no máximo 2 casas decimais
    }).format(value);
  };

  const formatMonth = (monthString: string) => {
    const month = new Date(monthString + '-01').toLocaleString('default', { month: 'long' });
    return month.charAt(0).toUpperCase() + month.slice(1); // Primeira letra maiúscula
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">Custo por Mês
        </CardTitle>
      </CardHeader>
    <CardContent>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={`${item.mes}-${item.moeda}`} className="flex justify-between text-xl text-primary font-medium">
              <span className="mr-4">{formatMonth(item.mes)} ({item.moeda})</span>
              <span className="font-bold text-red-500">
                {item.moeda} {formatCurrency(item.custo, item.moeda)}
              </span>
            </li>
          ))}
        </ul>
    </CardContent>
  </Card>
  );
};

export default CostByMonth;
