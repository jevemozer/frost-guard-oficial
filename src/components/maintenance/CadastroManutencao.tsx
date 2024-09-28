'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import Select from 'react-select';

// Definindo os tipos para os dados
type MaintenanceFormValues = {
  data_problema: string;
  equipment_id: string;
  carreta: string;
  driver_id: string;
  city_id: number;
  diagnostic_id?: string; // Opcional
  problem_group_id?: string; // Opcional
  workshop_id?: string; // Opcional
  maintenance_type_id?: string; // Opcional
  observation?: string;
};

type Equipment = {
  id: string;
  frota: string;
};

type Driver = {
  id: string;
  nome: string;
};

type City = {
  id: number;
  name: string;
};

const CadastroManutencao = () => {
  const [open, setOpen] = useState(true); // Abre o modal automaticamente
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);  
  const [cities, setCities] = useState<City[]>([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<MaintenanceFormValues>();

  // Função que busca os dados do Supabase e da API
  const fetchData = async () => {
    try {
      // Buscando dados de equipamentos do Supabase
      const { data: equipmentData, error: equipmentError } = await supabase.from('equipment').select('*');
      if (equipmentError) throw equipmentError;
      setEquipments(equipmentData as Equipment[]);

      // Buscando dados de motoristas do Supabase
      const { data: driverData, error: driverError } = await supabase.from('driver').select('*');
      if (driverError) throw driverError;
      setDrivers(driverData as Driver[]);

      // Buscando dados das cidades da API
      const cityData = await fetchCitiesFromAPI();
      setCities(cityData as City[]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const fetchCitiesFromAPI = async () => {
    const response = await fetch('/api/cities'); // Substitua pela sua URL de API
    if (!response.ok) throw new Error('Erro ao buscar cidades');
    return await response.json();
  };

  useEffect(() => {
    fetchData(); // Chama a função para buscar dados
  }, []);

  // Função que envia os dados para o Supabase
  const onSubmit = async (data: MaintenanceFormValues) => {
    const { user } = await supabase.auth.getUser(); // Obtém informações do usuário autenticado

    const logData = {
      ...data,
      created_by: user?.id, // Adiciona o ID do usuário que realizou o cadastro
    };

    const { data: insertData, error } = await supabase.from('maintenance').insert([logData]);

    if (error) {
      console.error('Erro ao cadastrar manutenção:', error);
    } else {
      console.log('Manutenção cadastrada com sucesso:', insertData);
      reset(); // Resetar o formulário
      setOpen(false); // Fechar o modal
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Manutenção</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar uma nova manutenção</DialogDescription>
        </DialogHeader>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Data do Problema */}
          <div>
            <Label htmlFor="data_problema">Data do Problema</Label>
            <Input
              type="date"
              id="data_problema"
              {...register('data_problema', { required: 'A data do problema é obrigatória' })}
            />
            {errors.data_problema && <span className="text-red-600">{errors.data_problema.message}</span>}
          </div>

          {/* Equipamento (Select com busca) */}
          <div>
            <Label htmlFor="equipment_id">Equipamento</Label>
            <Select
              id="equipment_id"
              options={equipments.map(equipment => ({ value: equipment.id, label: equipment.frota }))}
              {...register('equipment_id', { required: 'O equipamento é obrigatório' })}
              placeholder="Selecione um equipamento"
              isClearable
            />
            {errors.equipment_id && <span className="text-red-600">{errors.equipment_id.message}</span>}
          </div>

          {/* Carreta */}
          <div>
            <Label htmlFor="carreta">Carreta</Label>
            <Input
              type="text"
              id="carreta"
              {...register('carreta', { required: 'A carreta é obrigatória' })}
            />
            {errors.carreta && <span className="text-red-600">{errors.carreta.message}</span>}
          </div>

          {/* Motorista (Select com busca) */}
          <div>
            <Label htmlFor="driver_id">Motorista</Label>
            <Select
              id="driver_id"
              options={drivers.map(driver => ({ value: driver.id, label: driver.nome }))}
              {...register('driver_id', { required: 'O motorista é obrigatório' })}
              placeholder="Selecione um motorista"
              isClearable
            />
            {errors.driver_id && <span className="text-red-600">{errors.driver_id.message}</span>}
          </div>

          {/* Cidade de Quebra (Select com busca) */}
          <div>
            <Label htmlFor="city_id">Cidade de Quebra</Label>
            <Select
              id="city_id"
              options={cities.map(city => ({ value: city.id, label: city.name }))}
              {...register('city_id', { required: 'A cidade é obrigatória' })}
              placeholder="Selecione uma cidade"
              isClearable
            />
            {errors.city_id && <span className="text-red-600">{errors.city_id.message}</span>}
          </div>

          {/* Observação */}
          <div>
            <Label htmlFor="observation">Observação</Label>
            <Input
              type="text"
              id="observation"
              {...register('observation')}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Cadastrar</Button>
          </div>
        </form>

        <DialogClose asChild>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CadastroManutencao;
