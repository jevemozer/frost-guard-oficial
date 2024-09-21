export interface Equipment {
  id: string;
  frota: string;
  modelo: string;
  ano: number;
  marca: string;
}

export interface Driver {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
}

export interface City {
  id: string;
  nome: string;
  estado: string;
  pais: string;
}

export interface Diagnostic {
  id: string;
  descricao: string;
}

export interface Workshop {
  id: string;
  razao_social: string;
  endereco: string;
  telefone: string;
  dados_financeiros?: string;
}

export interface ProblemGroup {
  id: string;
  nome: string;
}

export interface CostCenter {
  id: string;
  nome: string;
}

export interface MaintenanceType {
  id: string;
  nome: string;
}

export interface PaymentCondition {
  id: string;
  descricao: string;
}

export interface Maintenance {
  id: string;
  data_problema: Date;
  equipment_id: string;
  carreta: string;
  driver_id: string;
  city_id: string;
  diagnostic_id: string;
  problem_group_id: string;
  workshop_id: string;
  maintenance_type_id: string;
  observation?: string;
  status: string;
  created_by: string;
  created_at: Date;
}

export interface Payment {
  id: string;
  maintenance_id: string;
  cost_center_id: string;
  payment_condition_id: string;
  numero_nf?: string;
  custo: number;
  data_vencimento: Date;
  status: string;
  created_at: Date;
}

export interface ResetPasswordFormProps {
  accessToken: string;
}