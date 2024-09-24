'use client'; // Adicionando o 'use client' para que o componente funcione no lado do cliente

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Equipment = {
  id: string;
  frota: string;
  modelo: string;
};

type EquipmentMaintenance = {
  equipment: Equipment;
  maintenance_count: number;
};

export default function Top20MostMaintainedEquipment() {
  const [topEquipment, setTopEquipment] = useState<EquipmentMaintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopEquipment = async () => {
      setLoading(true);

      try {
        // Primeiro, pegamos o ID do centro de custo "Brasil"
        const { data: costCenterData, error: costCenterError } = await supabase
          .from('cost_center')
          .select('id')
          .eq('nome', 'Brasil')
          .single(); // Esperamos um único resultado

        if (costCenterError || !costCenterData) throw costCenterError;

        const brasilCostCenterId = costCenterData.id;

        // Busca as manutenções finalizadas relacionadas ao centro de custo "Brasil"
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance')
          .select('id, equipment_id')
          .eq('status', 'Finalizada');

        if (maintenanceError) throw maintenanceError;

        // Busca os pagamentos com status "Pago" relacionados ao centro de custo "Brasil"
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment')
          .select('maintenance_id')
          .eq('status', 'Pago')
          .eq('cost_center_id', brasilCostCenterId);

        if (paymentError) throw paymentError;

        // Filtra os maintenance_ids que estão pagos
        const paymentIds = paymentData?.map((payment) => payment.maintenance_id) || [];

        // Filtra as manutenções que estão pagas e que pertencem ao centro de custo Brasil
        const filteredMaintenances = maintenanceData?.filter((maintenance) =>
          paymentIds.includes(maintenance.id)
        ) || [];

        // Conta o número de manutenções por equipamento
        const equipmentCount: Record<string, number> = {};
        filteredMaintenances.forEach((maintenance) => {
          const { equipment_id } = maintenance;

          if (!equipmentCount[equipment_id]) {
            equipmentCount[equipment_id] = 0;
          }
          equipmentCount[equipment_id]++;
        });

        // Ordena os equipamentos pelo número de manutenções e pega os top 20
        const sortedEquipment = Object.entries(equipmentCount)
          .map(([equipment_id, maintenance_count]) => ({
            equipment_id,
            maintenance_count,
          }))
          .sort((a, b) => b.maintenance_count - a.maintenance_count)
          .slice(0, 20);

        // Busca os detalhes dos equipamentos (frota e modelo)
        const equipmentIds = sortedEquipment.map(e => e.equipment_id);
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, frota, modelo')
          .in('id', equipmentIds);

        if (equipmentError) throw equipmentError;

        // Mapeia os dados dos equipamentos com as manutenções
        const topEquipmentDetails = sortedEquipment.map(e => {
          const equipment = equipmentData?.find(eq => eq.id === e.equipment_id);
          return {
            equipment,
            maintenance_count: e.maintenance_count,
          };
        }).filter(item => item.equipment);

        setTopEquipment(topEquipmentDetails);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopEquipment();
  }, []);

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-stretch justify-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Top 20 Equipamentos com Mais Manutenções (Brasil)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <ul className="space-y-2">
            {topEquipment.length === 0 ? (
              <li className="flex justify-between text-xl text-primary font-medium">Nenhum equipamento encontrado.</li>
            ) : (
              topEquipment.map((item) => (
                <li key={item.equipment.id} className="flex justify-between text-xl text-primary font-medium">
                  <span>
                    Frota {item.equipment.frota.charAt(0).toUpperCase() + item.equipment.frota.slice(1)} - {item.equipment.modelo.charAt(0).toUpperCase() + item.equipment.modelo.slice(1)}
                  </span>
                  <span>{item.maintenance_count}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
