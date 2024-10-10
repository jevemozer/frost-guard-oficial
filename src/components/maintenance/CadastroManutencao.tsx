'use client';

import React, { useEffect, useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { AuthContext } from '@/lib/contexts/AuthContext'; // Importa o contexto de autenticação

type MaintenanceFormValues = {
  data_problema: string;
  equipment_id: string;
  carreta: string;
  driver: string;
  city_id: number;
  diagnostic: string; // Alterado para obrigatório
};

type Equipment = {
  id: string;
  frota: string;
};

type City = {
  id: number;
  name: string;
};

const CadastroManutencao = () => {
  const [open, setOpen] = useState(true);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Novo estado para controle de loading

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<MaintenanceFormValues>();

  const equipment_id = watch('equipment_id');

  const { user } = useContext(AuthContext); // Obtém o usuário do contexto de autenticação

  useEffect(() => {
    if (!equipment_id) {
      setError('equipment_id', {
        type: 'manual',
      });
    } else {
      clearErrors('equipment_id');
    }
  }, [equipment_id, setError, clearErrors]);

  const fetchData = async () => {
    try {
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*');
      if (equipmentError) throw equipmentError;
      setEquipments(equipmentData as Equipment[]);
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      toast.error('Erro ao buscar equipamentos.');
    }
  };

  const fetchCities = async (inputValue: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('city')
        .select('*')
        .ilike('name', `%${inputValue}%`)
        .limit(10);
      if (error) throw error;
      setCities(data as City[]);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast.error('Erro ao buscar cidades.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (cityInput) {
      fetchCities(cityInput);
    } else {
      setCities([]);
    }
  }, [cityInput]);

  const onSubmit = async (data: MaintenanceFormValues) => {
    // Filtrando campos vazios
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '' && v !== 0),
    );

    setIsSubmitting(true); // Começa o loading

    try {
      // Incluindo o usuário que cadastrou a manutenção
      const { data: insertData, error } = await supabase
        .from('maintenance')
        .insert([{ ...filteredData, created_by: user?.id }]); // Adiciona o ID do usuário

      if (error) {
        console.error('Erro ao cadastrar manutenção:', error);
        toast.error('Erro ao cadastrar manutenção: ' + error.message);
      } else {
        toast.success('Manutenção cadastrada com sucesso!');
        reset();
        setOpen(false);
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado: ' + error.message);
    } finally {
      setIsSubmitting(false); // Para o loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} className="animate-fade-in">
      <DialogContent className="animate-fade-in-down">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Manutenção</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar uma nova manutenção
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="data_problema">Data do Problema</Label>
            <Input
              type="date"
              id="data_problema"
              {...register('data_problema', {
                required: 'A data do problema é obrigatória',
              })}
            />
            {errors.data_problema && (
              <span className="text-red-600">
                {errors.data_problema.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="equipment_id">Equipamento</Label>
            <Select
              id="equipment_id"
              options={equipments.map((equipment) => ({
                value: equipment.id,
                label: equipment.frota,
              }))}
              onChange={(selectedOption) =>
                setValue('equipment_id', selectedOption?.value || '')
              }
              placeholder="Selecione um equipamento"
              isClearable
            />
            {errors.equipment_id && (
              <span className="text-red-600">
                {errors.equipment_id.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="carreta">Carreta</Label>
            <Input
              type="text"
              id="carreta"
              placeholder="Insira o número da carreta" // Adicionando placeholder
              {...register('carreta', {
                required: 'A carreta é obrigatória',
                pattern: {
                  value: /^[0-9]{1,4}$/, // Regex para até 4 dígitos numéricos
                  message:
                    'A carreta deve conter apenas números e ter no máximo 4 dígitos',
                },
              })}
            />
            {errors.carreta && (
              <span className="text-red-600">{errors.carreta.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="driver">Motorista</Label>
            <Input
              type="text"
              id="driver"
              placeholder="Nome do motorista" // Adicionando placeholder
              {...register('driver', {
                required: 'O nome do motorista é obrigatório',
                pattern: {
                  value: /^[A-Za-z\s]+$/, // Regex para validar apenas letras e espaços
                  message:
                    'O nome do motorista deve conter apenas letras e espaços',
                },
              })}
            />
            {errors.driver && (
              <span className="text-red-600">{errors.driver.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="city_id">Cidade de Quebra</Label>
            <Select
              options={cities.map((city) => ({
                value: city.id,
                label: city.name,
              }))}
              onInputChange={setCityInput}
              onChange={(selectedOption) =>
                setValue('city_id', selectedOption?.value || 0)
              }
              isLoading={loading}
              placeholder="Busque uma cidade..."
              isClearable
            />
            {errors.city_id && (
              <span className="text-red-600">{errors.city_id?.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="diagnostic">Diagnóstico</Label>
            <Input
              type="text"
              id="diagnostic"
              {...register('diagnostic', {
                required: 'O diagnóstico é obrigatório',
                maxLength: {
                  value: 30,
                  message: 'O diagnóstico deve ter no máximo 30 caracteres',
                },
                pattern: {
                  value: /^[A-Za-z0-9\s]+$/, // Regex para permitir letras, números e espaços
                  message:
                    'O diagnóstico deve conter apenas letras, números e espaços',
                },
              })}
              placeholder="Descreva o diagnóstico"
            />
            {errors.diagnostic && (
              <span className="text-red-600">{errors.diagnostic.message}</span>
            )}
          </div>

          <Button
            className="text-primary text-lg font-bold bg-primary-foreground"
            type="submit"
            disabled={isSubmitting} // Desativa o botão durante o envio
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Manutenção'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CadastroManutencao;
