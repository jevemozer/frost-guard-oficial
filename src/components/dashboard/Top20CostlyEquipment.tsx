"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const Top20CostlyEquipment = () => {
  const [data, setData] = useState<{ equipamento: string; custo: number }[]>([]);

  useEffect(() => {
    const fetchTop20CostlyEquipment = async () => {
      // Obter o custo total de manutenções pagas e concluídas
      const { data: maintenances, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('equipment_id, id')
        .eq('status', 'concluído'); // Apenas manutenções concluídas

      if (maintenanceError) {
        console.error('Erro ao buscar manutenções:', maintenanceError.message);
        return;
      }

      // Obter os custos de pagamento das manutenções
      const maintenanceIds = maintenances.map(m => m.id);
      const { data: payments, error: paymentError } = await supabase
        .from('payment')
        .select('maintenance_id, sum(custo) as custo')
        .in('maintenance_id', maintenanceIds)
        .group('maintenance_id');

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError.message);
        return;
      }

      // Agregar custo por equipamento
      const equipmentCosts: { [key: string]: number } = {};
      payments.forEach(payment => {
        const maintenance = maintenances.find(m => m.id === payment.maintenance_id);
        if (maintenance) {
          const equipmentId = maintenance.equipment_id;
          if (!equipmentCosts[equipmentId]) {
            equipmentCosts[equipmentId] = 0;
          }
          equipmentCosts[equipmentId] += Number(payment.custo);
        }
      });

      // Obter os nomes dos equipamentos
      const equipmentIds = Object.keys(equipmentCosts);
      const { data: equipmentData, error: equipmentFetchError } = await supabase
        .from('equipment')
        .select('id, frota, modelo')
        .in('id', equipmentIds);

      if (equipmentFetchError) {
        console.error('Erro ao buscar equipamentos:', equipmentFetchError.message);
        return;
      }

      // Mapear os nomes dos equipamentos para os custos
      const finalData = equipmentIds.map(equipmentId => {
        const equipment = equipmentData.find(e => e.id === equipmentId);
        return {
          equipamento: equipment ? `${equipment.frota} - ${equipment.modelo}` : 'Desconhecido',
          custo: equipmentCosts[equipmentId],
        };
      });

      // Ordenar e limitar os 20 mais caros
      finalData.sort((a, b) => b.custo - a.custo);
      setData(finalData.slice(0, 20));
    };

    fetchTop20CostlyEquipment();
  }, []);

  return (
    <Card className="p-6 rounded-lg bg-card dark:bg-card border border-border shadow-md">
      <h3 className="text-xl font-semibold mb-4">Top 20 Equipamentos Mais Caros</h3>
      <ul className="space-y-2">
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.equipamento} className="p-2 rounded bg-muted text-muted-foreground border border-border">
              {item.equipamento}: R$ {item.custo.toFixed(2)}
            </li>
          ))
        ) : (
          <li className="p-2 rounded bg-muted text-muted-foreground border border-border">Nenhum dado encontrado.</li>
        )}
      </ul>
    </Card>
  );
};

export default Top20CostlyEquipment;
