import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Flag para alternar entre Firebase real e dados mock
const USE_FIREBASE = true;

// Dados mock para fallback
const dadosMock = {
  receitas: [
    {
      id: '1',
      data: '2025-01-10',
      descricao: 'Consulta Cardiologia',
      categoria: 'Consulta',
      profissional: 'Dr. João Silva',
      valor: 180.00,
      status: 'Recebido'
    },
    {
      id: '2',
      data: '2025-01-08',
      descricao: 'Procedimento Cirúrgico',
      categoria: 'Procedimento',
      profissional: 'Dr. Maria Santos',
      valor: 630.00,
      status: 'Pendente'
    },
    {
      id: '3',
      data: '2025-01-05',
      descricao: 'Consulta Convênio',
      categoria: 'Convenio',
      profissional: 'Dr. Pedro Lima',
      valor: 120.00,
      status: 'Recebido'
    },
    {
      id: '4',
      data: '2025-01-03',
      descricao: 'Telemedicina',
      categoria: 'Telemedicina',
      profissional: 'Dr. Ana Costa',
      valor: 80.00,
      status: 'Recebido'
    },
    {
      id: '5',
      data: '2024-12-28',
      descricao: 'Consulta Especializada',
      categoria: 'Procedimento',
      profissional: 'Dr. Carlos Oliveira',
      valor: 290.00,
      status: 'Em Atraso'
    }
  ],
  despesas: [
    {
      id: '1',
      vencimento: '2025-01-15',
      descricao: 'Aluguel Clínica',
      categoria: 'Administrativa',
      tipo: 'Fixa',
      valor: 3500.00,
      status: 'Pendente',
      recorrente: true
    },
    {
      id: '2',
      vencimento: '2025-01-10',
      descricao: 'Material Cirúrgico',
      categoria: 'Clínica',
      tipo: 'Variável',
      valor: 850.00,
      status: 'Em Atraso',
      recorrente: false
    },
    {
      id: '3',
      vencimento: '2025-01-20',
      descricao: 'Marketing Digital',
      categoria: 'Marketing',
      tipo: 'Variável',
      valor: 600.00,
      status: 'Pendente',
      recorrente: true
    },
    {
      id: '4',
      vencimento: '2025-01-05',
      descricao: 'Energia Elétrica',
      categoria: 'Utilidades',
      tipo: 'Fixa',
      valor: 320.00,
      status: 'Pago',
      recorrente: true
    },
    {
      id: '5',
      vencimento: '2025-01-12',
      descricao: 'Internet',
      categoria: 'Utilidades',
      tipo: 'Fixa',
      valor: 250.00,
      status: 'Pago',
      recorrente: true
    }
  ]
};

// ===== RECEITAS =====

