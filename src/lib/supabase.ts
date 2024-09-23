import { createClient } from '@supabase/supabase-js';

// Inicialize o cliente do Supabase usando as chaves públicas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para atualizar o status de uma manutenção
export async function updateMaintenanceStatus(maintenanceId: string, status: string) {
  const { error } = await supabase
    .from('manutencoes')
    .update({ status })
    .eq('id', maintenanceId);

  if (error) {
    console.error('Erro ao atualizar status:', error.message);
    return false;
  }

  return true;
}

// Função para concluir uma manutenção
export async function completeMaintenance(maintenanceId: string) {
  const { error } = await supabase
    .from('manutencoes')
    .update({ status: 'concluida' })
    .eq('id', maintenanceId);

  if (error) {
    console.error('Erro ao concluir manutenção:', error.message);
    return false;
  }

  return true;
}
