"use client"; // Necessário para rodar no lado do cliente

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { convertToBRL } from '@/lib/currencyConversion'; // Importa a função de conversão

interface PaymentData {
  custo: string;
  cost_center: {
    moeda: string;
  };
  maintenance: {
    status: string;
  };
  data_vencimento: string;
}

const TotalCost = () => {
  const [totalInBRL, setTotalInBRL] = useState<number>(0); // Total em BRL
  const [error, setError] = useState<string | null>(null); // Estado para armazenar erros

  useEffect(() => {
    // Função assíncrona para buscar e calcular o total
    const fetchTotalCost = async () => {
      try {
        const { data, error } = await supabase
          .from('payment')
          .select(`
            custo,
            cost_center (
              moeda
            ),
            maintenance (
              status
            ),
            data_vencimento
          `)
          .eq('maintenance.status', 'Finalizada'); // Filtra manutenções finalizadas

        if (error) {
          console.error('Erro ao buscar custos:', error.message);
          setError('Erro ao buscar custos.'); // Atualiza o estado de erro
          return;
        }

        let totalBRL = 0; // Inicializa o total em BRL

        // Itera sobre os pagamentos e converte para BRL se necessário
        for (const item of (data || []) as PaymentData[]) {
          const currency = item.cost_center?.moeda;
          const cost = parseFloat(item.custo || '0');

          if (currency === 'BRL') {
            totalBRL += cost; // Se já for BRL, apenas adiciona ao total
          } else if (currency && cost) {
            try {
              // Converte para BRL usando a função de conversão
              const result = await convertToBRL(cost, currency);
              totalBRL += result?.convertedAmount || 0; // Garante que será somado 0 em caso de falha na conversão
            } catch (error) {
              console.error(`Erro ao converter ${currency} para BRL:`, error);
            }
          }
        }

        // Atualiza o total em BRL no estado
        setTotalInBRL(totalBRL);
      } catch (error) {
        console.error('Erro geral ao calcular o custo total:', error);
        setError('Erro geral ao calcular o custo total.');
      }
    };

    fetchTotalCost();
  }, []); // Executa quando o componente é montado

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center items-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Custo Total
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-red-500">{error}</p> // Exibe mensagem de erro
        ) : (
          <p className="text-3xl font-bold text-red-500">
            R$ {totalInBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {/* Formata o total para BRL */}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalCost;
