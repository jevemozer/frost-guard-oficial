"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MaintenancesAverageByEquipment = () => {
  const [average, setAverage] = useState<number | null>(null);

  useEffect(() => {
    const fetchMaintenancesData = async () => {
      // Contar total de manutenções
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('*', { count: 'exact' });

      if (maintenanceError) {
        console.error('Erro ao buscar manutenções:', maintenanceError.message);
        return;
      }

      const totalMaintenances = maintenanceData?.length || 0;

      // Contar total de equipamentos
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment') // Altere para o nome da sua tabela de equipamentos
        .select('*', { count: 'exact' });

      if (equipmentError) {
        console.error('Erro ao buscar equipamentos:', equipmentError.message);
        return;
      }

      const totalEquipments = equipmentData?.length || 0;

      // Calcular a média
      const averageMaintenance = totalEquipments > 0 ? totalMaintenances / totalEquipments : 0;
      setAverage(averageMaintenance);
    };

    fetchMaintenancesData();
  }, []);

  return (
    <Card className="bg-white shadow-md rounded-lg border border-border p-4">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">Média de Manutenções por Equipamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {average !== null ? average.toFixed(2) : 'Carregando...'}
        </div>
        <p className="text-xs text-muted-foreground">
          {average !== null ? `${average.toFixed(2)} manutenções por equipamento` : ''}
        </p>
      </CardContent>
    </Card>
  );
};

export default MaintenancesAverageByEquipment;
