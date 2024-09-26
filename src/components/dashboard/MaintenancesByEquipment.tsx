"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // Importando o loader do Lucide

const MaintenancesAverageByEquipment = () => {
  const [average, setAverage] = useState<number | null>(null);
  const [totalEquipments, setTotalEquipments] = useState<number | null>(null); // Adiciona estado para o total de equipamentos
  const [loading, setLoading] = useState<boolean>(true); // Estado para controlar o loading

  useEffect(() => {
    const fetchMaintenancesData = async () => {
      // Inicia o loading
      setLoading(true);

      // Buscar os maintenance_id onde o status é "Pago"
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment')
        .select('maintenance_id')
        .eq('status', 'Pago');

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError.message);
        setLoading(false); // Para o loading em caso de erro
        return;
      }

      const maintenanceIds = paymentData?.map((payment) => payment.maintenance_id) || [];

      // Contar total de manutenções "Finalizadas" e pagas
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('*', { count: 'exact' })
        .eq('status', 'Finalizada')
        .in('id', maintenanceIds);

      if (maintenanceError) {
        console.error('Erro ao buscar manutenções:', maintenanceError.message);
        setLoading(false); // Para o loading em caso de erro
        return;
      }

      const totalMaintenances = maintenanceData?.length || 0;

      // Contar total de equipamentos
      const { count: equipmentCount, error: equipmentError } = await supabase
        .from('equipment') // Altere para o nome da sua tabela de equipamentos
        .select('*', { count: 'exact' }); // Verifique se a contagem é feita corretamente

      if (equipmentError) {
        console.error('Erro ao buscar equipamentos:', equipmentError.message);
        setLoading(false); // Para o loading em caso de erro
        return;
      }

      const totalEquipments = equipmentCount || 0; // Usa a contagem correta aqui
      setTotalEquipments(totalEquipments); // Atualiza o estado com o total de equipamentos

      // Calcular a média
      const averageMaintenance = totalEquipments > 0 ? totalMaintenances / totalEquipments : 0;
      setAverage(averageMaintenance);

      // Para o loading após a busca de dados
      setLoading(false);
    };

    fetchMaintenancesData();
  }, []);

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-2 flex flex-col justify-center text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
          Média de Manutenções por Equipamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl flex justify-center items-center font-bold text-red-500">
          {loading ? ( // Verifica se está carregando
          <div className="flex justify-center items-center text-xl font-normal">
            <Loader2 className="animate-spin h-5 w-5 mr-2 text-primary" size={24} /> Carregando dados...
          </div>
           ) : (
            average !== null ? average.toFixed(2) : 'Nenhuma manutenção encontrada'
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenancesAverageByEquipment;
