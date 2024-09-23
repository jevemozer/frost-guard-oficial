"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardTitle } from "@/components/ui/card";

interface EquipmentCost {
  equipment_id: string;
  total_cost: number;
}

interface PaymentResult {
  custo: number;
  maintenance: {
    equipment_id: string;
    status: string;
  };
}

const CostByEquipment = () => {
  const [averageCost, setAverageCost] = useState<number>(0);
  const [equipmentCount, setEquipmentCount] = useState<number>(0);

  useEffect(() => {
    const fetchCostByEquipment = async () => {
      // 1. Filtrar manutenções finalizadas e pagas
      const { data: costResult, error: costError } = await supabase
        .from("payment")
        .select("custo, maintenance(equipment_id, status)")
        .eq("status", "Pago") // Pagamentos com status "Pago"
        .eq("maintenance.status", "Finalizada"); // Manutenções finalizadas

      if (costError) {
        console.error("Erro ao buscar custo por equipamento:", costError);
        return;
      }

      if (!costResult || costResult.length === 0) {
        console.warn("Nenhum custo encontrado.");
        return;
      }

      // 2. Mapear custos por equipamento
      const equipmentCostsMap = costResult.reduce(
        (acc: { [key: string]: number }, curr: PaymentResult) => {
          const equipmentId = curr.maintenance.equipment_id;
          acc[equipmentId] = (acc[equipmentId] || 0) + curr.custo;
          return acc;
        },
        {}
      );

      // 3. Contar o número de equipamentos cadastrados
      const { count: equipmentCount, error: countError } = await supabase
        .from("equipment")
        .select("*", { count: "exact" });

      if (countError) {
        console.error("Erro ao contar equipamentos:", countError);
        return;
      }

      setEquipmentCount(equipmentCount || 0);

      // 4. Calcular o custo médio por equipamento
      const formattedData = Object.entries(equipmentCostsMap).map(
        ([, total_cost]) => total_cost
      );

      if (formattedData.length > 0) {
        const totalCost = formattedData.reduce((acc, curr) => acc + curr, 0);
        const average = totalCost / formattedData.length;
        setAverageCost(average);
      }
    };

    fetchCostByEquipment();
  }, []);

  // Função para formatar o valor como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col items-center">
      <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
        Custo por Equipamento
      </CardTitle>
      <ul className="space-y-2">
        <li className="flex justify-between text-xl text-primary font-medium">
          <h4 className="text-xl text-primary font-medium">
            Nº de Equipamentos:
          </h4>
          <span className="text-red-500 font-semibold">
            {equipmentCount}
          </span>
        </li>

        <li className="flex justify-between text-xl text-primary font-medium">
          <h4 className="text-xl text-primary font-medium">Custo Médio:</h4>
          <span className="ml-4 text-red-500 font-semibold">
            {formatCurrency(averageCost)}
          </span>
        </li>
      </ul>
    </Card>
  );
};

export default CostByEquipment;
