import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR"; // Para formatar a data em português
import { toast } from "react-toastify"; // Opcional: para exibir notificações

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

  useEffect(() => {
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
          `);

        if (error) throw error;
        setManutencoes(data as Manutencao[]);
      } catch (error) {
        setError("Erro ao buscar manutenções.");
        console.error("Erro ao buscar manutenções:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchManutencoes();
  }, []);

  const handleFinalizarManutencao = useCallback(
    async (id: string) => {
      setProcessing(id); // Define o ID como o que está sendo processado
      try {
        const { error: updateError } = await supabase
          .from("maintenance")
          .update({ status: "Finalizada" })
          .eq("id", id);

        if (updateError) throw updateError;

        const { error: paymentError } = await supabase.from("payment").insert({
          maintenance_id: id,
          status: "Aguardando Informações",
          created_at: new Date().toISOString(),
        });

        if (paymentError) throw paymentError;

        // Atualiza a lista local de manutenções
        setManutencoes((prev) =>
          prev.map((manutencao) =>
            manutencao.id === id ? { ...manutencao, status: "Finalizada" } : manutencao
          )
        );

        toast.success("Manutenção finalizada e registrada no controle financeiro.");
      } catch (error) {
        console.error("Erro ao finalizar manutenção:", error);
        toast.error("Erro ao finalizar manutenção.");
      } finally {
        setProcessing(null); // Reseta o estado de processamento
      }
    },
    [setManutencoes] // Garantir que as dependências estejam corretas
  );

  const handleExcluirManutencao = useCallback(
    async (id: string) => {
      const confirm = window.confirm("Tem certeza que deseja excluir esta manutenção?");
      if (confirm) {
        setProcessing(id); // Marca o ID como o que está sendo processado
        try {
          const { error } = await supabase.from("maintenance").delete().eq("id", id);

          if (error) throw error;

          setManutencoes((prev) => prev.filter((m) => m.id !== id));
          toast.success("Manutenção excluída com sucesso!");
        } catch (error) {
          console.error("Erro ao excluir a manutenção:", error);
          toast.error("Erro ao excluir a manutenção.");
        } finally {
          setProcessing(null); // Reseta o estado de processamento
        }
      }
    },
    [setManutencoes]
  );

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          <th>Data do Problema</th>
          <th>Equipamento</th>
          <th>Motorista</th>
          <th>Carreta</th>
          <th>Cidade</th>
          <th>Diagnóstico</th>
          <th>Grupo de Problema</th>
          <th>Oficina</th>
          <th>Tipo de Manutenção</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {manutencoes.map((manutencao) => (
          <tr key={manutencao.id} className="border-t">
            <td>
              {format(new Date(manutencao.data_problema), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </td>
            <td>{manutencao.equipment_id.frota}</td>
            <td>{manutencao.driver_id.nome}</td>
            <td>{manutencao.carreta}</td>
            <td>{manutencao.city_id.name}</td>
            <td>{manutencao.diagnostic_id?.descricao || "Sem diagnóstico"}</td>
            <td>{manutencao.problem_group_id?.nome || "Sem grupo"}</td>
            <td>{manutencao.workshop_id?.razao_social || "Sem oficina"}</td>
            <td>{manutencao.maintenance_type_id?.nome || "Sem tipo"}</td>
            <td>{manutencao.status || "Pendente"}</td>
            <td>
              <button
                className="text-green-500"
                onClick={() => handleFinalizarManutencao(manutencao.id)}
                disabled={processing === manutencao.id} // Desabilita o botão durante o processamento
              >
                {processing === manutencao.id ? "Processando..." : "Finalizar"}
              </button>
              <button
                className="text-red-500 ml-2"
                onClick={() => handleExcluirManutencao(manutencao.id)}
                disabled={processing === manutencao.id} // Desabilita o botão durante o processamento
              >
                {processing === manutencao.id ? "Processando..." : "Excluir"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AcompanhamentoManutencao;
