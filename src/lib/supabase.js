import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente para conexão com o Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis de ambiente estão definidas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Cria o cliente Supabase se as variáveis estiverem configuradas
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Modo de demonstração (quando não há conexão com o Supabase)
const DEMO_MODE = !isSupabaseConfigured;

// Dados de demonstração
const demoData = {
  usuarios: [
    { id: 1, email: 'admin@vidracaria.com', nome: 'Administrador', role: 'admin' }
  ],
  orcamentos: [
    { id: 1, cliente: 'João Silva', valor_total: 850, data: '2025-06-05', status: 'aprovado' },
    { id: 2, cliente: 'Maria Oliveira', valor_total: 1200, data: '2025-06-04', status: 'pendente' },
    { id: 3, cliente: 'Carlos Santos', valor_total: 3500, data: '2025-06-03', status: 'aprovado' }
  ],
  ordens_servico: [
    { id: 1, cliente: 'João Silva', produto: 'Porta de vidro temperado', status: 'em_producao', data_entrega: '2025-06-10' },
    { id: 2, cliente: 'Maria Oliveira', produto: 'Box para banheiro', status: 'em_aberto', data_entrega: '2025-06-15' },
    { id: 3, cliente: 'Carlos Santos', produto: 'Espelho decorativo', status: 'entregue', data_entrega: '2025-06-01' }
  ],
  estoque: [
    { id: 1, codigo: 'V123', nome: 'Vidro temperado 8mm', descricao: 'Vidro temperado incolor 8mm', quantidade: 10, quantidade_minima: 5, unidade: 'chapa', valor_unitario: 250, fornecedor: 'Vidros Brasil', localizacao: 'Prateleira A1', ultima_entrada: '2025-06-01' },
    { id: 2, codigo: 'V456', nome: 'Vidro comum 4mm', descricao: 'Vidro comum incolor 4mm', quantidade: 3, quantidade_minima: 5, unidade: 'chapa', valor_unitario: 120, fornecedor: 'Vidros Brasil', localizacao: 'Prateleira A2', ultima_entrada: '2025-05-15' },
    { id: 3, codigo: 'P789', nome: 'Perfil de alumínio', descricao: 'Perfil de alumínio para box de banheiro', quantidade: 5, quantidade_minima: 10, unidade: 'barra', valor_unitario: 80, fornecedor: 'Alumínios SA', localizacao: 'Prateleira B1', ultima_entrada: '2025-05-20' }
  ],
  estoque_movimentacoes: [
    { id: 1, produto_id: 1, produto_nome: 'Vidro temperado 8mm', tipo: 'entrada', quantidade: 5, data: '2025-06-01', motivo: 'compra', observacoes: 'Compra mensal' },
    { id: 2, produto_id: 1, produto_nome: 'Vidro temperado 8mm', tipo: 'saida', quantidade: 2, data: '2025-06-02', motivo: 'venda', observacoes: 'Venda para cliente João' },
    { id: 3, produto_id: 2, produto_nome: 'Vidro comum 4mm', tipo: 'entrada', quantidade: 10, data: '2025-05-15', motivo: 'compra', observacoes: '' }
  ],
  caixa: [
    { id: 1, data: '2025-06-05', hora_abertura: '08:30', valor_inicial: 200, status: 'aberto', observacoes_abertura: 'Início do expediente', hora_fechamento: null, valor_final: null, valor_sistema: null, diferenca: null, observacoes_fechamento: null }
  ],
  caixa_movimentacoes: [
    { id: 1, caixa_id: 1, data: '2025-06-05', hora: '09:00', tipo: 'entrada', valor: 150, descricao: 'Recebimento à vista', forma_pagamento: 'dinheiro', observacoes: '' },
    { id: 2, caixa_id: 1, data: '2025-06-05', hora: '10:30', tipo: 'entrada', valor: 350, descricao: 'Pagamento de orçamento #123', forma_pagamento: 'cartao_credito', observacoes: 'Parcelado em 3x' },
    { id: 3, caixa_id: 1, data: '2025-06-05', hora: '12:30', tipo: 'saida', valor: 50, descricao: 'Compra de material de escritório', forma_pagamento: 'dinheiro', observacoes: '' }
  ],
  caixa_fechamentos: [
    { id: 1, data: '2025-06-04', hora_abertura: '08:00', hora_fechamento: '18:00', valor_inicial: 150, valor_final: 850, valor_sistema: 850, diferenca: 0, total_entradas: 800, total_saidas: 100, observacoes: '' },
    { id: 2, data: '2025-06-03', hora_abertura: '08:15', hora_fechamento: '18:30', valor_inicial: 200, valor_final: 1200, valor_sistema: 1250, diferenca: -50, total_entradas: 1200, total_saidas: 150, observacoes: 'Diferença a verificar' }
  ],
  financas: [
    { id: 1, tipo: 'receita', descricao: 'Venda de vidro temperado', valor: 1200, categoria: 'vendas', data: '2025-06-05' },
    { id: 2, tipo: 'despesa', descricao: 'Compra de material', valor: 500, categoria: 'fornecedores', data: '2025-06-04' },
    { id: 3, tipo: 'receita', descricao: 'Instalação de box', valor: 350, categoria: 'servicos', data: '2025-06-03' }
  ]
};

