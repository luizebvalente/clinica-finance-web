// Serviço de localStorage para persistência local de dados
// Este serviço garante que o CRUD funcione independentemente do Firebase

const STORAGE_KEYS = {
  RECEITAS: 'clinica_finance_receitas',
  DESPESAS: 'clinica_finance_despesas',
  CATEGORIAS: 'clinica_finance_categorias',
  PROFISSIONAIS: 'clinica_finance_profissionais',
  CONFIGURACOES: 'clinica_finance_configuracoes'
};

// Dados iniciais para primeira execução
const INITIAL_DATA = {
  receitas: [
    {
      id: '1',
      descricao: 'Consulta Dr. Silva',
      valor: 180.00,
      categoria: 'Consulta',
      profissional: 'Dr. João Silva',
      data: '2025-01-15',
      status: 'Recebido',
      observacoes: 'Consulta de rotina',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      descricao: 'Procedimento Cirúrgico',
      valor: 630.00,
      categoria: 'Procedimento',
      profissional: 'Dr. Maria Santos',
      data: '2025-01-10',
      status: 'Pendente',
      observacoes: 'Cirurgia menor',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      descricao: 'Consulta Telemedicina',
      valor: 80.00,
      categoria: 'Telemedicina',
      profissional: 'Dr. João Silva',
      data: '2025-01-12',
      status: 'Recebido',
      observacoes: 'Consulta online',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      descricao: 'Convênio Unimed',
      valor: 120.00,
      categoria: 'Convênio',
      profissional: 'Dr. Maria Santos',
      data: '2025-01-08',
      status: 'Pendente',
      observacoes: 'Repasse convênio',
      createdAt: new Date().toISOString()
    }
  ],
  despesas: [
    {
      id: '1',
      descricao: 'Material Cirúrgico',
      valor: 850.00,
      categoria: 'Clínica',
      tipo: 'Variável',
      data: '2025-01-05',
      vencimento: '2025-01-20',
      status: 'Em Atraso',
      recorrente: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      descricao: 'Aluguel da Clínica',
      valor: 3500.00,
      categoria: 'Administrativa',
      tipo: 'Fixa',
      data: '2025-01-01',
      vencimento: '2025-01-10',
      status: 'Pago',
      recorrente: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      descricao: 'Marketing Digital',
      valor: 600.00,
      categoria: 'Marketing',
      tipo: 'Variável',
      data: '2025-01-03',
      vencimento: '2025-01-15',
      status: 'Pendente',
      recorrente: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      descricao: 'Energia Elétrica',
      valor: 320.00,
      categoria: 'Utilidades',
      tipo: 'Fixa',
      data: '2025-01-02',
      vencimento: '2025-01-12',
      status: 'Pendente',
      recorrente: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      descricao: 'Internet',
      valor: 250.00,
      categoria: 'Utilidades',
      tipo: 'Fixa',
      data: '2025-01-02',
      vencimento: '2025-01-18',
      status: 'Pendente',
      recorrente: true,
      createdAt: new Date().toISOString()
    }
  ],
  categorias: {
    receitas: ['Consulta', 'Procedimento', 'Convênio', 'Telemedicina', 'Exames', 'Cirurgia'],
    despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal']
  },
  profissionais: [
    { 
      id: '1', 
      nome: 'Dr. João Silva', 
      especialidade: 'Cardiologia', 
      crm: '12345-SP',
      email: 'joao.silva@clinica.com',
      telefone: '(11) 99999-1111'
    },
    { 
      id: '2', 
      nome: 'Dr. Maria Santos', 
      especialidade: 'Dermatologia', 
      crm: '67890-SP',
      email: 'maria.santos@clinica.com',
      telefone: '(11) 99999-2222'
    },
    { 
      id: '3', 
      nome: 'Dr. Carlos Oliveira', 
      especialidade: 'Ortopedia', 
      crm: '11111-SP',
      email: 'carlos.oliveira@clinica.com',
      telefone: '(11) 99999-3333'
    }
  ]
};

// Utilitários para localStorage
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage:`, error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erro ao remover ${key} do localStorage:`, error);
      return false;
    }
  }
};

