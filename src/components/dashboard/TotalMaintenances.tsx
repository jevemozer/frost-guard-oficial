"use client"; // Adicione esta linha

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from "lucide-react"; // Ícone de ferramenta

const TotalMaintenances = () => {
  const [totalMaintenances, setTotalMaintenances] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalMaintenances = async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Erro ao buscar manutenções:', error.message);
        return;
      }

      setTotalMaintenances(data?.length || 0);
    };

    fetchTotalMaintenances();
  }, []);

  return (
    <Card className="bg-white shadow-md rounded-lg border border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Total de Manutenções</CardTitle>
        <Wrench className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {totalMaintenances !== null ? totalMaintenances : 'Carregando...'}
        </div>
        <p className="text-xs text-muted-foreground">
          {totalMaintenances !== null ? `${totalMaintenances} manutenções registradas` : ''}
        </p>
      </CardContent>
    </Card>
  );
};

export default TotalMaintenances;
