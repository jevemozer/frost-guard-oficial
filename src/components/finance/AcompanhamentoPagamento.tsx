import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'; // Para formatar as datas em português
import { toast } from 'react-toastify'; // Para exibir notificações
import { CheckCircle, Pencil, Trash } from 'lucide-react'; // Ícones
import { AuthContext } from '@/lib/contexts/AuthContext';

interface Payment {
  id: string;
  maintenance_id: string;
  cost_center_id: string;
  payment_condition_id: string;
  numero_nf: string;
  custo: number;
  data_vencimento: string;
  created_at: string;
  status: string;
  payment_date: string | null;
  created_by: string;
  maintenance: {
    frota: string; // Adicionando o campo frota
  };
  cost_center: {
    nome: string; // Nome do centro de custo
  };
  payment_condition: {
    condicao: string; // Condição de pagamento
  };
}

const statusList = ['Pendente', 'Pago', 'Cancelado'];

const AcompanhamentoPagamento: React.FC = () => {
  const [pagamentos, setPagamentos] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useContext(AuthContext); // Obtém o contexto de autenticação

  // Função para buscar pagamentos da tabela
  const fetchPagamentos = async () => {
    try {
      const { data, error } = await supabase.from('payment').select(
        `
            id,
            maintenance_id,
            cost_center_id,
            payment_condition_id,
            numero_nf,
            custo,
            data_vencimento,
            created_at,
            status,
            payment_date,
            created_by,
            maintenance (frota), -- Pegando a frota vinculada
            cost_center (nome), -- Nome do centro de custo
            payment_condition (condicao) -- Condição de pagamento
          `,
      );

      if (error) throw error;
      setPagamentos(data as Payment[]);
    } catch (error) {
      setError('Erro ao buscar pagamentos.');
      console.error('Erro ao buscar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentos();

    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment' },
        (payload) => {
          // Atualiza a lista de pagamentos em tempo real
          if (payload.eventType === 'INSERT') {
            setPagamentos((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setPagamentos((prev) =>
              prev.map((payment) =>
                payment.id === payload.new.id ? payload.new : payment,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setPagamentos((prev) =>
              prev.filter((payment) => payment.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('payment')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setPagamentos((prev) =>
        prev.map((payment) =>
          payment.id === id ? { ...payment, status: newStatus } : payment,
        ),
      );
      toast.success('Status do pagamento atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar o status do pagamento:', error);
      toast.error('Erro ao atualizar o status.');
    } finally {
      setProcessing(null);
    }
  };

  const handleExcluirPagamento = async (id: string) => {
    const confirm = window.confirm(
      'Tem certeza que deseja excluir este pagamento?',
    );
    if (confirm) {
      setProcessing(id);
      try {
        const { error } = await supabase.from('payment').delete().eq('id', id);
        if (error) throw error;
        setPagamentos((prev) => prev.filter((payment) => payment.id !== id));
        toast.success('Pagamento excluído com sucesso.');
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error);
        toast.error('Erro ao excluir o pagamento.');
      } finally {
        setProcessing(null);
      }
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (loading) return <p>Carregando pagamentos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Acompanhamento de Pagamentos</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2">NF</th>
            <th className="py-2">Frota</th>
            <th className="py-2">Centro de Custo</th>
            <th className="py-2">Condição de Pagamento</th>
            <th className="py-2">Custo</th>
            <th className="py-2">Data de Vencimento</th>
            <th className="py-2">Status</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pagamentos.map((payment) => (
            <tr key={payment.id}>
              <td className="py-2">{payment.numero_nf}</td>
              <td className="py-2">{payment.maintenance?.frota || 'N/A'}</td>
              <td className="py-2">{payment.cost_center?.nome || 'N/A'}</td>
              <td className="py-2">
                {payment.payment_condition?.condicao || 'N/A'}
              </td>
              <td className="py-2">R$ {payment.custo.toFixed(2)}</td>
              <td className="py-2">{formatDate(payment.data_vencimento)}</td>
              <td className="py-2">{payment.status}</td>
              <td className="py-2 flex gap-2 justify-center">
                <button
                  className="text-green-500"
                  onClick={() => handleStatusChange(payment.id, 'Pago')}
                  disabled={processing === payment.id}
                >
                  <CheckCircle />
                </button>
                <button
                  className="text-blue-500"
                  onClick={() => handleStatusChange(payment.id, 'Pendente')}
                  disabled={processing === payment.id}
                >
                  <Pencil />
                </button>
                <button
                  className="text-red-500"
                  onClick={() => handleExcluirPagamento(payment.id)}
                  disabled={processing === payment.id}
                >
                  <Trash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcompanhamentoPagamento;
