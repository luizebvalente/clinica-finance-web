// Serviço de armazenamento local para dados funcionais
// Este serviço permite CRUD real usando localStorage

const STORAGE_KEYS = {
  RECEITAS: 'clinica_finance_receitas',
  DESPESAS: 'clinica_finance_despesas',
  CATEGORIAS_RECEITAS: 'clinica_finance_categorias_receitas',
  CATEGORIAS_DESPESAS: 'clinica_finance_categorias_despesas',
  PROFISSIONAIS: 'clinica_finance_profissionais',
  CONFIGURACOES: 'clinica_finance_configuracoes'
};

// Dados iniciais para primeira execução
const DADOS_INICIAIS = {
  receitas: [
    {
      id: '1',
      data: '2025-01-10',
      descricao: 'Consulta Cardiologia - Dr. João Silva',
      categoria: 'Consulta',
      profissional: 'Dr. João Silva',
      valor: 180.00,
      status: 'Recebido',
      observacoes: 'Paciente particular',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      data: '2025-01-12',
      descricao: 'Cirurgia Cardíaca - Dr. Maria Santos',
      categoria: 'Procedimento',
      profissional: 'Dr. Maria Santos',
      valor: 450.00,
      status: 'Pendente',
      observacoes: 'Convênio Unimed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  despesas: [
    {
      id: '1',
      vencimento: '2025-01-15',
      descricao: 'Aluguel da Clínica',
      categoria: 'Administrativa',
      tipo: 'Fixa',
      valor: 3500.00,
      status: 'Pendente',
      recorrente: true,
      observacoes: 'Pagamento mensal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      vencimento: '2025-01-20',
      descricao: 'Material Cirúrgico',
      categoria: 'Clínica',
      tipo: 'Variável',
      valor: 850.00,
      status: 'Em Atraso',
      recorrente: false,
      observacoes: 'Fornecedor MedSupply',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  categoriasReceitas: [
    'Consulta',
    'Procedimento',
    'Convênio',
    'Telemedicina',
    'Exames',
    'Cirurgia',
    'Emergência'
  ],
  categoriasDespesas: [
    'Administrativa',
    'Clínica',
    'Utilidades',
    'Marketing',
    'Pessoal',
    'Equipamentos',
    'Manutenção',
    'Impostos'
  ],
  profissionais: [
    { id: '1', nome: 'Dr. João Silva', especialidade: 'Cardiologia', ativo: true },
    { id: '2', nome: 'Dr. Maria Santos', especialidade: 'Cirurgia', ativo: true },
    { id: '3', nome: 'Dr. Pedro Lima', especialidade: 'Clínica Geral', ativo: true },
    { id: '4', nome: 'Dr. Ana Costa', especialidade: 'Telemedicina', ativo: true }
  ]
};

// Utilitários
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Erro ao ler do localStorage:', error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
    return false;
  }
};

// Inicializar dados se não existirem
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.RECEITAS)) {
    saveToStorage(STORAGE_KEYS.RECEITAS, DADOS_INICIAIS.receitas);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DESPESAS)) {
    saveToStorage(STORAGE_KEYS.DESPESAS, DADOS_INICIAIS.despesas);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIAS_RECEITAS)) {
    saveToStorage(STORAGE_KEYS.CATEGORIAS_RECEITAS, DADOS_INICIAIS.categoriasReceitas);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIAS_DESPESAS)) {
    saveToStorage(STORAGE_KEYS.CATEGORIAS_DESPESAS, DADOS_INICIAIS.categoriasDespesas);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFISSIONAIS)) {
    saveToStorage(STORAGE_KEYS.PROFISSIONAIS, DADOS_INICIAIS.profissionais);
  }
};

