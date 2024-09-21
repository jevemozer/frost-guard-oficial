import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const MaintenancesByProblemGroup = () => {
  const [data, setData] = useState<{ grupoProblema: string; count: number }[]>([]);

  useEffect(() => {
    const fetchMaintenancesByProblemGroup = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('grupo_problema, count(*) as count')
        .group('grupo_problema');

      if (error) {
        console.error('Erro ao buscar manutenções por grupo de problema:', error.message);
        return;
      }

      setData(result);
    };

    fetchMaintenancesByProblemGroup();
  }, []);

  return (
    <Card>
      <h3>Manutenções por Grupo de Problema</h3>
      <ul>
        {data.map((item) => (
          <li key={item.grupoProblema}>
            {item.grupoProblema}: {item.count}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default MaintenancesByProblemGroup;
