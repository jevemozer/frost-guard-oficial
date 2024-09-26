"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { convertToBRL } from '@/lib/currencyConversion'; // Importando a função de conversão
import { Loader2 } from 'lucide-react'; // Importando o ícone de loader

interface ProblemGroupCost {
  nome: string;
  custo: number; // Custo em BRL
  quantidade: number; // Quantidade de manutenções
}

const CostByProblemGroup = () => {
  const [data, setData] = useState<ProblemGroupCost[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento

  useEffect(() => {
    const fetchCostByProblemGroup = async () => {
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
        setLoading(false); // Parar o carregamento em caso de erro
        return;
      }

      // Conversão e agrupamento
      const groupedData: Record<string, { custo: number; quantidade: number }> = {};

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
          groupedData[groupName] = { custo: 0, quantidade: 0 }; // Inicializar valores do grupo
        }

        // Acumular valores
        groupedData[groupName].custo += costInBRL; // Acumular custo total em BRL
        groupedData[groupName].quantidade += 1; // Contar o número de manutenções para o grupo
      }

      // Transformar dados agrupados em um array
      const resultData = Object.entries(groupedData).map(([nome, { custo, quantidade }]) => ({
        nome,
        custo,
        quantidade,
      }));

      setData(resultData); // Atualizando o estado com os dados agrupados
      setLoading(false); // Parar o carregamento após os dados serem buscados
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
        {loading ? ( // Exibir loader enquanto os dados estão sendo carregados
            <div className="flex justify-center items-center text-xl font-normal">
            <Loader2 className="animate-spin h-5 w-5 mr-2 text-primary" /> Carregando dados...
            </div>
        ) : (
          <ul className="space-y-2">
            {data.map((item) => (
              <li key={item.nome} className="flex justify-between text-xl text-primary font-medium">
                <span className="text-xl text-primary font-medium">
                  {item.nome.charAt(0).toUpperCase() + item.nome.slice(1)} ({item.quantidade})
                </span>
                <span className="font-bold text-red-500">
                  {formatCurrency(item.custo, 'BRL')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default CostByProblemGroup;
