"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // Importando o ícone de Loader2
import { convertToBRL } from '@/lib/currencyConversion'; // Importando sua função de conversão de moeda

const Top20CostlyEquipment = () => {
  const [data, setData] = useState<{ equipamento: string; custo: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTop20CostlyEquipment = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obter manutenções concluídas
        const { data: maintenances, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('id, equipment_id')
          .eq('status', 'Finalizada');

        if (maintenanceError) throw new Error(maintenanceError.message);

        if (!maintenances.length) {
          setError('Nenhuma manutenção finalizada encontrada.');
          setLoading(false);
          return;
        }

        // Obter pagamentos relacionados às manutenções com status 'Pago'
        const maintenanceIds = maintenances.map(m => m.id);
        const { data: payments, error: paymentError } = await supabase
          .from('payment')
          .select('maintenance_id, custo, cost_center_id, status')
          .in('maintenance_id', maintenanceIds)
          .eq('status', 'Pago');

        if (paymentError) throw new Error(paymentError.message);

        // Obter os centros de custo para saber a moeda
        const costCenterIds = payments.map(p => p.cost_center_id);
        const { data: costCenters, error: costCenterError } = await supabase
          .from('cost_center')
          .select('id, moeda')
          .in('id', costCenterIds);

        if (costCenterError) throw new Error(costCenterError.message);

        const costCenterMap = Object.fromEntries(costCenters.map(center => [center.id, center.moeda]));

        // Calcular custo total por equipamento
        const equipmentCosts: { [key: string]: number } = {};
        for (const payment of payments) {
          const maintenance = maintenances.find(m => m.id === payment.maintenance_id);
          if (maintenance) {
            const equipmentId = maintenance.equipment_id;

            // Converte o custo para BRL se a moeda não for BRL
            const currency = costCenterMap[payment.cost_center_id];
            const conversionResult = await convertToBRL(payment.custo, currency); // Chama sua função de conversão

            // Verifica se a conversão foi bem-sucedida
            if (conversionResult) {
              equipmentCosts[equipmentId] = (equipmentCosts[equipmentId] || 0) + conversionResult.convertedAmount; // Usa o valor convertido
            }
          }
        }

        // Obter os nomes dos equipamentos
        const equipmentIds = Object.keys(equipmentCosts);
        const { data: equipmentData, error: equipmentFetchError } = await supabase
          .from('equipment')
          .select('id, frota, modelo')
          .in('id', equipmentIds);

        if (equipmentFetchError) throw new Error(equipmentFetchError.message);

        // Mapear os nomes dos equipamentos para os custos
        const finalData = equipmentIds.map(equipmentId => {
          const equipment = equipmentData.find(e => e.id === equipmentId);
          return {
            equipamento: equipment ? `${equipment.frota.charAt(0).toUpperCase() + equipment.frota.slice(1)} - ${equipment.modelo.charAt(0).toUpperCase() + equipment.modelo.slice(1)}` : 'Desconhecido',
            custo: equipmentCosts[equipmentId],
          };
        });

        // Ordenar e limitar os 20 mais caros
        finalData.sort((a, b) => b.custo - a.custo);
        setData(finalData.slice(0, 20));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Um erro desconhecido ocorreu.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTop20CostlyEquipment();
  }, []);

  if (loading) return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-center justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Top 20 Equipamentos Mais Caros
        </CardTitle>
      </CardHeader>
      <Loader2 className="animate-spin h-6 w-6 text-primary" />
      <span className="mt-2 text-primary">Carregando dados...
      </span>
    </Card>
  );

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-stretch justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Top 20 Equipamentos Mais Caros
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 font-medium text-center">{error}</div>
        ) : data.length > 0 ? (
          <ul className="space-y-2">
            {data.map((item) => (
              <li key={item.equipamento} className="flex justify-between text-xl text-primary font-medium">
                Frota {item.equipamento}:
                <span className="font-bold text-red-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.custo)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <li className="text-xs text-primary font-medium">Nenhum dado encontrado.</li>
        )}
      </CardContent>
    </Card>
  );
};

export default Top20CostlyEquipment;