export const getReceitas = async (userId = 'demo-user') => {
  if (!USE_FIREBASE) {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    return dadosMock.receitas;
  }

  try {
    const q = query(
      collection(db, 'receitas'),
      where('userId', '==', userId),
      orderBy('data', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const receitas = [];
    
    querySnapshot.forEach((doc) => {
      receitas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Se não há dados no Firebase, retorna dados mock e os migra
    if (receitas.length === 0) {
      console.log('Nenhuma receita encontrada, migrando dados mock...');
      await migrarReceitasMock(userId);
      return dadosMock.receitas.map(r => ({ ...r, userId }));
    }
    
    return receitas;
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    // Fallback para dados mock em caso de erro
    return dadosMock.receitas;
  }
};

export const addReceita = async (receita, userId = 'demo-user') => {
  if (!USE_FIREBASE) {
    const novaReceita = { 
      ...receita, 
      id: Date.now().toString(),
      userId 
    };
    dadosMock.receitas.unshift(novaReceita);
    return novaReceita;
  }

  try {
    const docRef = await addDoc(collection(db, 'receitas'), {
      ...receita,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return {
      id: docRef.id,
      ...receita,
      userId
    };
  } catch (error) {
    console.error('Erro ao adicionar receita:', error);
    throw error;
  }
};

export const updateReceita = async (id, dadosAtualizados) => {
  if (!USE_FIREBASE) {
    const index = dadosMock.receitas.findIndex(r => r.id === id);
    if (index !== -1) {
      dadosMock.receitas[index] = { ...dadosMock.receitas[index], ...dadosAtualizados };
      return dadosMock.receitas[index];
    }
    throw new Error('Receita não encontrada');
  }

  try {
    const receitaRef = doc(db, 'receitas', id);
    await updateDoc(receitaRef, {
      ...dadosAtualizados,
      updatedAt: Timestamp.now()
    });
    
    return { id, ...dadosAtualizados };
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    throw error;
  }
};

export const deleteReceita = async (id) => {
  if (!USE_FIREBASE) {
    const index = dadosMock.receitas.findIndex(r => r.id === id);
    if (index !== -1) {
      dadosMock.receitas.splice(index, 1);
      return id;
    }
    throw new Error('Receita não encontrada');
  }

  try {
    await deleteDoc(doc(db, 'receitas', id));
    return id;
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    throw error;
  }
};

// ===== DESPESAS =====

export const getDespesas = async (userId = 'demo-user') => {
  if (!USE_FIREBASE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return dadosMock.despesas;
  }

  try {
    const q = query(
      collection(db, 'despesas'),
      where('userId', '==', userId),
      orderBy('vencimento', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const despesas = [];
    
    querySnapshot.forEach((doc) => {
      despesas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Se não há dados no Firebase, retorna dados mock e os migra
    if (despesas.length === 0) {
      console.log('Nenhuma despesa encontrada, migrando dados mock...');
      await migrarDespesasMock(userId);
      return dadosMock.despesas.map(d => ({ ...d, userId }));
    }
    
    return despesas;
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return dadosMock.despesas;
  }
};

export const addDespesa = async (despesa, userId = 'demo-user') => {
  if (!USE_FIREBASE) {
    const novaDespesa = { 
      ...despesa, 
      id: Date.now().toString(),
      userId 
    };
    dadosMock.despesas.unshift(novaDespesa);
    return novaDespesa;
  }

  try {
    const docRef = await addDoc(collection(db, 'despesas'), {
      ...despesa,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return {
      id: docRef.id,
      ...despesa,
      userId
    };
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    throw error;
  }
};

export const updateDespesa = async (id, dadosAtualizados) => {
  if (!USE_FIREBASE) {
    const index = dadosMock.despesas.findIndex(d => d.id === id);
    if (index !== -1) {
      dadosMock.despesas[index] = { ...dadosMock.despesas[index], ...dadosAtualizados };
      return dadosMock.despesas[index];
    }
    throw new Error('Despesa não encontrada');
  }

  try {
    const despesaRef = doc(db, 'despesas', id);
    await updateDoc(despesaRef, {
      ...dadosAtualizados,
      updatedAt: Timestamp.now()
    });
    
    return { id, ...dadosAtualizados };
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
};

export const deleteDespesa = async (id) => {
  if (!USE_FIREBASE) {
    const index = dadosMock.despesas.findIndex(d => d.id === id);
    if (index !== -1) {
      dadosMock.despesas.splice(index, 1);
      return id;
    }
    throw new Error('Despesa não encontrada');
  }

  try {
    await deleteDoc(doc(db, 'despesas', id));
    return id;
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    throw error;
  }
};

// ===== MIGRAÇÃO DE DADOS MOCK =====

const migrarReceitasMock = async (userId) => {
  try {
    console.log('Migrando receitas mock para Firebase...');
    for (const receita of dadosMock.receitas) {
      const { id, ...receitaSemId } = receita;
      await addDoc(collection(db, 'receitas'), {
        ...receitaSemId,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    console.log('Receitas migradas com sucesso!');
  } catch (error) {
    console.error('Erro ao migrar receitas:', error);
  }
};

const migrarDespesasMock = async (userId) => {
  try {
    console.log('Migrando despesas mock para Firebase...');
    for (const despesa of dadosMock.despesas) {
      const { id, ...despesaSemId } = despesa;
      await addDoc(collection(db, 'despesas'), {
        ...despesaSemId,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    console.log('Despesas migradas com sucesso!');
  } catch (error) {
    console.error('Erro ao migrar despesas:', error);
  }
};

// ===== FUNÇÃO PARA MIGRAR TODOS OS DADOS =====

export const migrarTodosDados = async (userId = 'demo-user') => {
  try {
    console.log('Iniciando migração completa de dados...');
    await migrarReceitasMock(userId);
    await migrarDespesasMock(userId);
    console.log('Migração completa finalizada!');
  } catch (error) {
    console.error('Erro na migração completa:', error);
    throw error;
  }
};

