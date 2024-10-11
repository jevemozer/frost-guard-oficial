import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'; // Para formatar a data em português
import { toast } from 'react-toastify'; // Opcional: para exibir notificações
import { CheckCircle, Pencil, Trash } from 'lucide-react'; // Importando ícones
import EditManutencaoModal from './EditManutencaomodal';
import ManutencaoModal from './ManutencaoModal';
import { AuthContext } from '@/lib/contexts/AuthContext';

interface Manutencao {
  id: string;
  data_problema: string;
  carreta: string;
  status: string;
  observation: string;
  city_id: { name: string };
  equipment_id: { frota: string };
  driver: string;
  diagnostic: string;
  problem_group_id?: { nome: string };
  workshop_id?: { razao_social: string };
  maintenance_type_id?: { nome: string };
}

const statusList = [
  'Em tratativa',
  'Enviado para manutenção',
  'Em manutenção',
  'Finalizada',
];

const AcompanhamentoManutencao: React.FC = () => {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null); // Para indicar se uma ação está em andamento

  // Função para buscar as manutenções inicialmente
  const fetchManutencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select(
          ` 
          id, 
          data_problema, 
          carreta, 
          status, 
          observation, 
          city_id (name), 
          equipment_id (frota),
          created_by:profile (full_name), 
          driver, 
          diagnostic, 
          problem_group_id (nome), 
          workshop_id (razao_social), 
          maintenance_type_id (nome)
        `,
        )
        .neq('status', 'Finalizada');

      if (error) throw error;
      setManutencoes(data as Manutencao[]);
    } catch (error) {
      setError('Erro ao buscar manutenções.');
      console.error('Erro ao buscar manutenções:', error);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useContext(AuthContext);
  // Efeito para buscar as manutenções inicialmente
  useEffect(() => {
    fetchManutencoes();

    // Inscrição para escutar mudanças em tempo real
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance' },
        (payload) => {
          // Lógica para buscar apenas as manutenções alteradas
          if (
            payload.eventType === 'UPDATE' ||
            payload.eventType === 'DELETE'
          ) {
            // Verifica se a manutenção existe no estado atual
            const exists = manutencoes.some(
              (m) => m.id === payload.new?.id || m.id === payload.old?.id,
            );
            if (!exists) return; // Se não existe, não faz nada

            // Atualiza a lista de manutenções
            if (payload.eventType === 'UPDATE') {
              // Se o status foi alterado para "Finalizada"
              if (payload.new.status === 'Finalizada') {
                setManutencoes((prev) =>
                  prev.filter((manutencao) => manutencao.id !== payload.new.id),
                );
              } else {
                setManutencoes((prev) =>
                  prev.map((manutencao) =>
                    manutencao.id === payload.new.id ? payload.new : manutencao,
                  ),
                );
              }
            } else if (payload.eventType === 'DELETE') {
              setManutencoes((prev) =>
                prev.filter((manutencao) => manutencao.id !== payload.old.id),
              );
            }
          } else if (payload.eventType === 'INSERT') {
            // Para novos registros, adiciona diretamente
            setManutencoes((prev) => [...prev, payload.new]);
          }
        },
      )
      .subscribe();

    // Cleanup: desconecta o canal quando o componente é desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, [manutencoes]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setProcessing(id);

    // Encontra a manutenção atual pelo ID
    const manutencao = manutencoes.find((m) => m.id === id);

    // Verifica se o novo status é 'Finalizada' e se todos os campos obrigatórios estão preenchidos
    if (newStatus === 'Finalizada') {
      if (
        !manutencao?.data_problema ||
        !manutencao?.carreta ||
        !manutencao?.city_id?.name ||
        !manutencao?.equipment_id?.frota ||
        !manutencao?.driver ||
        !manutencao?.diagnostic ||
        !manutencao?.problem_group_id?.nome ||
        !manutencao?.workshop_id?.razao_social
      ) {
        toast.error(
          'Preencha todos os campos obrigatórios antes de finalizar a manutenção.',
        );
        setProcessing(null);
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      if (newStatus === 'Finalizada') {
        // Se o status for 'Finalizada', registra no sistema de pagamento
        await supabase.from('payment').insert({
          maintenance_id: id,
          status: 'Pendente',
          custo: 0,
          created_at: new Date().toISOString(),
          created_by: user?.id,
        });

        toast.success('Manutenção finalizada e registrada no financeiro.');
        // Remove a manutenção finalizada do estado
        setManutencoes((prev) => prev.filter((m) => m.id !== id));
      } else {
        // Atualiza o status da manutenção no estado
        setManutencoes((prev) =>
          prev.map((manutencao) =>
            manutencao.id === id
              ? { ...manutencao, status: newStatus }
              : manutencao,
          ),
        );
        toast.success('Status da manutenção atualizado com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);
      toast.error('Erro ao atualizar o status.');
    } finally {
      setProcessing(null);
    }
  };

  const handleExcluirManutencao = async (id: string) => {
    const confirm = window.confirm(
      'Tem certeza que deseja excluir esta manutenção?',
    );
    if (confirm) {
      setProcessing(id);
      try {
        const { error } = await supabase
          .from('maintenance')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setManutencoes((prev) => prev.filter((m) => m.id !== id));
        toast.success('Manutenção excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir a manutenção:', error);
        toast.error('Erro ao excluir a manutenção.');
      } finally {
        setProcessing(null);
      }
    }
  };

  const [selectedManutencao, setSelectedManutencao] =
    useState<Manutencao | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Adicionando estado para o modal

  const handleEditManutencao = (manutencao: Manutencao) => {
    setSelectedManutencao(manutencao);
    setIsEditModalOpen(true); // Abre o modal de edição
  };

  const handleRowClick = (manutencao: Manutencao) => {
    setSelectedManutencao(manutencao);
    setIsModalOpen(true); // Abre o modal de visualização
  };

  const formatName = (
    name: string | undefined,
    capitalizeWords: boolean = false,
  ) => {
    if (!name) return ''; // Verificação condicional

    if (capitalizeWords) {
      return name
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
    } else {
      const [firstName, lastName] = name.split(' ');
      return `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${
        lastName?.charAt(0)?.toUpperCase() + lastName?.slice(1) // Uso de optional chaining
      }`;
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <table className="min-w-full border border-border text-primary text-center">
        <thead>
          <tr className="bg-emerald-200">
            <th className="p-3">Data do Problema</th>
            <th className="p-3">Equipamento</th>
            <th className="p-3">Motorista</th>
            <th className="p-3">Carreta</th>
            <th className="p-3">Cidade</th>
            <th className="p-3">Diagnóstico</th>
            <th className="p-3">Grupo de Problema</th>
            <th className="p-3">Oficina</th>
            <th className="p-3">Tipo de Manutenção</th>
            <th className="p-3">Status</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {manutencoes.map((manutencao) => (
            <tr
              key={manutencao.id}
              className="hover:bg-gray-100 transition"
              onDoubleClick={() => handleRowClick(manutencao)}
            >
              <td className="p-2">
                {format(new Date(manutencao.data_problema), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </td>
              <td className="p-2">{manutencao.equipment_id.frota}</td>
              <td className="p-2">{formatName(manutencao.driver)}</td>
              <td className="p-2">{manutencao.carreta}</td>
              <td className="p-2">{manutencao.city_id?.name || '-'}</td>
              <td className="p-2">{manutencao.diagnostic}</td>
              <td className="p-2">
                {manutencao.problem_group_id?.nome || '-'}
              </td>
              <td className="p-3">
                {formatName(manutencao.workshop_id?.razao_social, true)}
              </td>
              <td className="p-2">
                {manutencao.maintenance_type_id?.nome || '-'}
              </td>
              <td className="p-2">
                <select
                  className=" p-2 rounded-lg"
                  value={manutencao.status}
                  onChange={(e) =>
                    handleStatusChange(manutencao.id, e.target.value)
                  }
                >
                  {statusList.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>

              <td className="p-2 flex justify-center gap-2">
                <div className="relative group">
                  <button
                    onClick={() => handleEditManutencao(manutencao)}
                    className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                  >
                    <Pencil className="inline-block w-4 h-4" />
                  </button>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-max hidden group-hover:block bg-primary-foreground text-primary text-xs rounded p-1">
                    Editar
                  </span>
                </div>

                <div className="relative group">
                  <button
                    onClick={() =>
                      handleStatusChange(manutencao.id, 'Finalizada')
                    }
                    disabled={processing === manutencao.id}
                    className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                  >
                    <CheckCircle className="inline-block w-4 h-4" />
                  </button>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-max hidden group-hover:block bg-primary-foreground text-primary  text-xs rounded p-1">
                    Finalizar
                  </span>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => handleExcluirManutencao(manutencao.id)}
                    disabled={processing === manutencao.id}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <Trash className="inline-block w-4 h-4" />
                  </button>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-max hidden group-hover:block bg-primary-foreground text-primary  text-xs rounded p-1">
                    Excluir
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ManutencaoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        manutencao={selectedManutencao}
      />

      {isEditModalOpen && selectedManutencao && (
        <EditManutencaoModal
          manutencao={selectedManutencao}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};

export default AcompanhamentoManutencao;
