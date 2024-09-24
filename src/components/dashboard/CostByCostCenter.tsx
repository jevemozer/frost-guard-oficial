"use client"

// src/app/components/CostByCostCenter.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type CostCenter = {
  id: string;
  nome: string;
  moeda: string;
};

type Payment = {
  id: string;
  maintenance_id: string;
  cost_center_id: string;
  custo: number;
  status: string;
};

type Maintenance = {
  id: string;
  status: string;
};

// Mapeamento de moedas para conversão (exemplo)
const currencyConversionRates: Record<string, number> = {
  BRL: 1,       // Real brasileiro
  USD: 5.2,     // Dólar americano
  EUR: 6.0,     // Euro
  // Adicione outras moedas e suas taxas de conversão conforme necessário
};

export default function CostByCostCenter() {
  const [costData, setCostData] = useState<Record<string, { totalCost: number; maintenanceCount: number; currency: string }>>({});
  const [costCenterNames, setCostCenterNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCosts = async () => {
      setLoading(true);

      // Busque pagamentos com status "Pago"
      const { data: payments, error: paymentError } = await supabase
        .from<Payment>('payment')
        .select('cost_center_id, custo, maintenance_id')
        .eq('status', 'Pago');

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError);
        setLoading(false);
        return;
      }

      // Filtrar os IDs das manutenções que estão pagas
      const maintenanceIds = payments?.map(payment => payment.maintenance_id) || [];

      // Busque manutenções com status "Finalizada"
      const { data: maintenances, error: maintenanceError } = await supabase
        .from<Maintenance>('maintenance')
        .select('id')
        .in('id', maintenanceIds)
        .eq('status', 'Finalizada');

      if (maintenanceError) {
        console.error('Erro ao buscar manutenções:', maintenanceError);
        setLoading(false);
        return;
      }

      // Busque os centros de custo com suas moedas
      const { data: costCenters, error: costCenterError } = await supabase
        .from<CostCenter>('cost_center')
        .select('id, nome, moeda');

      if (costCenterError) {
        console.error('Erro ao buscar centros de custo:', costCenterError);
        setLoading(false);
        return;
      }

      // Criar um dicionário para armazenar nomes dos centros de custo
      const centerNames: Record<string, string> = {};
      costCenters?.forEach(center => {
        centerNames[center.id] = center.nome; // Mapeia ID para nome
      });
      setCostCenterNames(centerNames);

      // Criar um dicionário para armazenar custos por centro de custo
      const costByCenter: Record<string, { totalCost: number; maintenanceCount: number; currency: string }> = {};

      // Agrupar os dados
      payments?.forEach(payment => {
        const maintenanceExists = maintenances?.some(maintenance => maintenance.id === payment.maintenance_id);
        
        if (maintenanceExists) {
          const { cost_center_id, custo } = payment;

          if (!costByCenter[cost_center_id]) {
            const costCenter = costCenters?.find(center => center.id === cost_center_id);
            const currency = costCenter ? costCenter.moeda : 'BRL'; // Default para BRL se não encontrado
            costByCenter[cost_center_id] = { totalCost: 0, maintenanceCount: 0, currency };
          }

          costByCenter[cost_center_id].totalCost += custo;
          costByCenter[cost_center_id].maintenanceCount += 1;
        }
      });

      // Convertendo os custos para a moeda local
      const convertedCostData = {};
      Object.entries(costByCenter).forEach(([costCenterId, { totalCost, maintenanceCount, currency }]) => {
        const conversionRate = currencyConversionRates[currency] || 1; // Taxa de conversão padrão
        const convertedCost = totalCost / conversionRate; // Convertendo para BRL ou padrão definido
        convertedCostData[costCenterId] = { totalCost: convertedCost, maintenanceCount, currency };
      });

      setCostData(convertedCostData);
      setLoading(false);
    };

    fetchCosts();
  }, []);

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-stretch justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Custo por Centro de Custo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div>
            <ul className='"space-y-2"' >
              {Object.entries(costData).map(([costCenterId, { totalCost, maintenanceCount, currency }]) => (
                <li key={costCenterId} className="flex justify-between text-xl text-primary font-medium">
                  <span>
                  {costCenterNames[costCenterId] || costCenterId} ({maintenanceCount})
                  </span>
                  <span className="font-bold text-red-500">
                  {currency} {totalCost.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            {Object.keys(costData).length === 0 && (
              <p className="text-sm">Nenhum dado disponível.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
