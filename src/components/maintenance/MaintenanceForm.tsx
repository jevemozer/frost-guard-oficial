'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';

interface MaintenanceFormData {
  date: string;
  equipment: string;
  truck: string;
  driver: string;
  city: string;
  diagnosis: string;
  problemGroup: string;
  workshop: string;
  maintenanceType: string;
  observations: string;
}

export default function MaintenanceForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceFormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true);
    const { error } = await supabase.from('manutencoes').insert({ ...data });

    if (error) {
      console.error('Error saving data:', error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input type="date" {...register('date', { required: true })} placeholder="Data do Problema" />
      {errors.date && <p className="text-red-500">Campo obrigatório</p>}
      <Combobox placeholder="Equipamento" {...register('equipment', { required: true })}>
        {/* Pull data from Supabase */}
      </Combobox>
      {/* Rest of the form fields */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </form>
  );
}
