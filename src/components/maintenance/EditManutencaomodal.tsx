import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase';
import Select from 'react-select'; // Importa o react-select
import debounce from 'lodash/debounce'; // Importando a função de debounce

interface Manutencao {
  id: string;
  driver: string;
  diagnostic: string;
  data_problema: string;
  equipment_id: string;
  carreta: string;
  problem_group_id: string;
  workshop_id: string;
  maintenance_type_id: string;
  observation: string;
  city_id: string;
}

interface Equipamento {
  id: string;
  frota: string;
}

const EditManutencaoModal: React.FC<{
  manutencao: Manutencao | null;
  onClose: () => void;
}> = ({ manutencao, onClose }) => {
  const [formData, setFormData] = useState<Manutencao | null>(null);
  const [originalData, setOriginalData] = useState<Manutencao | null>(null);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [problemGroups, setProblemGroups] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [cityInput, setCityInput] = useState<string>(''); // Estado para entrada da cidade
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Função debounce para buscar cidades
  const fetchCities = debounce(async (inputValue: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('city')
      .select('id, name')
      .ilike('name', `%${inputValue}%`); // Busca cidades que contêm o valor de entrada

    if (error) {
      toast.error('Erro ao buscar cidades.');
      console.error('Erro ao buscar cidades:', error);
      return;
    }

    if (data) {
      setCities(data);
    }
    setLoading(false);
  }, 300); // 300 ms de delay

  useEffect(() => {
    const fetchInitialData = async () => {
      const [
        equipamentoResponse,
        problemGroupResponse,
        workshopResponse,
        maintenanceTypeResponse,
      ] = await Promise.all([
        supabase.from('equipment').select('id, frota'),
        supabase.from('problem_group').select('id, nome'),
        supabase.from('workshop').select('id, razao_social'),
        supabase.from('maintenance_type').select('id, nome'),
      ]);

      if (equipamentoResponse.data) setEquipamentos(equipamentoResponse.data);
      if (problemGroupResponse.data)
        setProblemGroups(problemGroupResponse.data);
      if (workshopResponse.data) setWorkshops(workshopResponse.data);
      if (maintenanceTypeResponse.data)
        setMaintenanceTypes(maintenanceTypeResponse.data);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (manutencao) {
      setFormData({ ...manutencao });
      setOriginalData({ ...manutencao }); // Armazena os valores originais
    }
  }, [manutencao]);

  // Monitorando mudanças na entrada da cidade
  useEffect(() => {
    if (cityInput) {
      fetchCities(cityInput); // Chama a função de busca de cidades
    } else {
      setCities([]); // Limpa as cidades se a entrada estiver vazia
    }
  }, [cityInput]); // Adicionando cityInput como dependência

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData?.data_problema)
      newErrors.data_problema = 'Campo obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption: any, name: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption?.value, // Altera para o valor selecionado
    }));
  };

  const handleCityInputChange = (inputValue: string) => {
    setCityInput(inputValue); // Atualiza a entrada da cidade
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    if (!formData) return;

    // Filtra os campos que foram alterados
    const updatedData = Object.keys(formData).reduce((acc, key) => {
      if (formData[key] !== originalData![key]) {
        acc[key] = formData[key];
      }
      return acc;
    }, {} as Partial<Manutencao>);

    if (Object.keys(updatedData).length === 0) {
      toast.info('Nenhuma alteração detectada.');
      onClose();
      return;
    }

    try {
      const { error } = await supabase
        .from('maintenance')
        .update(updatedData)
        .eq('id', manutencao?.id);

      if (error) throw error;

      toast.success('Manutenção atualizada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar manutenção:', error);
      toast.error('Erro ao atualizar manutenção.');
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = (options: any[]) => {
    return options.map((option) => ({
      value: option.id,
      label: option.nome || option.frota || option.razao_social || option.name,
    }));
  };

  return (
    <Dialog open={!!manutencao} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Editar Manutenção</DialogTitle>
        <div className="space-y-3">
          <label htmlFor="data_problema" className="block">
            Data do Problema:
          </label>
          <input
            id="data_problema"
            name="data_problema"
            type="datetime-local"
            value={formData?.data_problema?.slice(0, 16)}
            onChange={handleInputChange}
            className="p-2 border rounded-lg w-full"
          />
          {errors.data_problema && (
            <p className="text-red-500">{errors.data_problema}</p>
          )}

          <Select
            options={formatOptions(equipamentos)}
            value={
              equipamentos.find((e) => e.id === formData?.equipment_id)
                ? formatOptions(equipamentos).find(
                    (o) => o.value === formData.equipment_id,
                  )
                : null
            }
            onChange={(option) => handleSelectChange(option, 'equipment_id')}
            placeholder="Selecione a Frota..."
          />
          <input
            name="carreta"
            value={formData?.carreta || ''}
            onChange={handleInputChange}
            placeholder="Número da Carreta"
            className="p-2 border rounded-lg w-full"
          />
          <input
            name="driver"
            value={formData?.driver || ''}
            onChange={handleInputChange}
            placeholder="Motorista"
            className="p-2 border rounded-lg w-full"
          />

          <textarea
            name="diagnostic"
            value={formData?.diagnostic || ''}
            onChange={handleInputChange}
            placeholder="Diagnóstico"
            className="p-2 border rounded-lg w-full"
          />

          <Select
            options={formatOptions(problemGroups)}
            value={
              problemGroups.find((g) => g.id === formData?.problem_group_id)
                ? formatOptions(problemGroups).find(
                    (o) => o.value === formData.problem_group_id,
                  )
                : null
            }
            onChange={(option) =>
              handleSelectChange(option, 'problem_group_id')
            }
            placeholder="Selecione o Grupo de Problema..."
          />
          <Select
            options={formatOptions(workshops)}
            value={
              workshops.find((w) => w.id === formData?.workshop_id)
                ? formatOptions(workshops).find(
                    (o) => o.value === formData.workshop_id,
                  )
                : null
            }
            onChange={(option) => handleSelectChange(option, 'workshop_id')}
            placeholder="Selecione a Oficina..."
          />
          <Select
            options={formatOptions(maintenanceTypes)}
            value={
              maintenanceTypes.find(
                (mt) => mt.id === formData?.maintenance_type_id,
              )
                ? formatOptions(maintenanceTypes).find(
                    (o) => o.value === formData.maintenance_type_id,
                  )
                : null
            }
            onChange={(option) =>
              handleSelectChange(option, 'maintenance_type_id')
            }
            placeholder="Selecione o Tipo de Manutenção..."
          />

          <Select
            options={cities.map((city) => ({
              value: city.id,
              label: city.name,
            }))}
            onInputChange={handleCityInputChange} // Atualiza a entrada da cidade
            isLoading={loading}
            placeholder="Busque uma cidade..."
            onChange={(option) => handleSelectChange(option, 'city_id')}
            inputValue={cityInput} // Liga a entrada da cidade ao valor do estado
          />

          <textarea
            name="observation"
            value={formData?.observation || ''}
            onChange={handleInputChange}
            placeholder="Observações"
            className="p-2 border rounded-lg w-full bg-primary-foreground text-primary"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              {loading ? 'Atualizando...' : 'Atualizar Manutenção'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditManutencaoModal;
