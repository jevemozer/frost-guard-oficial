import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

const TotalCost = () => {
  const [totalCost, setTotalCost] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalCost = async () => {
      const { data, error } = await supabase
        .from('manutencoes')
        .select('custo')
        .then((res) => res.data.reduce((acc, curr) => acc + curr.custo, 0));

      if (error) {
        console.error('Erro ao buscar custo total:', error.message);
        return;
      }

      setTotalCost(data);
    };

    fetchTotalCost();
  }, []);

  return (
    <Card>
      <h3>Custo Total</h3>
      <p>{totalCost !== null ? `R$ ${totalCost.toFixed(2)}` : 'Carregando...'}</p>
    </Card>
  );
};

export default TotalCost;
