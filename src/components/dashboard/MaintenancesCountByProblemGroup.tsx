"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const MaintenancesCountByProblemGroup = () => {
  const [data, setData] = useState<{ grupoProblema: string; count: number; totalCost: number }[]>([]);

  useEffect(() => {
    const fetchMaintenancesCountByProblemGroup = async () => {
      const { data: maintenances, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('problem_group_id, id, status')
        .eq('status', 'concluída'); // Filtrar apenas manutenções concluídas

      if (maintenanceError) {
        console.error('Erro ao buscar manutenções:', maintenanceError.message);
        return;
      }

      const { data: payments, error: paymentError } = await supabase
        .from('payment')
        .select('maintenance_id, custo, status')
        .eq('status', 'pago'); // Filtrar apenas pagamentos pagos

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError.message);
        return;
      }

      // Agrupar dados por grupo de problemas
      const groupedData: Record<string, { count: number; totalCost: number }> = {};

      // Criar um conjunto de ids de manutenção pagas
      const paidMaintenanceIds = new Set(payments.map(payment => payment.maintenance_id));

      maintenances.forEach((maintenance) => {
        const groupId = maintenance.problem_group_id;

        // Verificar se a manutenção está no conjunto de pagamentos pagos
        if (paidMaintenanceIds.has(maintenance.id)) {
          if (!groupedData[groupId]) {
            groupedData[groupId] = { count: 0, totalCost: 0 };
          }

          groupedData[groupId].count += 1;
          const payment = payments.find(p => p.maintenance_id === maintenance.id);
          if (payment) {
            const cost = Number(payment.custo) || 0; // Converte custo para número
            groupedData[groupId].totalCost += cost;
          }
        }
      });

      // Transformar o objeto em um array
      const finalData = await Promise.all(
        Object.entries(groupedData).map(async ([groupId, { count, totalCost }]) => {
          const { data: groupNameData, error: groupError } = await supabase
            .from('problem_group')
            .select('nome')
            .eq('id', groupId)
            .single();

          if (groupError) {
            console.error('Erro ao buscar nome do grupo de problema:', groupError.message);
            return {
              grupoProblema: 'Desconhecido',
              count,
              totalCost,
            };
          }

          return {
            grupoProblema: groupNameData?.nome || 'Desconhecido',
            count,
            totalCost,
          };
        })
      );

      setData(finalData);
    };

    fetchMaintenancesCountByProblemGroup();
  }, []);

  return (
    <Card className="p-6 rounded-lg bg-primary-foreground border border-border shadow-md text-primary">
      <h3 className="text-xl font-semibold mb-4 text-center text-primary">Manutenções por Grupo de Problema</h3>
      <ul className="space-y-2">
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.grupoProblema} className="p-2 rounded bg-muted text-muted-foreground border border-border">
              {item.grupoProblema.charAt(0).toLocaleUpperCase() + item.grupoProblema.slice(1)}: {item.count} - Custo total: R$ {item.totalCost.toFixed(2)}
            </li>
          ))
        ) : (
          <li className="p-2 rounded bg-muted text-muted-foreground border border-border">Nenhum dado encontrado.</li>
        )}
      </ul>
    </Card>
  );
};

export default MaintenancesCountByProblemGroup;
