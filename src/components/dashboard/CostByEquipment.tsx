"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface EquipmentCost {
  equipment_id: string;
  total_cost: number;
}

interface PaymentResult {
  custo: number;
  maintenance: {
    equipment_id: string;
  };
}

const CostByEquipment = () => {
  const [averageCost, setAverageCost] = useState<number>(0);
  const [equipmentCount, setEquipmentCount] = useState<number>(0);
  const [equipmentCosts, setEquipmentCosts] = useState<EquipmentCost[]>([]);

  useEffect(() => {
    const fetchCostByEquipment = async () => {
      const { data: costResult, error: costError } = await supabase
        .from('payment')
        .select('custo, maintenance(equipment_id)')
        .eq('status', 'pago');

      if (costError) {
        console.error('Erro ao buscar custo por equipamento:', costError);
        return;
      }

      if (!costResult || costResult.length === 0) {
        console.warn('Nenhum custo encontrado.');
        return;
      }

      const equipmentCostsMap = costResult.reduce((acc: { [key: string]: number }, curr: PaymentResult) => {
        const equipmentId = curr.maintenance.equipment_id;
        acc[equipmentId] = (acc[equipmentId] || 0) + curr.custo;
        return acc;
      }, {});

      const formattedData = Object.entries(equipmentCostsMap).map(([equipment_id, total_cost]) => ({
        equipment_id,
        total_cost,
      }));

      setEquipmentCosts(formattedData);

      const { count = 0, error: countError } = await supabase
        .from('equipment')
        .select('*', { count: 'exact' });

      if (countError) {
        console.error('Erro ao contar equipamentos:', countError);
        return;
      }

      setEquipmentCount(count);

      if (count > 0) {
        const totalCusto = Object.values(equipmentCostsMap).reduce((a, b) => a + b, 0);
        const average = totalCusto / count;
        setAverageCost(average);
      } else {
        console.warn('Nenhum equipamento encontrado.');
      }
    };

    fetchCostByEquipment();
  }, []);

  return (
    <Card className="p-6 rounded-lg bg-foreground dark:bg-card text-foreground shadow-md">
      <h3 className="text-xl font-semibold text-balance mb-4">Custo por Equipamento</h3>
      <h4 className="text-lg font-semibold mt-2">Número de Equipamentos: <span className="text-foreground">{equipmentCount}</span></h4>
      <h4 className="text-lg font-semibold mt-2">Custo Médio por Equipamento: <span className="text-balance text-red-600">R$ {averageCost.toFixed(2)}</span></h4>
    </Card>
  );
};

export default CostByEquipment;
