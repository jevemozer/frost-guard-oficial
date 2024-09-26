"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { convertToBRL } from '@/lib/currencyConversion';

interface CostData {
  mes: string;
  custo: number;
  moeda: string;
  custoMedioPorEquipamento: number;
}

const CostByMonthByEquipment = () => {
  const [data, setData] = useState<CostData[]>([]);
  const [totalEquipments, setTotalEquipments] = useState<number>(0);

  // Função para buscar o número total de equipamentos cadastrados
  const fetchEquipmentCount = async () => {
    const { count, error } = await supabase
      .from('equipment')
      .select('id', { count: 'exact' }); // Contar o número de equipamentos sem limitar

    if (error) {
      console.error('Erro ao buscar o número de equipamentos:', error.message);
      return;
    }

    if (count) {
      setTotalEquipments(count); // Atualiza com a contagem exata
    }
  };

  useEffect(() => {
    const fetchCostByMonthByEquipment = async () => {
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

      // Buscar o número total de equipamentos
      await fetchEquipmentCount();

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

      const formattedData = Object.entries(monthlyCosts)
        .map(([mes, custo]) => ({
          mes,
          custo: Number(custo),
          moeda: 'BRL',
          custoMedioPorEquipamento: totalEquipments > 0 ? Number(custo) / totalEquipments : 0,
        }))
        // Ordenar os meses em ordem cronológica
        .sort((a, b) => new Date(a.mes).getTime() - new Date(b.mes).getTime());

      setData(formattedData);
    };

    fetchCostByMonthByEquipment();
  }, [totalEquipments]);

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
    return date
      .toLocaleString('default', { month: 'long' })
      .charAt(0)
      .toUpperCase() + date.toLocaleString('default', { month: 'long' }).slice(1); // Capitaliza a primeira letra
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Custo Médio por Equipamento por Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.mes} className="flex justify-between text-xl text-primary font-medium">
              <span className="mr-4">{formatMonth(item.mes)}</span>
              <span className="font-bold text-red-500">
                {formatCurrency(item.custoMedioPorEquipamento)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CostByMonthByEquipment;
