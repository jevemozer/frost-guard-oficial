"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

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
          .eq('status', 'concluída');

        if (maintenanceError) throw new Error(maintenanceError.message);

        if (!maintenances.length) {
          setError('Nenhuma manutenção concluída encontrada.');
          setLoading(false);
          return;
        }

        // Obter pagamentos relacionados às manutenções
        const maintenanceIds = maintenances.map(m => m.id);
        const { data: payments, error: paymentError } = await supabase
          .from('payment')
          .select('maintenance_id, custo')
          .in('maintenance_id', maintenanceIds);

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
            equipamento: equipment ? `${equipment.frota.charAt(0).toUpperCase()+equipment.frota.slice(1)} - ${equipment.modelo.charAt(0).toUpperCase()+equipment.modelo.slice(1)}` : 'Desconhecido',
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
    <Card className="p-6 rounded-lg bg-primary-foreground border border-border shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-center">Top 20 Equipamentos Mais Caros</h3>
      {error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <ul className="space-y-2">
          {data.length > 0 ? (
            data.map((item) => (
              <li key={item.equipamento} className="p-2 rounded bg-muted text-muted-foreground border border-border"> Frota     {item.equipamento}: R$ {item.custo.toFixed(2)}
              </li>
            ))
          ) : (
            <li className="p-2 rounded bg-muted text-muted-foreground border border-border">Nenhum dado encontrado.</li>
          )}
        </ul>
      )}
    </Card>
  );
};

export default Top20CostlyEquipment;