// Inicializar dados se não existirem
const initializeData = () => {
  if (!storage.get(STORAGE_KEYS.RECEITAS)) {
    storage.set(STORAGE_KEYS.RECEITAS, INITIAL_DATA.receitas);
  }
  if (!storage.get(STORAGE_KEYS.DESPESAS)) {
    storage.set(STORAGE_KEYS.DESPESAS, INITIAL_DATA.despesas);
  }
  if (!storage.get(STORAGE_KEYS.CATEGORIAS)) {
    storage.set(STORAGE_KEYS.CATEGORIAS, INITIAL_DATA.categorias);
  }
  if (!storage.get(STORAGE_KEYS.PROFISSIONAIS)) {
    storage.set(STORAGE_KEYS.PROFISSIONAIS, INITIAL_DATA.profissionais);
  }
};

// Gerar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// ==================== RECEITAS ====================

export const getReceitas = () => {
  initializeData();
  return storage.get(STORAGE_KEYS.RECEITAS) || [];
};

export const addReceita = (receita) => {
  const receitas = getReceitas();
  const newReceita = {
    ...receita,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  receitas.unshift(newReceita);
  storage.set(STORAGE_KEYS.RECEITAS, receitas);
  
  return newReceita;
};

export const updateReceita = (id, receitaData) => {
  const receitas = getReceitas();
  const index = receitas.findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error('Receita não encontrada');
  }
  
  receitas[index] = {
    ...receitas[index],
    ...receitaData,
    updatedAt: new Date().toISOString()
  };
  
  storage.set(STORAGE_KEYS.RECEITAS, receitas);
  return receitas[index];
};

export const deleteReceita = (id) => {
  const receitas = getReceitas();
  const filteredReceitas = receitas.filter(r => r.id !== id);
  
  if (filteredReceitas.length === receitas.length) {
    throw new Error('Receita não encontrada');
  }
  
  storage.set(STORAGE_KEYS.RECEITAS, filteredReceitas);
  return true;
};

// ==================== DESPESAS ====================

export const getDespesas = () => {
  initializeData();
  return storage.get(STORAGE_KEYS.DESPESAS) || [];
};

