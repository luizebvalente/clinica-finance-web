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
  setDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ==================== UTILITÁRIOS ====================

// Função auxiliar para gerar ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função auxiliar para converter timestamp do Firestore
const convertTimestamp = (data) => {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Converter timestamps do Firestore para strings ISO
  ['createdAt', 'updatedAt', 'data', 'vencimento', 'lastLogin', 'addedAt', 'removedAt'].forEach(field => {
    if (converted[field]) {
      if (converted[field].toDate) {
        converted[field] = converted[field].toDate().toISOString();
      } else if (typeof converted[field] === 'string') {
        // Se já é string, manter como está
        converted[field] = converted[field];
      }
    }
  });
  
  return converted;
};

// Função para obter o contexto da clínica atual
const getCurrentClinicaContext = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return userData.clinica?.id || null;
  } catch (error) {
    console.error('Erro ao obter contexto da clínica:', error);
    return null;
  }
};

// ==================== RECEITAS ====================

export const getReceitas = async (clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    console.warn('Clínica não especificada para receitas');
    return getReceitasFromLocalStorage();
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
    
    // Salvar no localStorage como cache
    localStorage.setItem(`receitas_${clinica}`, JSON.stringify(receitas));
    
    return receitas;
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    // Fallback para localStorage
    return getReceitasFromLocalStorage(clinica);
  }
};

export const addReceita = async (receita, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para adicionar receita');
  }

  try {
    const receitaData = {
      ...receita,
      valor: parseFloat(receita.valor) || 0,
      clinicaId: clinica,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'clinicas', clinica, 'receitas'), receitaData);
    
    const novaReceita = {
      id: docRef.id,
      ...receita,
      valor: parseFloat(receita.valor) || 0,
      clinicaId: clinica,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    const receitasCache = getReceitasFromLocalStorage(clinica);
    receitasCache.unshift(novaReceita);
    localStorage.setItem(`receitas_${clinica}`, JSON.stringify(receitasCache));
    
    return novaReceita;
  } catch (error) {
    console.error('Erro ao adicionar receita:', error);
    // Fallback para localStorage
    return addReceitaToLocalStorage(receita, clinica);
  }
};

export const updateReceita = async (id, dadosAtualizados, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para atualizar receita');
  }

  try {
    const receitaRef = doc(db, 'clinicas', clinica, 'receitas', id);
    const updateData = {
      ...dadosAtualizados,
      valor: parseFloat(dadosAtualizados.valor) || 0,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(receitaRef, updateData);
    
    const receitaAtualizada = {
      id,
      ...dadosAtualizados,
      valor: parseFloat(dadosAtualizados.valor) || 0,
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    updateReceitaInLocalStorage(id, dadosAtualizados, clinica);
    
    return receitaAtualizada;
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    // Fallback para localStorage
    return updateReceitaInLocalStorage(id, dadosAtualizados, clinica);
  }
};

export const deleteReceita = async (id, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para deletar receita');
  }

  try {
    await deleteDoc(doc(db, 'clinicas', clinica, 'receitas', id));
    
    // Atualizar cache
    deleteReceitaFromLocalStorage(id, clinica);
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    // Fallback para localStorage
    return deleteReceitaFromLocalStorage(id, clinica);
  }
};

// ==================== DESPESAS ====================

export const getDespesas = async (clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    console.warn('Clínica não especificada para despesas');
    return getDespesasFromLocalStorage();
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
    
    // Salvar no localStorage como cache
    localStorage.setItem(`despesas_${clinica}`, JSON.stringify(despesas));
    
    return despesas;
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    // Fallback para localStorage
    return getDespesasFromLocalStorage(clinica);
  }
};