// Serviços de Receitas
export const receitasService = {
  // Listar todas as receitas
  getAll: () => {
    initializeData();
    return getFromStorage(STORAGE_KEYS.RECEITAS, []);
  },

  // Buscar receita por ID
  getById: (id) => {
    const receitas = receitasService.getAll();
    return receitas.find(receita => receita.id === id);
  },

  // Criar nova receita
  create: (receitaData) => {
    const receitas = receitasService.getAll();
    const novaReceita = {
      ...receitaData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    receitas.push(novaReceita);
    saveToStorage(STORAGE_KEYS.RECEITAS, receitas);
    return novaReceita;
  },

  // Atualizar receita
  update: (id, receitaData) => {
    const receitas = receitasService.getAll();
    const index = receitas.findIndex(receita => receita.id === id);
    if (index !== -1) {
      receitas[index] = {
        ...receitas[index],
        ...receitaData,
        updatedAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.RECEITAS, receitas);
      return receitas[index];
    }
    return null;
  },

  // Excluir receita
  delete: (id) => {
    const receitas = receitasService.getAll();
    const novasReceitas = receitas.filter(receita => receita.id !== id);
    saveToStorage(STORAGE_KEYS.RECEITAS, novasReceitas);
    return true;
  },

  // Filtrar receitas
  filter: (filtros) => {
    const receitas = receitasService.getAll();
    return receitas.filter(receita => {
      if (filtros.categoria && receita.categoria !== filtros.categoria) return false;
      if (filtros.profissional && receita.profissional !== filtros.profissional) return false;
      if (filtros.status && receita.status !== filtros.status) return false;
      if (filtros.dataInicio && receita.data < filtros.dataInicio) return false;
      if (filtros.dataFim && receita.data > filtros.dataFim) return false;
      return true;
    });
  }
};

// Serviços de Despesas
export const despesasService = {
  // Listar todas as despesas
  getAll: () => {
    initializeData();
    return getFromStorage(STORAGE_KEYS.DESPESAS, []);
  },

  // Buscar despesa por ID
  getById: (id) => {
    const despesas = despesasService.getAll();
    return despesas.find(despesa => despesa.id === id);
  },

  // Criar nova despesa
  create: (despesaData) => {
    const despesas = despesasService.getAll();
    const novaDespesa = {
      ...despesaData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    despesas.push(novaDespesa);
    saveToStorage(STORAGE_KEYS.DESPESAS, despesas);
    return novaDespesa;
  },

  // Atualizar despesa
  update: (id, despesaData) => {
    const despesas = despesasService.getAll();
    const index = despesas.findIndex(despesa => despesa.id === id);
    if (index !== -1) {
      despesas[index] = {
        ...despesas[index],
        ...despesaData,
        updatedAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.DESPESAS, despesas);
      return despesas[index];
    }
    return null;
  },

  // Excluir despesa
  delete: (id) => {
    const despesas = despesasService.getAll();
    const novasDespesas = despesas.filter(despesa => despesa.id !== id);
    saveToStorage(STORAGE_KEYS.DESPESAS, novasDespesas);
    return true;
  },

  // Marcar como pago
  marcarComoPago: (id) => {
    return despesasService.update(id, { status: 'Pago' });
  }
};

// Serviços de Categorias
export const categoriasService = {
  // Categorias de Receitas
  getCategoriasReceitas: () => {
    initializeData();
    return getFromStorage(STORAGE_KEYS.CATEGORIAS_RECEITAS, []);
  },

  addCategoriaReceita: (categoria) => {
    const categorias = categoriasService.getCategoriasReceitas();
    if (!categorias.includes(categoria)) {
      categorias.push(categoria);
      saveToStorage(STORAGE_KEYS.CATEGORIAS_RECEITAS, categorias);
    }
    return categorias;
  },

  removeCategoriaReceita: (categoria) => {
    const categorias = categoriasService.getCategoriasReceitas();
    const novasCategorias = categorias.filter(cat => cat !== categoria);
    saveToStorage(STORAGE_KEYS.CATEGORIAS_RECEITAS, novasCategorias);
    return novasCategorias;
  },

  // Categorias de Despesas
  getCategoriasDespesas: () => {
    initializeData();
    return getFromStorage(STORAGE_KEYS.CATEGORIAS_DESPESAS, []);
  },

  addCategoriaDespesa: (categoria) => {
    const categorias = categoriasService.getCategoriasDespesas();
    if (!categorias.includes(categoria)) {
      categorias.push(categoria);
      saveToStorage(STORAGE_KEYS.CATEGORIAS_DESPESAS, categorias);
    }
    return categorias;
  },

  removeCategoriaDespesa: (categoria) => {
    const categorias = categoriasService.getCategoriasDespesas();
    const novasCategorias = categorias.filter(cat => cat !== categoria);
    saveToStorage(STORAGE_KEYS.CATEGORIAS_DESPESAS, novasCategorias);
    return novasCategorias;
  }
};

// Serviços de Profissionais
export const profissionaisService = {
  getAll: () => {
    initializeData();
    return getFromStorage(STORAGE_KEYS.PROFISSIONAIS, []);
  },

  create: (profissionalData) => {
    const profissionais = profissionaisService.getAll();
    const novoProfissional = {
      ...profissionalData,
      id: generateId(),
      ativo: true,
      createdAt: new Date().toISOString()
    };
    profissionais.push(novoProfissional);
    saveToStorage(STORAGE_KEYS.PROFISSIONAIS, profissionais);
    return novoProfissional;
  },

  update: (id, profissionalData) => {
    const profissionais = profissionaisService.getAll();
    const index = profissionais.findIndex(prof => prof.id === id);
    if (index !== -1) {
      profissionais[index] = {
        ...profissionais[index],
        ...profissionalData,
        updatedAt: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.PROFISSIONAIS, profissionais);
      return profissionais[index];
    }
    return null;
  },

  delete: (id) => {
    const profissionais = profissionaisService.getAll();
    const novosProfissionais = profissionais.filter(prof => prof.id !== id);
    saveToStorage(STORAGE_KEYS.PROFISSIONAIS, novosProfissionais);
    return true;
  }
};

// Inicializar dados na primeira execução
initializeData();

