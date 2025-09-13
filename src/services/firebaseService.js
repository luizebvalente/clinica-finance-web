import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
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

// Função para obter o contexto da clínica atual
const getCurrentClinicaContext = () => {
  // Esta função deve ser chamada dentro do contexto de autenticação
  // Por enquanto, vamos usar um fallback
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return userData.clinica?.id || null;
};

// ==================== RECEITAS ====================

export const getReceitas = async (clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    console.warn('Clínica não especificada');
    return [];
  }

  try {
    const q = query(
      collection(db, 'clinicas', clinica, 'receitas'), 
      orderBy('data', 'desc')
    );
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
    return getReceitasFromLocalStorage();
  }
};

export const addReceita = async (receita, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    const receitaData = {
      ...receita,
      clinicaId: clinica,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'clinicas', clinica, 'receitas'), receitaData);
    return {
      id: docRef.id,
      ...receita,
      clinicaId: clinica,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar receita:', error);
    return addReceitaToLocalStorage(receita);
  }
};

export const updateReceita = async (id, dadosAtualizados, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    const receitaRef = doc(db, 'clinicas', clinica, 'receitas', id);
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
    return updateReceitaInLocalStorage(id, dadosAtualizados);
  }
};

export const deleteReceita = async (id, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    await deleteDoc(doc(db, 'clinicas', clinica, 'receitas', id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    return deleteReceitaFromLocalStorage(id);
  }
};

// ==================== DESPESAS ====================

export const getDespesas = async (clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    console.warn('Clínica não especificada');
    return [];
  }

  try {
    const q = query(
      collection(db, 'clinicas', clinica, 'despesas'), 
      orderBy('data', 'desc')
    );
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

export const addDespesa = async (despesa, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    const despesaData = {
      ...despesa,
      clinicaId: clinica,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'clinicas', clinica, 'despesas'), despesaData);
    return {
      id: docRef.id,
      ...despesa,
      clinicaId: clinica,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    return addDespesaToLocalStorage(despesa);
  }
};

export const updateDespesa = async (id, dadosAtualizados, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    const despesaRef = doc(db, 'clinicas', clinica, 'despesas', id);
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

export const deleteDespesa = async (id, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    await deleteDoc(doc(db, 'clinicas', clinica, 'despesas', id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    return deleteDespesaFromLocalStorage(id);
  }
};

// ==================== CATEGORIAS ====================

export const getCategorias = async (clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    return getCategoriasFromLocalStorage();
  }

  try {
    const docRef = doc(db, 'clinicas', clinica, 'configuracoes', 'categorias');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Criar documento inicial se não existir
      const categoriasIniciais = {
        receitas: ['Consulta', 'Exame', 'Procedimento', 'Convênio', 'Telemedicina'],
        despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal']
      };
      await setDoc(docRef, categoriasIniciais);
      return categoriasIniciais;
    }
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return getCategoriasFromLocalStorage();
  }
};

export const updateCategorias = async (categorias, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    return updateCategoriasInLocalStorage(categorias);
  }

  try {
    const docRef = doc(db, 'clinicas', clinica, 'configuracoes', 'categorias');
    await setDoc(docRef, categorias);
    return categorias;
  } catch (error) {
    console.error('Erro ao atualizar categorias:', error);
    return updateCategoriasInLocalStorage(categorias);
  }
};

export const addCategoriaReceita = async (categoria, clinicaId = null) => {
  try {
    const categorias = await getCategorias(clinicaId);
    if (!categorias.receitas.includes(categoria)) {
      categorias.receitas.push(categoria);
      await updateCategorias(categorias, clinicaId);
    }
    return categorias;
  } catch (error) {
    console.error('Erro ao adicionar categoria de receita:', error);
    throw error;
  }
};

export const addCategoriaDespesa = async (categoria, clinicaId = null) => {
  try {
    const categorias = await getCategorias(clinicaId);
    if (!categorias.despesas.includes(categoria)) {
      categorias.despesas.push(categoria);
      await updateCategorias(categorias, clinicaId);
    }
    return categorias;
  } catch (error) {
    console.error('Erro ao adicionar categoria de despesa:', error);
    throw error;
  }
};

export const removeCategoriaReceita = async (categoria, clinicaId = null) => {
  try {
    const categorias = await getCategorias(clinicaId);
    categorias.receitas = categorias.receitas.filter(c => c !== categoria);
    await updateCategorias(categorias, clinicaId);
    return categorias;
  } catch (error) {
    console.error('Erro ao remover categoria de receita:', error);
    throw error;
  }
};

export const removeCategoriaDespesa = async (categoria, clinicaId = null) => {
  try {
    const categorias = await getCategorias(clinicaId);
    categorias.despesas = categorias.despesas.filter(c => c !== categoria);
    await updateCategorias(categorias, clinicaId);
    return categorias;
  } catch (error) {
    console.error('Erro ao remover categoria de despesa:', error);
    throw error;
  }
};

// ==================== PROFISSIONAIS ====================

