"use client";

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
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">Média de Manutenções</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-red-500">
          {average !== null ? average.toFixed(2) : 'Carregando...'}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenancesAverageByEquipment;
