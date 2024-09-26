"use client"

// src/app/components/TotalMaintenances.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importa o locale pt-BR
import { Loader2 } from 'lucide-react';

type Maintenance = {
  id: string;
  data_problema: string;
  status: string;
};

export default function TotalMaintenances() {
  const [totalMaintenances, setTotalMaintenances] = useState<number>(0);
  const [monthlyMaintenances, setMonthlyMaintenances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenances = async () => {
      setLoading(true);

      // Primeiro, busque os maintenance_id onde o status é "Pago"
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment')
        .select('maintenance_id')
        .eq('status', 'Pago');

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError);
        setLoading(false);
        return;
      }

      const maintenanceIds = paymentData?.map((payment) => payment.maintenance_id) || [];

      // Em seguida, busque as manutenções com os ids obtidos e status "Finalizada"
      const { data, error } = await supabase
        .from('maintenance')
        .select('id, data_problema, status')
        .eq('status', 'Finalizada')
        .in('id', maintenanceIds);

      if (error) {
        console.error('Erro ao buscar manutenções:', error);
        setLoading(false);
        return;
      }

      if (data) {
        // Número total de manutenções
        setTotalMaintenances(data.length);

        // Agrupar manutenções por mês
        const monthlyCount: Record<string, number> = {};
        data.forEach((maintenance: Maintenance) => {
          const month = format(new Date(maintenance.data_problema), 'MMMM yyyy', {
            locale: ptBR,
          });

          const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

          if (!monthlyCount[capitalizedMonth]) {
            monthlyCount[capitalizedMonth] = 0;
          }
          monthlyCount[capitalizedMonth]++;
        });

        setMonthlyMaintenances(monthlyCount);
      }
      setLoading(false);
    };

    fetchMaintenances();
  }, []);

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-2 flex flex-col justify-center text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary text-center">
          Total de Manutenções Finalizadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin h-5 w-5 mr-2 text-primary" /> Carregando dados...
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-red-500"> 
              {totalMaintenances}
            </p>
            <div className="mt-4">
              <h3 className="text-md p-1 font-bold">Manutenções por Mês:</h3>
              <ul>
                {Object.keys(monthlyMaintenances).map((month) => (
                  <li key={month} className="text-sm">
                    {month}: {monthlyMaintenances[month]}{' '}
                    {monthlyMaintenances[month] === 1 ? 'manutenção' : 'manutenções'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
