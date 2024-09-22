"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { LabelList, Pie, PieChart } from "recharts";

const emeraldColors = [
  'var(--emerald-600)', // emerald-600
  'var(--emerald-500)', // emerald-500
  'var(--emerald-400)', // emerald-400
  'var(--emerald-300)', // emerald-300
  'var(--emerald-200)', // emerald-200
];

const MaintenancesByProblemGroup = () => {
  const [data, setData] = useState<{ problemGroup: string; count: number }[]>([]);

  useEffect(() => {
    const fetchMaintenancesByProblemGroup = async () => {
      const { data: maintenances, error: maintenancesError } = await supabase
        .from('maintenance')
        .select('problem_group_id');

      if (maintenancesError) {
        console.error('Erro ao buscar manutenções:', maintenancesError.message);
        return;
      }

      const { data: problemGroups, error: groupsError } = await supabase
        .from('problem_group')
        .select('id, nome');

      if (groupsError) {
        console.error('Erro ao buscar grupos de problema:', groupsError.message);
        return;
      }

      const counts = problemGroups.map(group => {
        const count = maintenances.filter(m => m.problem_group_id === group.id).length;
        return {
          problemGroup: group.nome,
          count,
        };
      }).filter(group => group.count > 0);

      setData(counts);
    };

    fetchMaintenancesByProblemGroup();
  }, []);

  const chartData = data.map((item, index) => ({
    name: item.problemGroup,
    value: item.count,
    fill: emeraldColors[index % emeraldColors.length], // Usa as cores emerald
  }));

  const chartConfig = {
    value: {
      label: "Count",
    },
  };

  return (
    <Card className="flex flex-col justify-center text-center bg-card text-card-foreground border border-border rounded-lg">
      <CardHeader className="items-center justify-center pb-0">
        <CardTitle className="text-lg font-semibold">Manutenções por Grupo de Problema</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip />
            <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
              <LabelList
                dataKey="name"
                className="fill-background"
                stroke="none"
                fontSize={12}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* Adicione conteúdo do footer se necessário */}
      </CardFooter>
    </Card>
  );
};

export default MaintenancesByProblemGroup;
