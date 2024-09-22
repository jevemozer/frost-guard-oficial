"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const Top20MostMaintainedEquipment = () => {
  const [data, setData] = useState<{ id: string; frota: string; count: number }[]>([]);

  useEffect(() => {
    const fetchTop20MostMaintainedEquipment = async () => {
      const { data: maintenances, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('equipment_id')
        .eq('status', 'concluída'); // Filtra apenas manutenções concluídas

      if (maintenanceError) {
        console.error('Erro ao buscar manutenções:', maintenanceError.message);
        return;
      }

      // Agrupar manutenções por equipamento
      const maintenanceCount: Record<string, number> = {};
      maintenances.forEach((maintenance) => {
        const equipmentId = maintenance.equipment_id;
        maintenanceCount[equipmentId] = (maintenanceCount[equipmentId] || 0) + 1;
      });

      // Obter os 20 equipamentos mais mantidos
      const topEquipmentIds = Object.entries(maintenanceCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([id]) => id);

      // Obter informações dos equipamentos
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, frota')
        .in('id', topEquipmentIds);

      if (equipmentError) {
        console.error('Erro ao buscar dados dos equipamentos:', equipmentError.message);
        return;
      }

      // Combinar dados das manutenções e equipamentos
      const combinedData = topEquipmentIds.map((id) => {
        const count = maintenanceCount[id];
        const equipment = equipmentData.find(eq => eq.id === id);
        return {
          id: equipment?.id || 'Desconhecido',
          frota: equipment?.frota || 'Desconhecido',
          count: count || 0,
        };
      });

      setData(combinedData);
    };

    fetchTop20MostMaintainedEquipment();
  }, []);

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col">
      <h3 className="text-xl font-semibold text-primary text-center mb-4">Top 20 Equipamentos Mais Mantidos</h3>
      <ul className="space-y-2">
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.id} className="p-3 rounded-md text-primary bg-muted flex justify-between items-center">
              {item.frota.charAt(0).toUpperCase()+item.frota.slice(1)}:
              <span className="font-bold text-red-500">{item.count} manutenções </span>
            </li>
          ))
        ) : (
          <li className="p-2 rounded bg-muted text-muted-foreground border border-border">Nenhum dado encontrado.</li>
        )}
      </ul>
    </Card>
  );
};

export default Top20MostMaintainedEquipment;