export const getProfissionais = async (clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    console.warn('Clínica não especificada');
    return [];
  }

  try {
    const q = query(
      collection(db, 'clinicas', clinica, 'profissionais'), 
      orderBy('nome')
    );
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

export const addProfissional = async (profissional, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    const profissionalData = {
      ...profissional,
      clinicaId: clinica,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'clinicas', clinica, 'profissionais'), profissionalData);
    return {
      id: docRef.id,
      ...profissional,
      clinicaId: clinica,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar profissional:', error);
    return addProfissionalToLocalStorage(profissional);
  }
};

export const updateProfissional = async (id, dadosAtualizados, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    const profissionalRef = doc(db, 'clinicas', clinica, 'profissionais', id);
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

export const deleteProfissional = async (id, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  if (!clinica) {
    throw new Error('Clínica não especificada');
  }

  try {
    await deleteDoc(doc(db, 'clinicas', clinica, 'profissionais', id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    return deleteProfissionalFromLocalStorage(id);
  }
};

// ==================== ESTATÍSTICAS ====================

export const getEstatisticas = async (clinicaId = null) => {
  try {
    const [receitas, despesas] = await Promise.all([
      getReceitas(clinicaId),
      getDespesas(clinicaId)
    ]);

    const totalReceitas = receitas.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
    const totalDespesas = despesas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    const totalRecebido = receitas.filter(r => r.status === 'Recebido').reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
    const totalPago = despesas.filter(d => d.status === 'Pago').reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    const totalPendente = receitas.filter(r => r.status === 'Pendente').reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);

    const hoje = new Date();
    const contasVencidas = despesas.filter(d => {
      if (!d.vencimento || d.status === 'Pago') return false;
      return new Date(d.vencimento) < hoje;
    }).length;

    const valorVencido = despesas.filter(d => {
      if (!d.vencimento || d.status === 'Pago') return false;
      return new Date(d.vencimento) < hoje;
    }).reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);

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

// ==================== CLÍNICAS ====================

export const getClinicaById = async (clinicaId) => {
  try {
    const docRef = doc(db, 'clinicas', clinicaId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertTimestamp(docSnap.data())
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar clínica:', error);
    return null;
  }
};

export const updateClinica = async (clinicaId, dadosAtualizados) => {
  try {
    const clinicaRef = doc(db, 'clinicas', clinicaId);
    const updateData = {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(clinicaRef, updateData);
    return {
      id: clinicaId,
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao atualizar clínica:', error);
    throw error;
  }
};

export const getClinicasPorUsuario = async (userId) => {
  try {
    // Buscar clínicas onde o usuário é owner
    const ownerQuery = query(
      collection(db, 'clinicas'),
      where('ownerId', '==', userId),
      where('status', '==', 'ativa')
    );
    const ownerSnapshot = await getDocs(ownerQuery);
    
    const clinicas = [];
    ownerSnapshot.forEach(doc => {
      clinicas.push({
        id: doc.id,
        ...convertTimestamp(doc.data()),
        userRole: 'owner'
      });
    });

    return clinicas;
  } catch (error) {
    console.error('Erro ao buscar clínicas do usuário:', error);
    return [];
  }
};

// ==================== USUÁRIOS DA CLÍNICA ====================

export const adicionarUsuarioClinica = async (clinicaId, userId, dadosUsuario) => {
  try {
    const usuarioData = {
      userId,
      ...dadosUsuario,
      addedAt: serverTimestamp(),
      status: 'ativo'
    };
    
    await setDoc(doc(db, 'clinicas', clinicaId, 'usuarios', userId), usuarioData);
    return usuarioData;
  } catch (error) {
    console.error('Erro ao adicionar usuário à clínica:', error);
    throw error;
  }
};

export const removerUsuarioClinica = async (clinicaId, userId) => {
  try {
    await updateDoc(doc(db, 'clinicas', clinicaId, 'usuarios', userId), {
      status: 'inativo',
      removedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Erro ao remover usuário da clínica:', error);
    throw error;
  }
};

export const getUsuariosClinica = async (clinicaId) => {
  try {
    const q = query(
      collection(db, 'clinicas', clinicaId, 'usuarios'),
      where('status', '==', 'ativo')
    );
    const querySnapshot = await getDocs(q);
    const usuarios = [];
    
    querySnapshot.forEach((doc) => {
      usuarios.push({
        id: doc.id,
        ...convertTimestamp(doc.data())
      });
    });
    
    return usuarios;
  } catch (error) {
    console.error('Erro ao buscar usuários da clínica:', error);
    return [];
  }
};

// ==================== FUNÇÕES DE FALLBACK (localStorage) ====================

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
    receitas: ['Consulta', 'Exame', 'Procedimento', 'Convênio', 'Telemedicina'],
    despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal']
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

  const totalReceitas = receitas.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
  const totalDespesas = despesas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  const totalRecebido = receitas.filter(r => r.status === 'Recebido').reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
  const totalPago = despesas.filter(d => d.status === 'Pago').reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  const totalPendente = receitas.filter(r => r.status === 'Pendente').reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);

  const hoje = new Date();
  const contasVencidas = despesas.filter(d => {
    if (!d.vencimento || d.status === 'Pago') return false;
    return new Date(d.vencimento) < hoje;
  }).length;

  const valorVencido = despesas.filter(d => {
    if (!d.vencimento || d.status === 'Pago') return false;
    return new Date(d.vencimento) < hoje;
  }).reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);

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

// ==================== SERVIÇO DE BACKUP ====================

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
