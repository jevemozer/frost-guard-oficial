"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

type Maintenance = {
  id: string;
  data_problema: string;
  status: string;
};

type Payment = {
  maintenance_id: string;
  custo: number;
};

export default function TotalMaintenances() {
  const [totalCost, setTotalCost] = useState<number>(0);
  const [totalMaintenances, setTotalMaintenances] = useState<number>(0);
  const [monthlyMaintenances, setMonthlyMaintenances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number, currency: string): string => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    switch (currency) {
      case 'BRL':
        return new Intl.NumberFormat('pt-BR', options).format(amount);
      case 'ARS':
        return new Intl.NumberFormat('es-AR', options).format(amount);
      case 'CLP':
        return new Intl.NumberFormat('es-CL', options).format(amount);
      case 'PYG':
        return new Intl.NumberFormat('es-PY', options).format(amount);
      case 'UYU':
        return new Intl.NumberFormat('es-UY', options).format(amount);
      default:
        return amount.toFixed(2);
    }
  };

  useEffect(() => {
    const fetchMaintenances = async () => {
      setLoading(true);

      const { data: paymentData, error: paymentError } = await supabase
        .from<Payment>('payment')
        .select('maintenance_id, custo')
        .eq('status', 'Pago');

      if (paymentError) {
        console.error('Erro ao buscar pagamentos:', paymentError);
        setLoading(false);
        return;
      }

      const maintenanceIds = paymentData?.map((payment) => payment.maintenance_id) || [];
      const totalPaymentCost = paymentData?.reduce((sum, payment) => sum + payment.custo, 0) || 0;

      const { data, error } = await supabase
        .from<Maintenance>('maintenance')
        .select('id, data_problema, status')
        .eq('status', 'Finalizada')
        .in('id', maintenanceIds);

      if (error) {
        console.error('Erro ao buscar manutenções:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setTotalMaintenances(data.length);
        setTotalCost(totalPaymentCost);

        const monthlyCount: Record<string, number> = {};
        data.forEach((maintenance: Maintenance) => {
          const month = format(new Date(maintenance.data_problema), 'MMMM yyyy', { locale: ptBR });
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
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-red-500"> 
              {totalMaintenances}
            </p>
            <p className="text-2xl font-bold text-green-500"> 
              Custo Total: {formatCurrency(totalCost, 'BRL')} {/* Troque 'BRL' se necessário */}
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
