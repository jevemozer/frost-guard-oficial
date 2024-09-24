"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardTitle } from "@/components/ui/card";

interface EquipmentCost {
  moeda: string;
  total_cost: number;
}

interface PaymentResult {
  custo: number;
  cost_center: {
    moeda: string;
  };
  maintenance: {
    equipment_id: string;
    status: string;
  };
}

const CostByEquipment = () => {
  const [costsByCurrency, setCostsByCurrency] = useState<EquipmentCost[]>([]);
  const [equipmentCount, setEquipmentCount] = useState<number>(0);

  useEffect(() => {
    const fetchCostByEquipment = async () => {
      const { data: costResult, error: costError } = await supabase
        .from("payment")
        .select("custo, cost_center(moeda), maintenance(equipment_id, status)")
        .eq("status", "Pago")
        .eq("maintenance.status", "Finalizada");

      if (costError) {
        console.error("Erro ao buscar custo por equipamento:", costError);
        return;
      }

      if (!costResult || costResult.length === 0) {
        console.warn("Nenhum custo encontrado.");
        return;
      }

      const currencyCostsMap: { [key: string]: number } = {};
      costResult.forEach((item: PaymentResult) => {
        const { moeda } = item.cost_center;
        currencyCostsMap[moeda] = (currencyCostsMap[moeda] || 0) + item.custo;
      });

      const { count: equipmentCount, error: countError } = await supabase
        .from("equipment")
        .select("*", { count: "exact" });

      if (countError) {
        console.error("Erro ao contar equipamentos:", countError);
        return;
      }

      setEquipmentCount(equipmentCount || 0);

      const formattedData: EquipmentCost[] = Object.entries(currencyCostsMap).map(
        ([moeda, total_cost]) => ({
          moeda,
          total_cost: total_cost / (equipmentCount || 1),
        })
      );

      setCostsByCurrency(formattedData);
    };

    fetchCostByEquipment();
  }, []);

  // Função para formatar o valor como moeda
  const formatCurrency = (value: number, currency: string) => {
    const currencyFormatOptions = {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    // Se a moeda não for uma das específicas, usamos a formatação padrão
    switch (currency) {
      case 'BRL':
      case 'ARS':
      case 'CLP':
      case 'PYG':
      case 'UYU':
        return new Intl.NumberFormat("pt-BR", currencyFormatOptions).format(value);
      default:
        return value.toFixed(2).replace('.', ',') + ' ' + currency; // Formatação padrão sem símbolo
    }
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center">
      <CardTitle className="text-2xl font-semibold text-primary text-center mb-4">
        Custo por Equipamento
      </CardTitle>
      <ul className="space-y-2">
        <li className="flex justify-between text-xl text-primary font-medium">
          <h4 className="text-xl text-primary font-medium">
            Nº de Equipamentos:
          </h4>
          <span className="text-red-500 font-semibold">{equipmentCount}</span>
        </li>
        {costsByCurrency.length > 0 ? (
          costsByCurrency.map((costData) => (
            <li key={costData.moeda} className="flex justify-between text-xl text-primary font-medium">
              <h4 className="text-xl text-primary font-medium">
                Custo Médio ({costData.moeda}):
              </h4>
              <span className="text-red-500 font-semibold">
                {formatCurrency(costData.total_cost, costData.moeda)}
              </span>
            </li>
          ))
        ) : (
          <li className="text-xl text-red-500 font-medium">Sem dados disponíveis</li>
        )}
      </ul>
    </Card>
  );
};

export default CostByEquipment;
