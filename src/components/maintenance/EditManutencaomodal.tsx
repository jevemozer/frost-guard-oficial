import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "react-toastify"; 
import { supabase } from "@/lib/supabase"; 

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

const Select: React.FC<{ label: string; name: string; options: any[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, name, options, value, onChange }) => (
  <>
    <label className="block">{label}</label>
    <select name={name} value={value} onChange={onChange} className="p-2 border rounded-lg w-full">
      <option value="">Selecione...</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.nome || option.frota || option.razao_social || option.name}
        </option>
      ))}
    </select>
  </>
);

const EditManutencaoModal: React.FC<{ manutencao: Manutencao | null; onClose: () => void }> = ({ manutencao, onClose }) => {
  const [formData, setFormData] = useState<Manutencao | null>(null);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [problemGroups, setProblemGroups] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      const [equipamentoResponse, problemGroupResponse, workshopResponse, maintenanceTypeResponse, cityResponse] = await Promise.all([
        supabase.from('equipment').select('id, frota'),
        supabase.from('problem_group').select('id, nome'),
        supabase.from('workshop').select('id, razao_social'),
        supabase.from('maintenance_type').select('id, nome'),
        supabase.from('city').select('id, name'),
      ]);

      if (equipamentoResponse.data) setEquipamentos(equipamentoResponse.data);
      if (problemGroupResponse.data) setProblemGroups(problemGroupResponse.data);
      if (workshopResponse.data) setWorkshops(workshopResponse.data);
      if (maintenanceTypeResponse.data) setMaintenanceTypes(maintenanceTypeResponse.data);
      if (cityResponse.data) setCities(cityResponse.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (manutencao) {
      setFormData({
        ...manutencao,
        data_problema: manutencao.data_problema || '',
      });
    }
  }, [manutencao]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData?.data_problema) newErrors.data_problema = "Campo obrigatório.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    if (!formData) return;

    try {
      const { error } = await supabase
        .from("maintenance")
        .update(formData)
        .eq("id", manutencao?.id);

      if (error) throw error;

      toast.success("Manutenção atualizada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar manutenção:", error);
      toast.error("Erro ao atualizar manutenção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!manutencao} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Editar Manutenção</DialogTitle>
        <div className="space-y-4">
          <label htmlFor="data_problema" className="block">Data do Problema:</label>
          <input
            id="data_problema"
            name="data_problema"
            type="datetime-local"
            value={formData?.data_problema?.slice(0, 16)}
            onChange={handleInputChange}
            className="p-2 border rounded-lg w-full"
          />
          {errors.data_problema && <p className="text-red-500">{errors.data_problema}</p>}
          
          <Select label="Frota" name="equipment_id" options={equipamentos} value={formData?.equipment_id || ""} onChange={handleInputChange} />
          <input name="carreta" value={formData?.carreta || ""} onChange={handleInputChange} placeholder="Número da Carreta" className="p-2 border rounded-lg w-full" />
          <input name="driver" value={formData?.driver || ""} onChange={handleInputChange} placeholder="Motorista" className="p-2 border rounded-lg w-full" />
          
          <Select label="Grupo de Problema" name="problem_group_id" options={problemGroups} value={formData?.problem_group_id || ""} onChange={handleInputChange} />
          <Select label="Oficina" name="workshop_id" options={workshops} value={formData?.workshop_id || ""} onChange={handleInputChange} />
          <Select label="Tipo de Manutenção" name="maintenance_type_id" options={maintenanceTypes} value={formData?.maintenance_type_id || ""} onChange={handleInputChange} />
          <Select label="Cidade" name="city_id" options={cities} value={formData?.city_id || ""} onChange={handleInputChange} />
          
          <textarea name="observation" value={formData?.observation || ""} onChange={handleInputChange} placeholder="Observações" className="p-2 border rounded-lg w-full" />

          <div className="flex justify-end">
            <button onClick={onClose} className="mr-2">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="p-2 bg-blue-600 text-white rounded-lg">
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditManutencaoModal;
