"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { supabase } from "@/lib/supabase";

// Configuração do gráfico
const chartConfig = {
  manutenções: {
    label: "Manutenções",
  },
} satisfies ChartConfig;

// Definindo o tipo para os dados da manutenção
type MaintenanceData = {
  data_problema: string;
};

// Mudando o tipo de dados esperado para a consulta
type SupabaseResponse<T> = {
  data: T[] | null;
  error: any;
};

export default function TotalMaintenancesChart() {
  const [chartData, setChartData] = React.useState<{ month: string; count: number; fill: string; }[]>([]);
  const [totalMaintenances, setTotalMaintenances] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchMaintenanceData = async () => {
      const { data, error }: SupabaseResponse<MaintenanceData> = await supabase
        .from<MaintenanceData>("maintenance")
        .select("data_problema")
        .order("data_problema", { ascending: true });

      if (error) {
        console.error("Erro ao buscar manutenções:", error.message);
        return;
      }

      if (!data) {
        console.error("Nenhum dado encontrado.");
        return;
      }

      const groupedData = data.reduce((acc: Record<string, number>, curr: MaintenanceData) => {
        // Formatar para 'MM/YYYY' para evitar sobreposição entre diferentes anos
        const monthYear = new Date(curr.data_problema).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {});

      const formattedData = Object.entries(groupedData).map(([month, count], index) => ({
        month,
        count,
        fill: `var(--emerald-${Math.min(500 + index * 100, 900)})`, // Cores emerald
      }));

      setChartData(formattedData);
      setTotalMaintenances(formattedData.reduce((acc, curr) => acc + curr.count, 0));
    };

    fetchMaintenanceData();
  }, []);

  return (
    <Card className="bg-background shadow-md rounded-lg border border-border p-6 flex flex-col">
      <CardHeader className="text-xl p-2 font-semibold text-primary text-center mb-4">
        <CardTitle>Manutenções Realizadas por Mês</CardTitle>
        <CardDescription className="text-background">Dados de 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
              position={{ x: -50, y: 100 }}
              className="bg-primary-foreground text-xl rounded-md p-2 shadow-lg text-primary-foreground"
            />
            <Pie data={chartData} dataKey="count" nameKey="month" innerRadius={60} strokeWidth={5}>
              <Label 
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-4xl font-bold">
                          {totalMaintenances.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-primary">
                          Manutenções
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
