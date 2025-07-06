import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Função auxiliar para gerar ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função auxiliar para converter timestamp do Firestore
const convertTimestamp = (data) => {
  if (data.createdAt && data.createdAt.toDate) {
    data.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.updatedAt && data.updatedAt.toDate) {
    data.updatedAt = data.updatedAt.toDate().toISOString();
  }
  return data;
};

// Serviços de Receitas
export const getReceitas = async () => {
  try {
    const q = query(collection(db, 'receitas'), orderBy('data', 'desc'));
    const querySnapshot = await getDocs(q);
    const receitas = [];
    querySnapshot.forEach((doc) => {
      receitas.push({
        id: doc.id,
        ...convertTimestamp(doc.data())
      });
    });
    return receitas;
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    // Fallback para localStorage em caso de erro
    return getReceitasFromLocalStorage();
  }
};

export const addReceita = async (receita) => {
  try {
    const receitaData = {
      ...receita,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'receitas'), receitaData);
    return {
      id: docRef.id,
      ...receita,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar receita:', error);
    // Fallback para localStorage
    return addReceitaToLocalStorage(receita);
  }
};

export const updateReceita = async (id, dadosAtualizados) => {
  try {
    const receitaRef = doc(db, 'receitas', id);
    const updateData = {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(receitaRef, updateData);
    return {
      id,
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    // Fallback para localStorage
    return updateReceitaInLocalStorage(id, dadosAtualizados);
  }
};

export const deleteReceita = async (id) => {
  try {
    await deleteDoc(doc(db, 'receitas', id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    // Fallback para localStorage
    return deleteReceitaFromLocalStorage(id);
  }
};

// Serviços de Despesas
export const getDespesas = async () => {
  try {
    const q = query(collection(db, 'despesas'), orderBy('data', 'desc'));
    const querySnapshot = await getDocs(q);
    const despesas = [];
    querySnapshot.forEach((doc) => {
      despesas.push({
        id: doc.id,
        ...convertTimestamp(doc.data())
      });
    });
    return despesas;
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return getDespesasFromLocalStorage();
  }
};

export const addDespesa = async (despesa) => {
  try {
    const despesaData = {
      ...despesa,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'despesas'), despesaData);
    return {
      id: docRef.id,
      ...despesa,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    return addDespesaToLocalStorage(despesa);
  }
};

export const updateDespesa = async (id, dadosAtualizados) => {
  try {
    const despesaRef = doc(db, 'despesas', id);
    const updateData = {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(despesaRef, updateData);
    return {
      id,
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    return updateDespesaInLocalStorage(id, dadosAtualizados);
  }
};

export const deleteDespesa = async (id) => {
  try {
    await deleteDoc(doc(db, 'despesas', id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    return deleteDespesaFromLocalStorage(id);
  }
};

// Serviços de Categorias
export const getCategorias = async () => {
  try {
    const docRef = doc(db, 'configuracoes', 'categorias');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Criar documento inicial se não existir
      const categoriasIniciais = {
        receitas: ['Consulta', 'Exame', 'Procedimento', 'Convênio'],
        despesas: ['Aluguel', 'Energia', 'Água', 'Internet', 'Material', 'Salários', 'Impostos']
      };
      await setDoc(docRef, categoriasIniciais);
      return categoriasIniciais;
    }
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return getCategoriasFromLocalStorage();
  }
};

export const updateCategorias = async (categorias) => {
  try {
    const docRef = doc(db, 'configuracoes', 'categorias');
    await setDoc(docRef, categorias);
    return categorias;
  } catch (error) {
    console.error('Erro ao atualizar categorias:', error);
    return updateCategoriasInLocalStorage(categorias);
  }
};

export const addCategoriaReceita = async (categoria) => {
  try {
    const categorias = await getCategorias();
    if (!categorias.receitas.includes(categoria)) {
      categorias.receitas.push(categoria);
      await updateCategorias(categorias);
    }
    return categorias;
  } catch (error) {
    console.error('Erro ao adicionar categoria de receita:', error);
    throw error;
  }
};

export const addCategoriaDespesa = async (categoria) => {
  try {
    const categorias = await getCategorias();
    if (!categorias.despesas.includes(categoria)) {
      categorias.despesas.push(categoria);
      await updateCategorias(categorias);
    }
    return categorias;
  } catch (error) {
    console.error('Erro ao adicionar categoria de despesa:', error);
    throw error;
  }
};

export const removeCategoriaReceita = async (categoria) => {
  try {
    const categorias = await getCategorias();
    categorias.receitas = categorias.receitas.filter(c => c !== categoria);
    await updateCategorias(categorias);
    return categorias;
  } catch (error) {
    console.error('Erro ao remover categoria de receita:', error);
    throw error;
  }
};

export const removeCategoriaDespesa = async (categoria) => {
  try {
    const categorias = await getCategorias();
    categorias.despesas = categorias.despesas.filter(c => c !== categoria);
    await updateCategorias(categorias);
    return categorias;
  } catch (error) {
    console.error('Erro ao remover categoria de despesa:', error);
    throw error;
  }
};

// Serviços de Profissionais
export const getProfissionais = async () => {
  try {
    const q = query(collection(db, 'profissionais'), orderBy('nome'));
    const querySnapshot = await getDocs(q);
    const profissionais = [];
    querySnapshot.forEach((doc) => {
      profissionais.push({
        id: doc.id,
        ...convertTimestamp(doc.data())
      });
    });
    return profissionais;
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return getProfissionaisFromLocalStorage();
  }
};

export const addProfissional = async (profissional) => {
  try {
    const profissionalData = {
      ...profissional,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'profissionais'), profissionalData);
    return {
      id: docRef.id,
      ...profissional,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar profissional:', error);
    return addProfissionalToLocalStorage(profissional);
  }
};

export const updateProfissional = async (id, dadosAtualizados) => {
  try {
    const profissionalRef = doc(db, 'profissionais', id);
    const updateData = {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(profissionalRef, updateData);
    return {
      id,
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    return updateProfissionalInLocalStorage(id, dadosAtualizados);
  }
};

export const deleteProfissional = async (id) => {
  try {
    await deleteDoc(doc(db, 'profissionais', id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    return deleteProfissionalFromLocalStorage(id);
  }
};

// Serviço de Estatísticas
export const getEstatisticas = async () => {
  try {
    const [receitas, despesas] = await Promise.all([
      getReceitas(),
      getDespesas()
    ]);

    const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
    const totalRecebido = receitas.filter(r => r.status === 'Recebido').reduce((sum, r) => sum + r.valor, 0);
    const totalPago = despesas.filter(d => d.status === 'Pago').reduce((sum, d) => sum + d.valor, 0);
    const totalPendente = receitas.filter(r => r.status === 'Pendente').reduce((sum, r) => sum + r.valor, 0);

    const hoje = new Date();
    const contasVencidas = despesas.filter(d => {
      if (!d.vencimento || d.status === 'Pago') return false;
      return new Date(d.vencimento) < hoje;
    }).length;

    const valorVencido = despesas.filter(d => {
      if (!d.vencimento || d.status === 'Pago') return false;
      return new Date(d.vencimento) < hoje;
    }).reduce((sum, d) => sum + d.valor, 0);

    const receitasPendentesCount = receitas.filter(r => r.status === 'Pendente').length;

    return {
      totalReceitas,
      totalDespesas,
      lucro: totalReceitas - totalDespesas,
      totalRecebido,
      totalPago,
      totalPendente,
      fluxoCaixa: totalRecebido - totalPago,
      margemLucro: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
      contasVencidas,
      valorVencido,
      receitasPendentesCount
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return getEstatisticasFromLocalStorage();
  }
};

// Funções de fallback para localStorage
const getReceitasFromLocalStorage = () => {
  const receitas = localStorage.getItem('clinica_receitas');
  return receitas ? JSON.parse(receitas) : [];
};

const addReceitaToLocalStorage = (receita) => {
  const receitas = getReceitasFromLocalStorage();
  const novaReceita = {
    id: generateId(),
    ...receita,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  receitas.unshift(novaReceita);
  localStorage.setItem('clinica_receitas', JSON.stringify(receitas));
  return novaReceita;
};

const updateReceitaInLocalStorage = (id, dadosAtualizados) => {
  const receitas = getReceitasFromLocalStorage();
  const index = receitas.findIndex(r => r.id === id);
  if (index !== -1) {
    receitas[index] = {
      ...receitas[index],
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('clinica_receitas', JSON.stringify(receitas));
    return receitas[index];
  }
  throw new Error('Receita não encontrada');
};

const deleteReceitaFromLocalStorage = (id) => {
  const receitas = getReceitasFromLocalStorage();
  const novasReceitas = receitas.filter(r => r.id !== id);
  localStorage.setItem('clinica_receitas', JSON.stringify(novasReceitas));
  return true;
};

const getDespesasFromLocalStorage = () => {
  const despesas = localStorage.getItem('clinica_despesas');
  return despesas ? JSON.parse(despesas) : [];
};

const addDespesaToLocalStorage = (despesa) => {
  const despesas = getDespesasFromLocalStorage();
  const novaDespesa = {
    id: generateId(),
    ...despesa,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  despesas.unshift(novaDespesa);
  localStorage.setItem('clinica_despesas', JSON.stringify(despesas));
  return novaDespesa;
};

const updateDespesaInLocalStorage = (id, dadosAtualizados) => {
  const despesas = getDespesasFromLocalStorage();
  const index = despesas.findIndex(d => d.id === id);
  if (index !== -1) {
    despesas[index] = {
      ...despesas[index],
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('clinica_despesas', JSON.stringify(despesas));
    return despesas[index];
  }
  throw new Error('Despesa não encontrada');
};

const deleteDespesaFromLocalStorage = (id) => {
  const despesas = getDespesasFromLocalStorage();
  const novasDespesas = despesas.filter(d => d.id !== id);
  localStorage.setItem('clinica_despesas', JSON.stringify(novasDespesas));
  return true;
};

const getCategoriasFromLocalStorage = () => {
  const categorias = localStorage.getItem('clinica_categorias');
  return categorias ? JSON.parse(categorias) : {
    receitas: ['Consulta', 'Exame', 'Procedimento', 'Convênio'],
    despesas: ['Aluguel', 'Energia', 'Água', 'Internet', 'Material', 'Salários', 'Impostos']
  };
};

const updateCategoriasInLocalStorage = (categorias) => {
  localStorage.setItem('clinica_categorias', JSON.stringify(categorias));
  return categorias;
};

const getProfissionaisFromLocalStorage = () => {
  const profissionais = localStorage.getItem('clinica_profissionais');
  return profissionais ? JSON.parse(profissionais) : [
    { id: '1', nome: 'Dr. João Silva', especialidade: 'Cardiologia', crm: '12345' },
    { id: '2', nome: 'Dra. Maria Santos', especialidade: 'Dermatologia', crm: '67890' }
  ];
};

const addProfissionalToLocalStorage = (profissional) => {
  const profissionais = getProfissionaisFromLocalStorage();
  const novoProfissional = {
    id: generateId(),
    ...profissional,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  profissionais.push(novoProfissional);
  localStorage.setItem('clinica_profissionais', JSON.stringify(profissionais));
  return novoProfissional;
};

const updateProfissionalInLocalStorage = (id, dadosAtualizados) => {
  const profissionais = getProfissionaisFromLocalStorage();
  const index = profissionais.findIndex(p => p.id === id);
  if (index !== -1) {
    profissionais[index] = {
      ...profissionais[index],
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('clinica_profissionais', JSON.stringify(profissionais));
    return profissionais[index];
  }
  throw new Error('Profissional não encontrado');
};

const deleteProfissionalFromLocalStorage = (id) => {
  const profissionais = getProfissionaisFromLocalStorage();
  const novosProfissionais = profissionais.filter(p => p.id !== id);
  localStorage.setItem('clinica_profissionais', JSON.stringify(novosProfissionais));
  return true;
};

const getEstatisticasFromLocalStorage = () => {
  const receitas = getReceitasFromLocalStorage();
  const despesas = getDespesasFromLocalStorage();

  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
  const totalRecebido = receitas.filter(r => r.status === 'Recebido').reduce((sum, r) => sum + r.valor, 0);
  const totalPago = despesas.filter(d => d.status === 'Pago').reduce((sum, d) => sum + d.valor, 0);
  const totalPendente = receitas.filter(r => r.status === 'Pendente').reduce((sum, r) => sum + r.valor, 0);

  const hoje = new Date();
  const contasVencidas = despesas.filter(d => {
    if (!d.vencimento || d.status === 'Pago') return false;
    return new Date(d.vencimento) < hoje;
  }).length;

  const valorVencido = despesas.filter(d => {
    if (!d.vencimento || d.status === 'Pago') return false;
    return new Date(d.vencimento) < hoje;
  }).reduce((sum, d) => sum + d.valor, 0);

  const receitasPendentesCount = receitas.filter(r => r.status === 'Pendente').length;

  return {
    totalReceitas,
    totalDespesas,
    lucro: totalReceitas - totalDespesas,
    totalRecebido,
    totalPago,
    totalPendente,
    fluxoCaixa: totalRecebido - totalPago,
    margemLucro: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0,
    contasVencidas,
    valorVencido,
    receitasPendentesCount
  };
};

// Exportar serviço de localStorage para backup
export const localStorageService = {
  exportData: () => {
    const data = {
      receitas: getReceitasFromLocalStorage(),
      despesas: getDespesasFromLocalStorage(),
      categorias: getCategoriasFromLocalStorage(),
      profissionais: getProfissionaisFromLocalStorage(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },
  
  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.receitas) localStorage.setItem('clinica_receitas', JSON.stringify(data.receitas));
      if (data.despesas) localStorage.setItem('clinica_despesas', JSON.stringify(data.despesas));
      if (data.categorias) localStorage.setItem('clinica_categorias', JSON.stringify(data.categorias));
      if (data.profissionais) localStorage.setItem('clinica_profissionais', JSON.stringify(data.profissionais));
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  },
  
  clearAllData: () => {
    localStorage.removeItem('clinica_receitas');
    localStorage.removeItem('clinica_despesas');
    localStorage.removeItem('clinica_categorias');
    localStorage.removeItem('clinica_profissionais');
  }
};

