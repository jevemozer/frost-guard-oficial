import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const CostByProblemGroup = () => {
  const [data, setData] = useState<{ grupoProblema: string; custo: number }[]>([]);

  useEffect(() => {
    const fetchCostByProblemGroup = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('grupo_problema, sum(custo) as custo')
        .group('grupo_problema');

      if (error) {
        console.error('Erro ao buscar custo por grupo de problema:', error.message);
        return;
      }

      setData(result);
    };

    fetchCostByProblemGroup();
  }, []);

  return (
    <Card>
      <h3>Custo por Grupo de Problema</h3>
      <ul>
        {data.map((item) => (
          <li key={item.grupoProblema}>
            {item.grupoProblema}: R$ {item.custo.toFixed(2)}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CostByProblemGroup;
