"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { convertToBRL } from '@/lib/currencyConversion'; // Importar a função de conversão

const Top20MostMaintainedEquipment = () => {
  const [data, setData] = useState<{ equipamento: string; manutenções: number; custoTotal: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTop20MostMaintainedEquipment = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obter manutenções finalizadas e pagas
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

        // Obter os IDs das manutenções pagas
        const maintenanceIds = maintenances.map(m => m.id);
        const { data: payments, error: paymentError } = await supabase
          .from('payment')
          .select('maintenance_id, custo, cost_center_id')
          .in('maintenance_id', maintenanceIds)
          .eq('status', 'Pago'); // Filtrando apenas pagamentos com status 'Pago'

        if (paymentError) throw new Error(paymentError.message);

        // Obter os centros de custo para verificar a moeda
        const costCenterIds = payments.map(p => p.cost_center_id);
        const { data: costCenters, error: costCenterError } = await supabase
          .from('cost_center')
          .select('id, moeda')
          .in('id', costCenterIds);

        if (costCenterError) throw new Error(costCenterError.message);

        // Mapear moedas dos centros de custo
        const costCenterMap: { [key: string]: string } = {};
        costCenters.forEach(center => {
          costCenterMap[center.id] = center.moeda;
        });

        // Contar o número de manutenções por equipamento e calcular o custo total
        const equipmentMaintenanceCount: { [key: string]: { count: number; totalCost: number } } = {};
        
        for (const payment of payments) {
          const maintenance = maintenances.find(m => m.id === payment.maintenance_id);
          if (maintenance) {
            const custo = parseFloat(payment.custo);
            const moeda = costCenterMap[payment.cost_center_id] || 'BRL'; // Usar BRL se moeda não encontrada

            // Converte o custo para BRL se não for BRL
            const conversionResult = await convertToBRL(custo, moeda);
            const convertedCost = conversionResult ? conversionResult.convertedAmount : custo; // Use o custo original se a conversão falhar

            equipmentMaintenanceCount[maintenance.equipment_id] = {
              count: (equipmentMaintenanceCount[maintenance.equipment_id]?.count || 0) + 1,
              totalCost: (equipmentMaintenanceCount[maintenance.equipment_id]?.totalCost || 0) + convertedCost
            };
          }
        }

        // Obter os IDs dos equipamentos com manutenções
        const equipmentIds = Object.keys(equipmentMaintenanceCount);
        const { data: equipmentData, error: equipmentFetchError } = await supabase
          .from('equipment')
          .select('id, frota, modelo')
          .in('id', equipmentIds);

        if (equipmentFetchError) throw new Error(equipmentFetchError.message);

        // Mapear os nomes dos equipamentos para as contagens
        const finalData = equipmentIds.map(equipmentId => {
          const equipment = equipmentData.find(e => e.id === equipmentId);
          return {
            equipamento: equipment ? `${equipment.frota.charAt(0).toUpperCase() + equipment.frota.slice(1)} - ${equipment.modelo.charAt(0).toUpperCase() + equipment.modelo.slice(1)}` : 'Desconhecido',
            manutenções: equipmentMaintenanceCount[equipmentId].count,
            custoTotal: equipmentMaintenanceCount[equipmentId].totalCost,
          };
        });

        // Ordenar e limitar os 20 equipamentos com mais manutenções
        finalData.sort((a, b) => b.manutenções - a.manutenções);
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

    fetchTop20MostMaintainedEquipment();
  }, []);

  if (loading) return <Card>Carregando...</Card>;

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-stretch justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Top 20 Equipamentos Mais Mantidos
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
                <span className="font-bold text-blue-500">
                  {item.manutenções} manutenções - Custo Total: R${item.custoTotal.toFixed(2)}
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

export default Top20MostMaintainedEquipment;