export const addDespesa = (despesa) => {
  const despesas = getDespesas();
  const newDespesa = {
    ...despesa,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  despesas.unshift(newDespesa);
  storage.set(STORAGE_KEYS.DESPESAS, despesas);
  
  return newDespesa;
};

export const updateDespesa = (id, despesaData) => {
  const despesas = getDespesas();
  const index = despesas.findIndex(d => d.id === id);
  
  if (index === -1) {
    throw new Error('Despesa não encontrada');
  }
  
  despesas[index] = {
    ...despesas[index],
    ...despesaData,
    updatedAt: new Date().toISOString()
  };
  
  storage.set(STORAGE_KEYS.DESPESAS, despesas);
  return despesas[index];
};

export const deleteDespesa = (id) => {
  const despesas = getDespesas();
  const filteredDespesas = despesas.filter(d => d.id !== id);
  
  if (filteredDespesas.length === despesas.length) {
    throw new Error('Despesa não encontrada');
  }
  
  storage.set(STORAGE_KEYS.DESPESAS, filteredDespesas);
  return true;
};

// ==================== CATEGORIAS ====================

export const getCategorias = () => {
  initializeData();
  return storage.get(STORAGE_KEYS.CATEGORIAS) || INITIAL_DATA.categorias;
};

export const updateCategorias = (categorias) => {
  storage.set(STORAGE_KEYS.CATEGORIAS, categorias);
  return categorias;
};

export const addCategoriaReceita = (categoria) => {
  const categorias = getCategorias();
  if (!categorias.receitas.includes(categoria)) {
    categorias.receitas.push(categoria);
    storage.set(STORAGE_KEYS.CATEGORIAS, categorias);
  }
  return categorias;
};

export const addCategoriaDespesa = (categoria) => {
  const categorias = getCategorias();
  if (!categorias.despesas.includes(categoria)) {
    categorias.despesas.push(categoria);
    storage.set(STORAGE_KEYS.CATEGORIAS, categorias);
  }
  return categorias;
};

export const removeCategoriaReceita = (categoria) => {
  const categorias = getCategorias();
  categorias.receitas = categorias.receitas.filter(c => c !== categoria);
  storage.set(STORAGE_KEYS.CATEGORIAS, categorias);
  return categorias;
};

export const removeCategoriaDespesa = (categoria) => {
  const categorias = getCategorias();
  categorias.despesas = categorias.despesas.filter(c => c !== categoria);
  storage.set(STORAGE_KEYS.CATEGORIAS, categorias);
  return categorias;
};

// ==================== PROFISSIONAIS ====================

export const getProfissionais = () => {
  initializeData();
  return storage.get(STORAGE_KEYS.PROFISSIONAIS) || [];
};

export const addProfissional = (profissional) => {
  const profissionais = getProfissionais();
  const newProfissional = {
    ...profissional,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  
  profissionais.push(newProfissional);
  storage.set(STORAGE_KEYS.PROFISSIONAIS, profissionais);
  
  return newProfissional;
};

export const updateProfissional = (id, profissionalData) => {
  const profissionais = getProfissionais();
  const index = profissionais.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('Profissional não encontrado');
  }
  
  profissionais[index] = {
    ...profissionais[index],
    ...profissionalData,
    updatedAt: new Date().toISOString()
  };
  
  storage.set(STORAGE_KEYS.PROFISSIONAIS, profissionais);
  return profissionais[index];
};

export const deleteProfissional = (id) => {
  const profissionais = getProfissionais();
  const filteredProfissionais = profissionais.filter(p => p.id !== id);
  
  if (filteredProfissionais.length === profissionais.length) {
    throw new Error('Profissional não encontrado');
  }
  
  storage.set(STORAGE_KEYS.PROFISSIONAIS, filteredProfissionais);
  return true;
};

// ==================== ESTATÍSTICAS ====================

export const getEstatisticas = () => {
  const receitas = getReceitas();
  const despesas = getDespesas();

  const totalReceitas = receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const lucro = totalReceitas - totalDespesas;

  const receitasRecebidas = receitas.filter(r => r.status === 'Recebido');
  const totalRecebido = receitasRecebidas.reduce((sum, r) => sum + (r.valor || 0), 0);

  const despesasPagas = despesas.filter(d => d.status === 'Pago');
  const totalPago = despesasPagas.reduce((sum, d) => sum + (d.valor || 0), 0);

  const receitasPendentes = receitas.filter(r => r.status === 'Pendente');
  const totalPendente = receitasPendentes.reduce((sum, r) => sum + (r.valor || 0), 0);

  const despesasVencidas = despesas.filter(d => {
    if (d.status === 'Pago') return false;
    const vencimento = new Date(d.vencimento);
    const hoje = new Date();
    return vencimento < hoje;
  });

  return {
    totalReceitas,
    totalDespesas,
    lucro,
    totalRecebido,
    totalPago,
    totalPendente,
    fluxoCaixa: totalRecebido - totalPago,
    margemLucro: totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0,
    contasVencidas: despesasVencidas.length,
    valorVencido: despesasVencidas.reduce((sum, d) => sum + (d.valor || 0), 0),
    receitasPendentesCount: receitasPendentes.length
  };
};

// ==================== BACKUP E RESTORE ====================

export const exportData = () => {
  const data = {
    receitas: getReceitas(),
    despesas: getDespesas(),
    categorias: getCategorias(),
    profissionais: getProfissionais(),
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.receitas) storage.set(STORAGE_KEYS.RECEITAS, data.receitas);
    if (data.despesas) storage.set(STORAGE_KEYS.DESPESAS, data.despesas);
    if (data.categorias) storage.set(STORAGE_KEYS.CATEGORIAS, data.categorias);
    if (data.profissionais) storage.set(STORAGE_KEYS.PROFISSIONAIS, data.profissionais);
    
    return true;
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return false;
  }
};

export const clearAllData = () => {
  storage.remove(STORAGE_KEYS.RECEITAS);
  storage.remove(STORAGE_KEYS.DESPESAS);
  storage.remove(STORAGE_KEYS.CATEGORIAS);
  storage.remove(STORAGE_KEYS.PROFISSIONAIS);
  
  // Reinicializar com dados padrão
  initializeData();
  
  return true;
};

// Inicializar dados na primeira execução
initializeData();

export default {
  // Receitas
  getReceitas,
  addReceita,
  updateReceita,
  deleteReceita,
  
  // Despesas
  getDespesas,
  addDespesa,
  updateDespesa,
  deleteDespesa,
  
  // Categorias
  getCategorias,
  updateCategorias,
  addCategoriaReceita,
  addCategoriaDespesa,
  removeCategoriaReceita,
  removeCategoriaDespesa,
  
  // Profissionais
  getProfissionais,
  addProfissional,
  updateProfissional,
  deleteProfissional,
  
  // Estatísticas
  getEstatisticas,
  
  // Backup
  exportData,
  importData,
  clearAllData
};

