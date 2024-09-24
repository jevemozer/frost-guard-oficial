"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Top20CostlyEquipment = () => {
  const [data, setData] = useState<{ equipamento: string; custo: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTop20CostlyEquipment = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obter o id do centro de custo Brasil
        const { data: costCenters, error: costCenterError } = await supabase
          .from('cost_center')
          .select('id')
          .eq('nome', 'Brasil'); // Filtrando pelo nome do centro de custo

        if (costCenterError) throw new Error(costCenterError.message);
        if (!costCenters.length) {
          setError('Centro de custo Brasil não encontrado.');
          setLoading(false);
          return;
        }

        const brasilCostCenterId = costCenters[0].id;

        // Obter manutenções concluídas
        const { data: maintenances, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('id, equipment_id')
          .eq('status', 'Finalizada'); // Modificado para 'Finalizada'

        if (maintenanceError) throw new Error(maintenanceError.message);

        if (!maintenances.length) {
          setError('Nenhuma manutenção finalizada encontrada.');
          setLoading(false);
          return;
        }

        // Obter pagamentos relacionados às manutenções com status 'Pago' e do centro de custo Brasil
        const maintenanceIds = maintenances.map(m => m.id);
        const { data: payments, error: paymentError } = await supabase
          .from('payment')
          .select('maintenance_id, custo')
          .in('maintenance_id', maintenanceIds)
          .eq('status', 'Pago') // Filtrando apenas pagamentos com status 'Pago'
          .eq('cost_center_id', brasilCostCenterId); // Filtrando pelo centro de custo Brasil

        if (paymentError) throw new Error(paymentError.message);

        // Calcular custo total por equipamento
        const equipmentCosts: { [key: string]: number } = {};
        payments.forEach(payment => {
          const maintenance = maintenances.find(m => m.id === payment.maintenance_id);
          if (maintenance) {
            const equipmentId = maintenance.equipment_id;
            equipmentCosts[equipmentId] = (equipmentCosts[equipmentId] || 0) + Number(payment.custo);
          }
        });

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTop20CostlyEquipment();
  }, []);

  if (loading) return <Card>Carregando...</Card>;

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-stretch justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
        Top 20 Equipamentos Mais Caros (Brasil)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
        ) : (
          <ul className="space-y-2">
            {data.length > 0 ? (
              data.map((item) => (
                <li key={item.equipamento} className="flex justify-between text-xl text-primary font-medium">
                  Frota {item.equipamento}:
                  <span className="font-bold text-red-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.custo)}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-primary font-medium">Nenhum dado encontrado.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default Top20CostlyEquipment;
