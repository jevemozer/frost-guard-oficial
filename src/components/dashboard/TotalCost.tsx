"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';

interface CostData {
  moeda: string;
  total: number;
}

const TotalCost = () => {
  const [costsByCurrency, setCostsByCurrency] = useState<CostData[]>([]);

  useEffect(() => {
    const fetchTotalCost = async () => {
      const { data, error } = await supabase
        .from('payment')
        .select(`
          custo,
          cost_center (
            moeda
          ),
          maintenance (
            status
          )
        `)
        .eq('status', 'Pago') // Filtrar pagamentos com status 'Pago'
        .eq('maintenance.status', 'Finalizada'); // Filtrar manutenções com status 'Finalizada'

      if (error) {
        console.error('Erro ao buscar custo total:', error.message);
        return;
      }

      const totals: { [key: string]: number } = {};
      data.forEach(item => {
        const currency = item.cost_center.moeda;
        const cost = parseFloat(item.custo || '0');

        if (totals[currency]) {
          totals[currency] += cost;
        } else {
          totals[currency] = cost;
        }
      });

      const costArray: CostData[] = Object.entries(totals).map(([moeda, total]) => ({
        moeda,
        total
      }));

      setCostsByCurrency(costArray);
    };

    fetchTotalCost();
  }, []);

  const formatCurrency = (value: number, currency: string) => {
    // Define a locale e a moeda correta com base no país
    const locales: { [key: string]: string } = {
      'BRL': 'pt-BR', // Brasil
      'ARS': 'es-AR', // Argentina
      'CLP': 'es-CL', // Chile
      'PYG': 'es-PY', // Paraguai
      'UYU': 'es-UY'  // Uruguai
    };

    const formattedValue = new Intl.NumberFormat(locales[currency], { 
      style: 'currency', 
      currency 
    }).format(value);

    return formattedValue;
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center items-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Custo Total por Moeda
        </CardTitle>
      </CardHeader> 
      <CardContent>
        {costsByCurrency.length > 0 ? (
          costsByCurrency.map((costData) => (
            <p key={costData.moeda} className="text-3xl font-bold text-red-500">
              {costData.moeda} {formatCurrency(costData.total, costData.moeda)}
            </p>
          ))
        ) : (
          <p className="text-3xl font-bold text-red-500">Sem dados disponíveis</p>
        )}
      </CardContent>      
    </Card>
  );
};

export default TotalCost;
