'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Edit, Trash, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CompleteMaintenance } from '@/components/maintenance/CompleteMaintenance';

export default function MaintenanceGrid({ refresh }: { refresh: boolean }) {
  const [maintenances, setMaintenances] = useState([]);

  useEffect(() => {
    const fetchMaintenances = async () => {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*');

      if (error) {
        console.error(error);
      } else {
        setMaintenances(data);
      }
    };

    fetchMaintenances();
  }, [refresh]); // Recarrega sempre que refresh for alterado

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Equipamento</TableCell>
          <TableCell>Motorista</TableCell>
          <TableCell>Data Problema</TableCell>
          <TableCell>Ações</TableCell>
        </TableRow>
      </TableHead>
      <tbody>
        {maintenances.map((maintenance) => (
          <TableRow key={maintenance.id}>
            <TableCell>{maintenance.equipment_id}</TableCell>
            <TableCell>{maintenance.driver_id}</TableCell>
            <TableCell>{maintenance.data_problema}</TableCell>
            <TableCell>
              <Button variant="icon">
                <Edit className="mr-2" />
              </Button>
              <CompleteMaintenance
                maintenanceId={maintenance.id}
                requiredFieldsFilled={true}
                onComplete={() => setRefresh((prev) => !prev)}
              />
              <Button variant="icon">
                <Trash className="ml-2" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}