/**
 * Busca todos os registros de uma tabela
 */
export async function fetchAll(table, options = {}) {
  const { limit, orderBy, orderDirection = 'desc', filters = [] } = options;
  
  // Se estiver no modo de demonstração, retorna dados simulados
  if (DEMO_MODE) {
    console.log(`[DEMO MODE] Buscando dados da tabela ${table}`);
    
    // Retorna os dados de demonstração para a tabela solicitada
    let data = demoData[table] || [];
    
    // Aplicar filtros (simulação simplificada)
    if (filters.length > 0) {
      data = data.filter(item => {
        return filters.every(filter => {
          const { column, operator, value } = filter;
          
          switch (operator) {
            case 'eq':
              return item[column] === value;
            case 'neq':
              return item[column] !== value;
            case 'gt':
              return item[column] > value;
            case 'gte':
              return item[column] >= value;
            case 'lt':
              return item[column] < value;
            case 'lte':
              return item[column] <= value;
            case 'like':
              return String(item[column]).includes(value);
            default:
              return true;
          }
        });
      });
    }
    
    // Aplicar ordenação
    if (orderBy) {
      data = [...data].sort((a, b) => {
        if (orderDirection === 'asc') {
          return a[orderBy] > b[orderBy] ? 1 : -1;
        } else {
          return a[orderBy] < b[orderBy] ? 1 : -1;
        }
      });
    }
    
    // Aplicar limite
    if (limit && limit > 0) {
      data = data.slice(0, limit);
    }
    
    return data;
  }
  
  // Código real para o Supabase
  try {
    let query = supabase.from(table).select('*');
    
    // Aplicar filtros
    filters.forEach(filter => {
      const { column, operator, value } = filter;
      query = query.filter(column, operator, value);
    });
    
    // Aplicar ordenação
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });
    }
    
    // Aplicar limite
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Erro ao buscar dados da tabela ${table}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao buscar dados da tabela ${table}:`, error);
    throw error;
  }
}

/**
 * Busca um registro por ID
 */
export async function fetchById(table, id) {
  // Se estiver no modo de demonstração, retorna dados simulados
  if (DEMO_MODE) {
    console.log(`[DEMO MODE] Buscando registro ${id} da tabela ${table}`);
    
    const data = demoData[table]?.find(item => item.id === id);
    
    if (!data) {
      throw new Error(`Registro não encontrado: ${table}/${id}`);
    }
    
    return data;
  }
  
  // Código real para o Supabase
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar registro ${id} da tabela ${table}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Erro ao buscar registro ${id} da tabela ${table}:`, error);
    throw error;
  }
}

/**
 * Insere um novo registro
 */
export async function insert(table, data) {
  // Se estiver no modo de demonstração, simula a inserção
  if (DEMO_MODE) {
    console.log(`[DEMO MODE] Inserindo na tabela ${table}:`, data);
    
    // Gera um novo ID
    const newId = Math.max(0, ...demoData[table].map(item => item.id)) + 1;
    
    // Cria o novo item
    const newItem = { id: newId, ...data };
    
    // Adiciona à tabela de demonstração
    demoData[table] = [...demoData[table], newItem];
    
    return [newItem];
  }
  
  // Código real para o Supabase
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) {
      console.error(`Erro ao inserir na tabela ${table}:`, error);
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error(`Erro ao inserir na tabela ${table}:`, error);
    throw error;
  }
}

/**
 * Atualiza um registro existente
 */
export async function update(table, id, data) {
  // Se estiver no modo de demonstração, simula a atualização
  if (DEMO_MODE) {
    console.log(`[DEMO MODE] Atualizando registro ${id} da tabela ${table}:`, data);
    
    // Encontra o índice do item
    const index = demoData[table].findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Registro não encontrado: ${table}/${id}`);
    }
    
    // Atualiza o item
    const updatedItem = { ...demoData[table][index], ...data };
    demoData[table][index] = updatedItem;
    
    return [updatedItem];
  }
  
  // Código real para o Supabase
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Erro ao atualizar registro ${id} da tabela ${table}:`, error);
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error(`Erro ao atualizar registro ${id} da tabela ${table}:`, error);
    throw error;
  }
}

/**
 * Remove um registro
 */
export async function remove(table, id) {
  // Se estiver no modo de demonstração, simula a remoção
  if (DEMO_MODE) {
    console.log(`[DEMO MODE] Removendo registro ${id} da tabela ${table}`);
    
    // Filtra o item a ser removido
    const initialLength = demoData[table].length;
    demoData[table] = demoData[table].filter(item => item.id !== id);
    
    if (demoData[table].length === initialLength) {
      throw new Error(`Registro não encontrado: ${table}/${id}`);
    }
    
    return true;
  }
  
  // Código real para o Supabase
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao remover registro ${id} da tabela ${table}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao remover registro ${id} da tabela ${table}:`, error);
    throw error;
  }
}

