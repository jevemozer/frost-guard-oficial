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
  '#10B981', // emerald-600
  '#059669', // emerald-500
  '#047857', // emerald-400
  '#065F46', // emerald-300
  '#064E3B', // emerald-200
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
    <Card className="flex flex-col justify-center text-center">
      <CardHeader className="items-center justify-center pb-0">
        <CardTitle>Manutenções por Grupo de Problema</CardTitle>

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

      </CardFooter>
    </Card>
  );
};

export default MaintenancesByProblemGroup;
