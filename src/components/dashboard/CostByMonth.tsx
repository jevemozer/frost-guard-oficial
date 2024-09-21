import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const CostByMonth = () => {
  const [data, setData] = useState<{ mes: string; custo: number }[]>([]);

  useEffect(() => {
    const fetchCostByMonth = async () => {
      const { data: result, error } = await supabase
        .from('manutencoes')
        .select('date_trunc("month", data) as mes, sum(custo) as custo')
        .group('mes');

      if (error) {
        console.error('Erro ao buscar custo por mês:', error.message);
        return;
      }

      setData(result);
    };

    fetchCostByMonth();
  }, []);

  return (
    <Card>
      <h3>Custo por Mês</h3>
      <ul>
        {data.map((item) => (
          <li key={item.mes}>
            {new Date(item.mes).toLocaleString('default', { month: 'long' })}: R$ {item.custo.toFixed(2)}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default CostByMonth;
