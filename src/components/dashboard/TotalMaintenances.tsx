import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card'; // Ou outro componente que você esteja usando

const TotalMaintenances = () => {
  const [totalMaintenances, setTotalMaintenances] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalMaintenances = async () => {
      const { data, error } = await supabase
        .from('manutencoes')
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
    <Card>
      <h3>Total de Manutenções</h3>
      <p>{totalMaintenances !== null ? totalMaintenances : 'Carregando...'}</p>
    </Card>
  );
};

export default TotalMaintenances;
