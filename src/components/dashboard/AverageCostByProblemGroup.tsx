"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';

interface Payment {
  custo: number;
  cost_center: {
    moeda: string;
  };
  maintenance: {
    problem_group_id: string;
    problem_group: {
      nome: string;
    };
  };
}

interface AverageCostData {
  moeda: string;
  grupoProblema: string;
  custoMedio: number;
}

const AverageCostByProblemGroup = () => {
  const [data, setData] = useState<AverageCostData[]>([]);

  useEffect(() => {
    const fetchAverageCostByProblemGroup = async () => {
      const { data: result, error } = await supabase
        .from<Payment>('payment')
        .select(`custo, cost_center (moeda), maintenance (problem_group_id, problem_group (nome))`)
        .eq('status', 'Pago'); // Filtrando apenas os pagamentos com status "pago"

      if (error) {
        console.error('Erro ao buscar custo médio por grupo de problema:', error.message);
        return;
      }

      // Agrupando e somando os custos
      const groupedData = result.reduce((acc: Record<string, { moeda: string; grupoProblema: string; custoTotal: number; count: number }>, item) => {
        const groupName = item.maintenance?.problem_group?.nome; // Obter o nome do grupo
        const currency = item.cost_center?.moeda; // Obter a moeda

        if (!groupName || !currency) return acc; // Se não tiver grupo ou moeda, ignorar

        const key = `${currency}-${groupName}`; // Chave para identificação única

        if (!acc[key]) {
          acc[key] = { moeda: currency, grupoProblema: groupName, custoTotal: 0, count: 0 };
        }
        acc[key].custoTotal += item.custo; // Somar o custo
        acc[key].count += 1; // Contar a manutenção
        return acc;
      }, {});

      // Calculando a média para cada grupo por moeda
      const averageData = Object.values(groupedData).map(item => ({
        moeda: item.moeda,
        grupoProblema: item.grupoProblema,
        custoMedio: item.count > 0 ? item.custoTotal / item.count : 0, // Calcular a média
      }));

      setData(averageData);
    };

    fetchAverageCostByProblemGroup();
  }, []);

  // Função para formatar o valor em Reais
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-stretch justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Custo Médio por Grupo e Centro de Custo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.length > 0 ? (
            data.map((item) => (
              <li key={`${item.moeda}-${item.grupoProblema}`} className="flex justify-between text-xl text-primary font-medium">
                {item.grupoProblema.charAt(0).toUpperCase() + item.grupoProblema.slice(1)} ({item.moeda}):
                <span className="font-bold text-red-500">{formatCurrency(item.custoMedio, item.moeda)}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-primary font-medium">Nenhum dado encontrado.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AverageCostByProblemGroup;