export const addDespesa = async (despesa, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para adicionar despesa');
  }

  try {
    const despesaData = {
      ...despesa,
      valor: parseFloat(despesa.valor) || 0,
      clinicaId: clinica,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'clinicas', clinica, 'despesas'), despesaData);
    
    const novaDespesa = {
      id: docRef.id,
      ...despesa,
      valor: parseFloat(despesa.valor) || 0,
      clinicaId: clinica,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    const despesasCache = getDespesasFromLocalStorage(clinica);
    despesasCache.unshift(novaDespesa);
    localStorage.setItem(`despesas_${clinica}`, JSON.stringify(despesasCache));
    
    return novaDespesa;
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    // Fallback para localStorage
    return addDespesaToLocalStorage(despesa, clinica);
  }
};

export const updateDespesa = async (id, dadosAtualizados, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para atualizar despesa');
  }

  try {
    const despesaRef = doc(db, 'clinicas', clinica, 'despesas', id);
    const updateData = {
      ...dadosAtualizados,
      valor: parseFloat(dadosAtualizados.valor) || 0,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(despesaRef, updateData);
    
    const despesaAtualizada = {
      id,
      ...dadosAtualizados,
      valor: parseFloat(dadosAtualizados.valor) || 0,
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    updateDespesaInLocalStorage(id, dadosAtualizados, clinica);
    
    return despesaAtualizada;
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    // Fallback para localStorage
    return updateDespesaInLocalStorage(id, dadosAtualizados, clinica);
  }
};

export const deleteDespesa = async (id, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para deletar despesa');
  }

  try {
    await deleteDoc(doc(db, 'clinicas', clinica, 'despesas', id));
    
    // Atualizar cache
    deleteDespesaFromLocalStorage(id, clinica);
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    // Fallback para localStorage
    return deleteDespesaFromLocalStorage(id, clinica);
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
    
    let categorias;
    if (docSnap.exists()) {
      categorias = docSnap.data();
    } else {
      // Criar categorias iniciais se não existir
      categorias = {
        receitas: ['Consulta', 'Exame', 'Procedimento', 'Convênio', 'Telemedicina', 'Cirurgia'],
        despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(docRef, categorias);
    }
    
    // Salvar no cache
    localStorage.setItem(`categorias_${clinica}`, JSON.stringify(categorias));
    
    return categorias;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    // Fallback para localStorage
    return getCategoriasFromLocalStorage(clinica);
  }
};

export const updateCategorias = async (categorias, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    return updateCategoriasInLocalStorage(categorias);
  }

  try {
    const docRef = doc(db, 'clinicas', clinica, 'configuracoes', 'categorias');
    const updateData = {
      ...categorias,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, updateData, { merge: true });
    
    // Atualizar cache
    localStorage.setItem(`categorias_${clinica}`, JSON.stringify(categorias));
    
    return categorias;
  } catch (error) {
    console.error('Erro ao atualizar categorias:', error);
    // Fallback para localStorage
    return updateCategoriasInLocalStorage(categorias, clinica);
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
    console.warn('Clínica não especificada para profissionais');
    return getProfissionaisFromLocalStorage();
  }

  try {
    const q = query(
      collection(db, 'clinicas', clinica, 'profissionais'), 
      where('status', '==', 'ativo'),
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
    
    // Salvar no cache
    localStorage.setItem(`profissionais_${clinica}`, JSON.stringify(profissionais));
    
    return profissionais;
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    // Fallback para localStorage
    return getProfissionaisFromLocalStorage(clinica);
  }
};

export const addProfissional = async (profissional, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para adicionar profissional');
  }

  try {
    const profissionalData = {
      ...profissional,
      clinicaId: clinica,
      status: 'ativo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'clinicas', clinica, 'profissionais'), profissionalData);
    
    const novoProfissional = {
      id: docRef.id,
      ...profissional,
      clinicaId: clinica,
      status: 'ativo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    const profissionaisCache = getProfissionaisFromLocalStorage(clinica);
    profissionaisCache.push(novoProfissional);
    localStorage.setItem(`profissionais_${clinica}`, JSON.stringify(profissionaisCache));
    
    return novoProfissional;
  } catch (error) {
    console.error('Erro ao adicionar profissional:', error);
    // Fallback para localStorage
    return addProfissionalToLocalStorage(profissional, clinica);
  }
};

export const updateProfissional = async (id, dadosAtualizados, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para atualizar profissional');
  }

  try {
    const profissionalRef = doc(db, 'clinicas', clinica, 'profissionais', id);
    const updateData = {
      ...dadosAtualizados,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(profissionalRef, updateData);
    
    const profissionalAtualizado = {
      id,
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar cache
    updateProfissionalInLocalStorage(id, dadosAtualizados, clinica);
    
    return profissionalAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    // Fallback para localStorage
    return updateProfissionalInLocalStorage(id, dadosAtualizados, clinica);
  }
};

export const deleteProfissional = async (id, clinicaId = null) => {
  const clinica = clinicaId || getCurrentClinicaContext();
  
  if (!clinica) {
    throw new Error('Clínica não especificada para deletar profissional');
  }

  try {
    // Marcar como inativo em vez de deletar
    const profissionalRef = doc(db, 'clinicas', clinica, 'profissionais', id);
    await updateDoc(profissionalRef, {
      status: 'inativo',
      updatedAt: serverTimestamp()
    });
    
    // Atualizar cache
    deleteProfissionalFromLocalStorage(id, clinica);
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    // Fallback para localStorage
    return deleteProfissionalFromLocalStorage(id, clinica);
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
    return getEstatisticasFromLocalStorage(clinicaId);
  }
};

// ==================== CLÍNICAS ====================

export const getClinicaById = async (clinicaId) => {
  if (!clinicaId) return null;
  
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
  if (!clinicaId) throw new Error('ID da clínica é obrigatório');
  
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
  if (!userId) return [];
  
  try {
    // Buscar clínicas onde o usuário é owner
    const ownerQuery = query(
      collection(db, 'clinicas'),
      where('ownerId', '==', userId),
      where('status', '==', 'ativa')
    );
    const ownerSnapshot = await getDocs(ownerQuery);
    
    const clinicas = [];
    for (const clinicaDoc of ownerSnapshot.docs) {
      const clinicaData = {
        id: clinicaDoc.id,
        ...convertTimestamp(clinicaDoc.data()),
        userRole: 'owner'
      };
      clinicas.push(clinicaData);
    }

    return clinicas;
  } catch (error) {
    console.error('Erro ao buscar clínicas do usuário:', error);
    return [];
  }
};

// ==================== INICIALIZAÇÃO DE DADOS DA CLÍNICA ====================

export const inicializarDadosClinica = async (clinicaId, nomeUsuario = 'Administrador') => {
  if (!clinicaId) throw new Error('ID da clínica é obrigatório');
  
  try {
    const batch = writeBatch(db);
    
    // 1. Criar categorias iniciais
    const categoriasRef = doc(db, 'clinicas', clinicaId, 'configuracoes', 'categorias');
    batch.set(categoriasRef, {
      receitas: ['Consulta', 'Exame', 'Procedimento', 'Convênio', 'Telemedicina', 'Cirurgia'],
      despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 2. Criar profissional inicial (o usuário que criou a clínica)
    const profissionalRef = doc(collection(db, 'clinicas', clinicaId, 'profissionais'));
    batch.set(profissionalRef, {
      nome: nomeUsuario,
      especialidade: 'Clínico Geral',
      crm: '',
      email: '',
      telefone: '',
      status: 'ativo',
      clinicaId: clinicaId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 3. Criar configurações gerais
    const configRef = doc(db, 'clinicas', clinicaId, 'configuracoes', 'gerais');
    batch.set(configRef, {
      moeda: 'BRL',
      fuso: 'America/Sao_Paulo',
      tema: 'light',
      notificacoes: {
        email: true,
        push: true,
        vencimentos: 3 // dias antes
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    
    console.log(`Dados iniciais criados para a clínica ${clinicaId}`);
    return true;
  } catch (error) {
    console.error('Erro ao inicializar dados da clínica:', error);
    throw error;
  }
};

// ==================== FUNÇÕES DE FALLBACK (localStorage) ====================

const getReceitasFromLocalStorage = (clinicaId = 'default') => {
  const receitas = localStorage.getItem(`receitas_${clinicaId}`);
  return receitas ? JSON.parse(receitas) : [];
};

const addReceitaToLocalStorage = (receita, clinicaId = 'default') => {
  const receitas = getReceitasFromLocalStorage(clinicaId);
  const novaReceita = {
    id: generateId(),
    ...receita,
    valor: parseFloat(receita.valor) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  receitas.unshift(novaReceita);
  localStorage.setItem(`receitas_${clinicaId}`, JSON.stringify(receitas));
  return novaReceita;
};

const updateReceitaInLocalStorage = (id, dadosAtualizados, clinicaId = 'default') => {
  const receitas = getReceitasFromLocalStorage(clinicaId);
  const index = receitas.findIndex(r => r.id === id);
  if (index !== -1) {
    receitas[index] = {
      ...receitas[index],
      ...dadosAtualizados,
      valor: parseFloat(dadosAtualizados.valor) || receitas[index].valor,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`receitas_${clinicaId}`, JSON.stringify(receitas));
    return receitas[index];
  }
  throw new Error('Receita não encontrada');
};

const deleteReceitaFromLocalStorage = (id, clinicaId = 'default') => {
  const receitas = getReceitasFromLocalStorage(clinicaId);
  const novasReceitas = receitas.filter(r => r.id !== id);
  localStorage.setItem(`receitas_${clinicaId}`, JSON.stringify(novasReceitas));
  return true;
};

const getDespesasFromLocalStorage = (clinicaId = 'default') => {
  const despesas = localStorage.getItem(`despesas_${clinicaId}`);
  return despesas ? JSON.parse(despesas) : [];
};

const addDespesaToLocalStorage = (despesa, clinicaId = 'default') => {
  const despesas = getDespesasFromLocalStorage(clinicaId);
  const novaDespesa = {
    id: generateId(),
    ...despesa,
    valor: parseFloat(despesa.valor) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  despesas.unshift(novaDespesa);
  localStorage.setItem(`despesas_${clinicaId}`, JSON.stringify(despesas));
  return novaDespesa;
};

const updateDespesaInLocalStorage = (id, dadosAtualizados, clinicaId = 'default') => {
  const despesas = getDespesasFromLocalStorage(clinicaId);
  const index = despesas.findIndex(d => d.id === id);
  if (index !== -1) {
    despesas[index] = {
      ...despesas[index],
      ...dadosAtualizados,
      valor: parseFloat(dadosAtualizados.valor) || despesas[index].valor,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`despesas_${clinicaId}`, JSON.stringify(despesas));
    return despesas[index];
  }
  throw new Error('Despesa não encontrada');
};

const deleteDespesaFromLocalStorage = (id, clinicaId = 'default') => {
  const despesas = getDespesasFromLocalStorage(clinicaId);
  const novasDespesas = despesas.filter(d => d.id !== id);
  localStorage.setItem(`despesas_${clinicaId}`, JSON.stringify(novasDespesas));
  return true;
};

const getCategoriasFromLocalStorage = (clinicaId = 'default') => {
  const categorias = localStorage.getItem(`categorias_${clinicaId}`);
  return categorias ? JSON.parse(categorias) : {
    receitas: ['Consulta', 'Exame', 'Procedimento', 'Convênio', 'Telemedicina', 'Cirurgia'],
    despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal']
  };
};

const updateCategoriasInLocalStorage = (categorias, clinicaId = 'default') => {
  localStorage.setItem(`categorias_${clinicaId}`, JSON.stringify(categorias));
  return categorias;
};

const getProfissionaisFromLocalStorage = (clinicaId = 'default') => {
  const profissionais = localStorage.getItem(`profissionais_${clinicaId}`);
  return profissionais ? JSON.parse(profissionais) : [];
};

const addProfissionalToLocalStorage = (profissional, clinicaId = 'default') => {
  const profissionais = getProfissionaisFromLocalStorage(clinicaId);
  const novoProfissional = {
    id: generateId(),
    ...profissional,
    status: 'ativo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  profissionais.push(novoProfissional);
  localStorage.setItem(`profissionais_${clinicaId}`, JSON.stringify(profissionais));
  return novoProfissional;
};

const updateProfissionalInLocalStorage = (id, dadosAtualizados, clinicaId = 'default') => {
  const profissionais = getProfissionaisFromLocalStorage(clinicaId);
  const index = profissionais.findIndex(p => p.id === id);
  if (index !== -1) {
    profissionais[index] = {
      ...profissionais[index],
      ...dadosAtualizados,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`profissionais_${clinicaId}`, JSON.stringify(profissionais));
    return profissionais[index];
  }
  throw new Error('Profissional não encontrado');
};

const deleteProfissionalFromLocalStorage = (id, clinicaId = 'default') => {
  const profissionais = getProfissionaisFromLocalStorage(clinicaId);
  const novosProfissionais = profissionais.filter(p => p.id !== id);
  localStorage.setItem(`profissionais_${clinicaId}`, JSON.stringify(novosProfissionais));
  return true;
};

const getEstatisticasFromLocalStorage = (clinicaId = 'default') => {
  const receitas = getReceitasFromLocalStorage(clinicaId);
  const despesas = getDespesasFromLocalStorage(clinicaId);

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

// ==================== GERENCIAMENTO DE USUÁRIOS DA CLÍNICA ====================

export const adicionarUsuarioClinica = async (clinicaId, userId, dadosUsuario) => {
  if (!clinicaId || !userId) throw new Error('ID da clínica e do usuário são obrigatórios');
  
  try {
    const usuarioData = {
      userId,
      role: dadosUsuario.role || 'user',
      permissions: dadosUsuario.permissions || ['read'],
      addedAt: serverTimestamp(),
      status: 'ativo',
      ...dadosUsuario
    };
    
    await setDoc(doc(db, 'clinicas', clinicaId, 'usuarios', userId), usuarioData);
    return {
      ...usuarioData,
      addedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar usuário à clínica:', error);
    throw error;
  }
};

export const removerUsuarioClinica = async (clinicaId, userId) => {
  if (!clinicaId || !userId) throw new Error('ID da clínica e do usuário são obrigatórios');
  
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
  if (!clinicaId) return [];
  
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

export const verificarAcessoUsuario = async (clinicaId, userId) => {
  if (!clinicaId || !userId) return null;
  
  try {
    const docRef = doc(db, 'clinicas', clinicaId, 'usuarios', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().status === 'ativo') {
      return {
        id: docSnap.id,
        ...convertTimestamp(docSnap.data())
      };
    }
    
    // Verificar se é owner da clínica
    const clinicaRef = doc(db, 'clinicas', clinicaId);
    const clinicaSnap = await getDoc(clinicaRef);
    
    if (clinicaSnap.exists() && clinicaSnap.data().ownerId === userId) {
      return {
        id: userId,
        role: 'owner',
        permissions: ['all'],
        status: 'ativo'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao verificar acesso do usuário:', error);
    return null;
  }
};

// ==================== SERVIÇO DE BACKUP E SINCRONIZAÇÃO ====================

export const localStorageService = {
  exportData: (clinicaId = null) => {
    const clinica = clinicaId || getCurrentClinicaContext() || 'default';
    const data = {
      clinicaId: clinica,
      receitas: getReceitasFromLocalStorage(clinica),
      despesas: getDespesasFromLocalStorage(clinica),
      categorias: getCategoriasFromLocalStorage(clinica),
      profissionais: getProfissionaisFromLocalStorage(clinica),
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    return JSON.stringify(data, null, 2);
  },
  
  importData: (jsonData, clinicaId = null) => {
    try {
      const data = JSON.parse(jsonData);
      const clinica = clinicaId || data.clinicaId || getCurrentClinicaContext() || 'default';
      
      if (data.receitas) localStorage.setItem(`receitas_${clinica}`, JSON.stringify(data.receitas));
      if (data.despesas) localStorage.setItem(`despesas_${clinica}`, JSON.stringify(data.despesas));
      if (data.categorias) localStorage.setItem(`categorias_${clinica}`, JSON.stringify(data.categorias));
      if (data.profissionais) localStorage.setItem(`profissionais_${clinica}`, JSON.stringify(data.profissionais));
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  },
  
  clearAllData: (clinicaId = null) => {
    const clinica = clinicaId || getCurrentClinicaContext() || 'default';
    localStorage.removeItem(`receitas_${clinica}`);
    localStorage.removeItem(`despesas_${clinica}`);
    localStorage.removeItem(`categorias_${clinica}`);
    localStorage.removeItem(`profissionais_${clinica}`);
    return true;
  },

  syncToFirebase: async (clinicaId = null) => {
    const clinica = clinicaId || getCurrentClinicaContext();
    if (!clinica) return false;

    try {
      // Sincronizar dados do localStorage para o Firebase
      const receitas = getReceitasFromLocalStorage(clinica);
      const despesas = getDespesasFromLocalStorage(clinica);
      const categorias = getCategoriasFromLocalStorage(clinica);
      const profissionais = getProfissionaisFromLocalStorage(clinica);

      const batch = writeBatch(db);

      // Sync receitas
      receitas.forEach(receita => {
        if (!receita.synced) {
          const docRef = doc(collection(db, 'clinicas', clinica, 'receitas'));
          batch.set(docRef, {
            ...receita,
            valor: parseFloat(receita.valor) || 0,
            createdAt: Timestamp.fromDate(new Date(receita.createdAt)),
            updatedAt: serverTimestamp()
          });
        }
      });

      // Sync despesas
      despesas.forEach(despesa => {
        if (!despesa.synced) {
          const docRef = doc(collection(db, 'clinicas', clinica, 'despesas'));
          batch.set(docRef, {
            ...despesa,
            valor: parseFloat(despesa.valor) || 0,
            createdAt: Timestamp.fromDate(new Date(despesa.createdAt)),
            updatedAt: serverTimestamp()
          });
        }
      });

      // Sync categorias
      if (categorias) {
        const categoriasRef = doc(db, 'clinicas', clinica, 'configuracoes', 'categorias');
        batch.set(categoriasRef, {
          ...categorias,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Sync profissionais
      profissionais.forEach(profissional => {
        if (!profissional.synced) {
          const docRef = doc(collection(db, 'clinicas', clinica, 'profissionais'));
          batch.set(docRef, {
            ...profissional,
            status: profissional.status || 'ativo',
            createdAt: Timestamp.fromDate(new Date(profissional.createdAt)),
            updatedAt: serverTimestamp()
          });
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar com Firebase:', error);
      return false;
    }
  }
};

// ==================== UTILITÁRIOS DE VALIDAÇÃO ====================

export const validateClinicaData = (dados) => {
  const erros = [];
  
  if (!dados.nome || dados.nome.trim().length < 3) {
    erros.push('Nome da clínica deve ter pelo menos 3 caracteres');
  }
  
  if (dados.cnpj && dados.cnpj.length > 0) {
    // Validação simples de CNPJ (apenas formato)
    const cnpjLimpo = dados.cnpj.replace(/[^\d]/g, '');
    if (cnpjLimpo.length !== 14) {
      erros.push('CNPJ deve ter 14 dígitos');
    }
  }
  
  if (dados.email && dados.email.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
      erros.push('Email inválido');
    }
  }
  
  return {
    valid: erros.length === 0,
    errors: erros
  };
};

export const validateFinancialData = (dados, tipo) => {
  const erros = [];
  
  if (!dados.descricao || dados.descricao.trim().length < 3) {
    erros.push('Descrição deve ter pelo menos 3 caracteres');
  }
  
  if (!dados.valor || parseFloat(dados.valor) <= 0) {
    erros.push('Valor deve ser maior que zero');
  }
  
  if (!dados.categoria || dados.categoria.trim().length === 0) {
    erros.push('Categoria é obrigatória');
  }
  
  if (!dados.data || !isValidDate(dados.data)) {
    erros.push('Data inválida');
  }
  
  if (tipo === 'receita' && !dados.profissional) {
    erros.push('Profissional é obrigatório para receitas');
  }
  
  if (tipo === 'despesa') {
    if (!dados.tipo || !['Fixa', 'Variável'].includes(dados.tipo)) {
      erros.push('Tipo de despesa deve ser Fixa ou Variável');
    }
  }
  
  return {
    valid: erros.length === 0,
    errors: erros
  };
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// ==================== CONFIGURAÇÕES PADRÃO ====================

export const getDefaultSettings = () => ({
  moeda: 'BRL',
  fuso: 'America/Sao_Paulo',
  tema: 'light',
  notificacoes: {
    email: true,
    push: true,
    vencimentos: 3
  },
  backup: {
    automatico: true,
    frequencia: 'semanal'
  },
  relatorios: {
    formato: 'pdf',
    incluirGraficos: true
  }
});

// ==================== LOG DE ATIVIDADES ====================

export const logActivity = async (clinicaId, userId, acao, detalhes = {}) => {
  if (!clinicaId || !userId) return;
  
  try {
    const logData = {
      userId,
      acao,
      detalhes,
      timestamp: serverTimestamp(),
      ip: 'unknown', // Seria obtido do servidor em uma implementação completa
      userAgent: navigator.userAgent
    };
    
    await addDoc(collection(db, 'clinicas', clinicaId, 'logs'), logData);
  } catch (error) {
    console.warn('Erro ao registrar log de atividade:', error);
    // Não propagar o erro para não afetar a operação principal
  }
};

// ==================== FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ====================

export const initializeFirebaseService = async () => {
  console.log('🔥 Firebase Service inicializado');
  console.log('📊 Suporte a múltiplas clínicas ativado');
  console.log('💾 Cache local habilitado');
  return true;
};

// Exportação das funções principais agrupadas por categoria
export default {
  // Receitas
  receitas: {
    get: getReceitas,
    add: addReceita,
    update: updateReceita,
    delete: deleteReceita
  },
  
  // Despesas
  despesas: {
    get: getDespesas,
    add: addDespesa,
    update: updateDespesa,
    delete: deleteDespesa
  },
  
  // Categorias
  categorias: {
    get: getCategorias,
    update: updateCategorias,
    addReceita: addCategoriaReceita,
    addDespesa: addCategoriaDespesa,
    removeReceita: removeCategoriaReceita,
    removeDespesa: removeCategoriaDespesa
  },
  
  // Profissionais
  profissionais: {
    get: getProfissionais,
    add: addProfissional,
    update: updateProfissional,
    delete: deleteProfissional
  },
  
  // Clínicas
  clinicas: {
    getById: getClinicaById,
    update: updateClinica,
    getPorUsuario: getClinicasPorUsuario,
    inicializarDados: inicializarDadosClinica
  },
  
  // Estatísticas
  estatisticas: {
    get: getEstatisticas
  },
  
  // Usuários
  usuarios: {
    adicionar: adicionarUsuarioClinica,
    remover: removerUsuarioClinica,
    listar: getUsuariosClinica,
    verificarAcesso: verificarAcessoUsuario
  },
  
  // Utilitários
  utils: {
    validate: {
      clinica: validateClinicaData,
      financial: validateFinancialData
    },
    storage: localStorageService,
    log: logActivity,
    settings: getDefaultSettings
  }
};
