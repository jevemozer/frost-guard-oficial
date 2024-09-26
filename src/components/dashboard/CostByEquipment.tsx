"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardTitle } from "@/components/ui/card";
import { convertToBRL } from '@/lib/currencyConversion';
import { Loader2 } from 'lucide-react'; // Importando o Loader2

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
  const [totalCostInBRL, setTotalCostInBRL] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCostByEquipment = async () => {
      setLoading(true);
      const { data: costResult, error: costError } = await supabase
        .from("payment")
        .select("custo, cost_center(moeda), maintenance(equipment_id, status)")
        .eq("status", "Pago")
        .eq("maintenance.status", "Finalizada");

      if (costError) {
        console.error("Erro ao buscar custo por equipamento:", costError);
        setLoading(false);
        return;
      }

      if (!costResult || costResult.length === 0) {
        console.warn("Nenhum custo encontrado.");
        setLoading(false);
        return;
      }

      const currencyCostsMap: { [key: string]: number } = {};
      for (const item of costResult) {
        const { moeda } = item.cost_center;
        currencyCostsMap[moeda] = (currencyCostsMap[moeda] || 0) + item.custo;
      }

      const { count: equipmentCount, error: countError } = await supabase
        .from("equipment")
        .select("*", { count: "exact" });

      if (countError) {
        console.error("Erro ao contar equipamentos:", countError);
        setLoading(false);
        return;
      }

      setEquipmentCount(equipmentCount || 0);

      const formattedData: EquipmentCost[] = [];
      let totalConvertedAmount = 0;

      for (const [moeda, total_cost] of Object.entries(currencyCostsMap)) {
        const { convertedAmount } = await convertToBRL(total_cost, moeda);
        formattedData.push({
          moeda: "BRL",
          total_cost: convertedAmount / (equipmentCount || 1),
        });
        totalConvertedAmount += convertedAmount;
      }

      setCostsByCurrency(formattedData);
      setTotalCostInBRL(totalConvertedAmount / (equipmentCount || 1));
      setLoading(false);
    };

    fetchCostByEquipment();
  }, []);

  const formatCurrency = (value: number, currency: string) => {
    const currencyFormatOptions = {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat("pt-BR", currencyFormatOptions).format(value);
  };

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col justify-center">
      <CardTitle className="text-2xl font-semibold text-primary text-center mb-6">
        Custo por Equipamento
      </CardTitle>
      <ul className="space-y-2">
        {loading ? (
          <li className="flex justify-center items-center text-xl text-red-500">
            <div className="flex justify-center items-center text-xl font-normal">
            <Loader2 className="animate-spin h-5 w-5 mr-2 text-primary" /> Carregando dados...
            </div>
          </li>
        ) : costsByCurrency.length > 0 ? (
          <>
            <li className="flex justify-between text-xl text-primary font-medium">
              <h4 className="text-xl text-primary font-medium">
                Total Geral:
              </h4>
              <span className="text-red-500 font-semibold">
                {formatCurrency(totalCostInBRL, "BRL")}
              </span>
            </li>
          </>
        ) : (
          <li className="text-xl text-red-500 font-medium">Sem dados disponíveis</li>
        )}
      </ul>
      <p className="text-center text-lg mt-4 text-foreground">
        Total de Equipamentos: {equipmentCount}
      </p>
    </Card>
  );
};

export default CostByEquipment;
