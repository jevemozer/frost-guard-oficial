"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { convertToBRL } from '@/lib/currencyConversion'; // Importando a função de conversão

interface ProblemGroupAverageCost {
  nome: string;
  mediaCusto: number; // Custo médio em BRL
  quantidade: number; // Quantidade de manutenções
}

const AverageCostByProblemGroup = () => {
  const [data, setData] = useState<ProblemGroupAverageCost[]>([]);

  useEffect(() => {
    const fetchAverageCostByProblemGroup = async () => {
      const { data: payments, error: paymentError } = await supabase
        .from('payment')
        .select(`
          custo,
          cost_center (
            moeda
          ),
          maintenance (
            problem_group_id,
            problem_group (nome),
            status
          )
        `)
        .eq('status', 'Pago'); // Filtrando manutenções pagas

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError.message);
        return;
      }

      // Conversão e agrupamento
      const groupedData: Record<string, { totalCusto: number; quantidade: number }> = {};

      // Processando pagamentos
      for (const item of payments) {
        const groupName = item.maintenance?.problem_group?.nome; // Nome do grupo de problema
        const currency = item.cost_center?.moeda; // Moeda

        if (!groupName || !currency) continue; // Ignorar se não houver nome do grupo ou moeda

        // Converter custo para BRL
        const convertedCost = await convertToBRL(parseFloat(item.custo.toString()), currency);
        const costInBRL = convertedCost?.convertedAmount || 0;

        // Inicializar dados do grupo se não existir
        if (!groupedData[groupName]) {
          groupedData[groupName] = { totalCusto: 0, quantidade: 0 }; // Inicializar valores do grupo
        }

        // Acumular valores
        groupedData[groupName].totalCusto += costInBRL; // Acumular custo total em BRL
        groupedData[groupName].quantidade += 1; // Contar o número de manutenções para o grupo
      }

      // Transformar dados agrupados em um array com média
      const resultData = Object.entries(groupedData).map(([nome, { totalCusto, quantidade }]) => ({
        nome,
        mediaCusto: quantidade > 0 ? totalCusto / quantidade : 0, // Calcular média
        quantidade,
      }));

      setData(resultData); // Atualizando o estado com os dados agrupados
    };

    fetchAverageCostByProblemGroup();
  }, []);

  const formatCurrency = (value: number, currency: string) => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return value.toLocaleString('pt-BR', options);
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-stretch justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Custo Médio por Grupo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.nome} className="flex justify-between text-xl text-primary font-medium">
              <span className="text-xl text-primary font-medium">
                {item.nome.charAt(0).toUpperCase() + item.nome.slice(1)} ({item.quantidade})
              </span>
              <span className="font-bold text-red-500">
                {formatCurrency(item.mediaCusto, 'BRL')} 
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AverageCostByProblemGroup;
