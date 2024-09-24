"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';

interface ProblemGroupCost {
  nome: string;
  custo: number;
  quantidade: number; // Adicionando o campo para quantidade
  moeda: string; // Adicionando campo para moeda
}

const CostByProblemGroup = () => {
  const [data, setData] = useState<ProblemGroupCost[]>([]);

  useEffect(() => {
    const fetchCostByProblemGroup = async () => {
      const { data: payments, error: paymentError } = await supabase
        .from('payment') // Definindo o tipo para 'payment'
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
        .eq('status', 'Pago'); // Usando "Pago" com letra maiúscula

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError.message);
        return;
      }

      const groupedData = payments.reduce((acc: Record<string, { nome: string; custo: number; quantidade: number; moeda: string }>, item: any) => {
        const groupName = item.maintenance?.problem_group?.nome; // Obtendo o nome do grupo de problema
        const status = item.maintenance?.status; // Obtendo o status da manutenção
        const currency = item.cost_center?.moeda; // Obtendo a moeda

        if (!groupName || status !== 'Finalizada' || !currency) return acc; // Ignorando se não tiver grupo ou não for finalizada

        const key = `${groupName}-${currency}`; // Criando uma chave única por grupo de problema e moeda

        if (!acc[key]) {
          acc[key] = { nome: groupName, custo: 0, quantidade: 0, moeda: currency }; // Inicializando a quantidade e a moeda
        }
        acc[key].custo += parseFloat(item.custo.toString()); // Somando o custo
        acc[key].quantidade += 1; // Incrementando a quantidade
        return acc;
      }, {});

      const resultData = Object.values(groupedData).map(item => ({
        ...item,
        custo: item.custo / item.quantidade // Calculando o custo médio
      }));

      setData(resultData); // Atualizando o estado com os dados agrupados
    };

    fetchCostByProblemGroup();
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
          Custo por Grupo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={`${item.nome}-${item.moeda}`} className="flex justify-between text-xl text-primary font-medium">
              <span className="text-xl text-primary font-medium">
                {item.nome.charAt(0).toUpperCase() + item.nome.slice(1)} ({item.quantidade})
              </span>
              <span className="font-bold text-red-500">
                {formatCurrency(item.custo, item.moeda)} 
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CostByProblemGroup;
