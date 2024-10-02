import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR"; // Para formatar a data em português
import { toast } from "react-toastify"; // Opcional: para exibir notificações
import { CheckCircle, Trash } from "lucide-react"; // Importando ícones

interface Manutencao {
  id: string;
  data_problema: string;
  carreta: string;
  status: string;
  observation: string;
  city_id: { name: string };
  equipment_id: { frota: string };
  driver_id: { nome: string };
  diagnostic_id?: { descricao: string };
  problem_group_id?: { nome: string };
  workshop_id?: { razao_social: string };
  maintenance_type_id?: { nome: string };
}

const AcompanhamentoManutencao: React.FC = () => {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null); // Para indicar se uma ação está em andamento

  // Função para buscar as manutenções inicialmente
  const fetchManutencoes = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .select(` 
          id, 
          data_problema, 
          carreta, 
          status, 
          observation, 
          city_id (name), 
          equipment_id (frota), 
          driver_id (nome), 
          diagnostic_id (descricao), 
          problem_group_id (nome), 
          workshop_id (razao_social), 
          maintenance_type_id (nome)
        `)
        .neq("status", "Finalizada");

      if (error) throw error;
      setManutencoes(data as Manutencao[]);
    } catch (error) {
      setError("Erro ao buscar manutenções.");
      console.error("Erro ao buscar manutenções:", error);
    } finally {
      setLoading(false);
    }
  };

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
          if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
            // Verifica se a manutenção existe no estado atual
            const exists = manutencoes.some((m) => m.id === payload.new?.id || m.id === payload.old?.id);
            if (!exists) return; // Se não existe, não faz nada

            // Atualiza a lista de manutenções
            if (payload.eventType === "UPDATE") {
              // Se o status foi alterado para "Finalizada"
              if (payload.new.status === "Finalizada") {
                setManutencoes((prev) => prev.filter((manutencao) => manutencao.id !== payload.new.id));
              } else {
                setManutencoes((prev) =>
                  prev.map((manutencao) =>
                    manutencao.id === payload.new.id ? payload.new : manutencao
                  )
                );
              }
            } else if (payload.eventType === "DELETE") {
              setManutencoes((prev) =>
                prev.filter((manutencao) => manutencao.id !== payload.old.id)
              );
            }
          } else if (payload.eventType === "INSERT") {
            // Para novos registros, adiciona diretamente
            setManutencoes((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    // Cleanup: desconecta o canal quando o componente é desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, [manutencoes]);

  const handleFinalizarManutencao = useCallback(
    async (manutencao: Manutencao) => {
      const { id, data_problema, carreta, city_id, equipment_id, driver_id, diagnostic_id, problem_group_id, workshop_id, maintenance_type_id } = manutencao;

      if (
        !data_problema ||
        !carreta ||
        !city_id?.name ||
        !equipment_id?.frota ||
        !driver_id?.nome ||
        !diagnostic_id?.descricao ||
        !problem_group_id?.nome ||
        !workshop_id?.razao_social ||
        !maintenance_type_id?.nome
      ) {
        toast.error("Preencha todos os campos obrigatórios antes de finalizar.");
        return;
      }

      setProcessing(id); // Define o ID como o que está sendo processado
      try {
        const { error: updateError } = await supabase
          .from("maintenance")
          .update({ status: "Finalizada" })
          .eq("id", id);

        if (updateError) throw updateError;

        const { error: paymentError } = await supabase.from("payment").insert({
          maintenance_id: id,
          status: "Pendente",
          custo: 0,
          created_at: new Date().toISOString(),
        });

        if (paymentError) throw paymentError;

        setManutencoes((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, status: "Finalizada" } : m
          )
        );

        toast.success("Manutenção finalizada e registrada no controle financeiro.");
      } catch (error) {
        console.error("Erro ao finalizar manutenção:", error);
        toast.error("Erro ao finalizar manutenção.");
      } finally {
        setProcessing(null);
      }
    },
    [setManutencoes]
  );

  const handleExcluirManutencao = useCallback(
    async (id: string) => {
      const confirm = window.confirm("Tem certeza que deseja excluir esta manutenção?");
      if (confirm) {
        setProcessing(id); 
        try {
          const { error } = await supabase.from("maintenance").delete().eq("id", id);

          if (error) throw error;

          setManutencoes((prev) => prev.filter((m) => m.id !== id));
          toast.success("Manutenção excluída com sucesso!");
        } catch (error) {
          console.error("Erro ao excluir a manutenção:", error);
          toast.error("Erro ao excluir a manutenção.");
        } finally {
          setProcessing(null);
        }
      }
    },
    [setManutencoes]
  );

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <table className="min-w-full border border-border text-primary text-center">
      <thead>
        <tr className="bg-emerald-100 dark:bg-emerald-600">
          <th className="p-2">Data do Problema</th>
          <th className="p-2">Equipamento</th>
          <th className="p-2">Motorista</th>
          <th className="p-2">Carreta</th>
          <th className="p-2">Cidade</th>
          <th className="p-2">Diagnóstico</th>
          <th className="p-2">Grupo de Problema</th>
          <th className="p-2">Oficina</th>
          <th className="p-2">Tipo de Manutenção</th>
          <th className="p-2">Status</th>
          <th className="p-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {manutencoes.map((manutencao) => (
          <tr key={manutencao.id} className="border-t border-border">
            <td className="p-2">
              {format(new Date(manutencao.data_problema), "dd/MM/yyyy", { locale: ptBR })}
            </td>
            <td className="p-2">{manutencao.equipment_id.frota}</td>
            <td className="p-2">{manutencao.driver_id.nome}</td>
            <td className="p-2">{manutencao.carreta}</td>
            <td className="p-2">{manutencao.city_id.name}</td>
            <td className="p-2">{manutencao.diagnostic_id?.descricao || "Sem diagnóstico"}</td>
            <td className="p-2">{manutencao.problem_group_id?.nome || "Sem grupo"}</td>
            <td className="p-2">{manutencao.workshop_id?.razao_social || "Sem oficina"}</td>
            <td className="p-2">{manutencao.maintenance_type_id?.nome || "Sem tipo"}</td>
            <td className="p-2">{manutencao.status || "Pendente"}</td>
            <td className="p-2 flex space-x-2 justify-center">
              <button
                className="text-green-500 hover:text-green-700"
                onClick={() => handleFinalizarManutencao(manutencao)}
                disabled={processing === manutencao.id}
              >
                {processing === manutencao.id ? (
                  "Processando..."
                ) : (
                  <CheckCircle className="w-5 h-5" /> // Ícone de finalizar
                )}
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleExcluirManutencao(manutencao.id)}
                disabled={processing === manutencao.id}
              >
                <Trash className="w-5 h-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AcompanhamentoManutencao;