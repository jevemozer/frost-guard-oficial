// src/components/maintenance/AcompanhamentoManutencao.tsx

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AcompanhamentoManutencao: React.FC = () => {
  const [manutencoes, setManutencoes] = useState([]);

  useEffect(() => {
    const fetchManutencoes = async () => {
      const { data, error } = await supabase
        .from("manutencoes")
        .select("*");

      if (error) {
        console.error("Erro ao buscar manutenções:", error);
      } else {
        setManutencoes(data);
      }
    };

    fetchManutencoes();
  }, []);

  return (
    <table className="min-w-full">
      <thead>
        <tr>
          <th>ID</th>
          <th>Data</th>
          <th>Frota</th>
          <th>Motorista</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {manutencoes.map((manutencao) => (
          <tr key={manutencao.id}>
            <td>{manutencao.id}</td>
            <td>{manutencao.data}</td>
            <td>{manutencao.frota}</td>
            <td>{manutencao.motorista}</td>
            <td>{manutencao.status || "Pendente"}</td>
            <td>
              {/* Aqui você pode adicionar botões de ação, como editar ou excluir */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AcompanhamentoManutencao;
