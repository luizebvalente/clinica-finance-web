import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getReceitas, 
  addReceita, 
  updateReceita, 
  deleteReceita,
  getDespesas,
  addDespesa,
  updateDespesa,
  deleteDespesa
} from '../services/firebaseService';
import toast from 'react-hot-toast';

// Hook para gerenciar receitas
export const useReceitas = () => {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarReceitas = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getReceitas(user.id);
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarReceitas();
  }, [carregarReceitas]);

  const adicionarReceita = async (novaReceita) => {
    try {
      const receitaAdicionada = await addReceita(novaReceita, user.id);
      setReceitas(prev => [receitaAdicionada, ...prev]);
      toast.success('Receita adicionada com sucesso!');
      return receitaAdicionada;
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      toast.error('Erro ao adicionar receita');
      throw error;
    }
  };

  const atualizarReceita = async (id, dadosAtualizados) => {
    try {
      const receitaAtualizada = await updateReceita(id, dadosAtualizados);
      setReceitas(prev => 
        prev.map(receita => 
          receita.id === id ? { ...receita, ...dadosAtualizados } : receita
        )
      );
      toast.success('Receita atualizada com sucesso!');
      return receitaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      toast.error('Erro ao atualizar receita');
      throw error;
    }
  };

  const removerReceita = async (id) => {
    try {
      await deleteReceita(id);
      setReceitas(prev => prev.filter(receita => receita.id !== id));
      toast.success('Receita removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover receita:', error);
      toast.error('Erro ao remover receita');
      throw error;
    }
  };

  return { 
    receitas, 
    loading, 
    adicionarReceita, 
    atualizarReceita, 
    removerReceita,
    recarregar: carregarReceitas
  };
};

// Hook para gerenciar despesas
export const useDespesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarDespesas = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getDespesas(user.id);
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarDespesas();
  }, [carregarDespesas]);

  const adicionarDespesa = async (novaDespesa) => {
    try {
      const despesaAdicionada = await addDespesa(novaDespesa, user.id);
      setDespesas(prev => [despesaAdicionada, ...prev]);
      toast.success('Despesa adicionada com sucesso!');
      return despesaAdicionada;
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast.error('Erro ao adicionar despesa');
      throw error;
    }
  };

  const atualizarDespesa = async (id, dadosAtualizados) => {
    try {
      const despesaAtualizada = await updateDespesa(id, dadosAtualizados);
      setDespesas(prev => 
        prev.map(despesa => 
          despesa.id === id ? { ...despesa, ...dadosAtualizados } : despesa
        )
      );
      toast.success('Despesa atualizada com sucesso!');
      return despesaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      toast.error('Erro ao atualizar despesa');
      throw error;
    }
  };

  const removerDespesa = async (id) => {
    try {
      await deleteDespesa(id);
      setDespesas(prev => prev.filter(despesa => despesa.id !== id));
      toast.success('Despesa removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover despesa:', error);
      toast.error('Erro ao remover despesa');
      throw error;
    }
  };

  return { 
    despesas, 
    loading, 
    adicionarDespesa, 
    atualizarDespesa, 
    removerDespesa,
    recarregar: carregarDespesas
  };
};

// Hook para estatísticas e cálculos
export const useEstatisticas = () => {
  const { receitas } = useReceitas();
  const { despesas } = useDespesas();

  const estatisticas = {
    // Receitas
    totalReceitas: receitas.reduce((acc, r) => acc + r.valor, 0),
    receitasRecebidas: receitas.filter(r => r.status === 'Recebido').reduce((acc, r) => acc + r.valor, 0),
    receitasPendentes: receitas.filter(r => r.status === 'Pendente').reduce((acc, r) => acc + r.valor, 0),
    receitasAtrasadas: receitas.filter(r => r.status === 'Em Atraso').reduce((acc, r) => acc + r.valor, 0),

    // Despesas
    totalDespesas: despesas.reduce((acc, d) => acc + d.valor, 0),
    despesasPagas: despesas.filter(d => d.status === 'Pago').reduce((acc, d) => acc + d.valor, 0),
    despesasPendentes: despesas.filter(d => d.status === 'Pendente').reduce((acc, d) => acc + d.valor, 0),
    despesasAtrasadas: despesas.filter(d => d.status === 'Em Atraso').reduce((acc, d) => acc + d.valor, 0),

    // Despesas por tipo
    despesasFixas: despesas.filter(d => d.tipo === 'Fixa').reduce((acc, d) => acc + d.valor, 0),
    despesasVariaveis: despesas.filter(d => d.tipo === 'Variável').reduce((acc, d) => acc + d.valor, 0),

    // Receitas por categoria
    receitasPorCategoria: receitas.reduce((acc, r) => {
      acc[r.categoria] = (acc[r.categoria] || 0) + r.valor;
      return acc;
    }, {}),

    // Despesas por categoria
    despesasPorCategoria: despesas.reduce((acc, d) => {
      acc[d.categoria] = (acc[d.categoria] || 0) + d.valor;
      return acc;
    }, {}),

    // Cálculos gerais
    get lucroLiquido() {
      return this.receitasRecebidas - this.despesasPagas;
    },

    get margemLucro() {
      return this.receitasRecebidas > 0 ? (this.lucroLiquido / this.receitasRecebidas) * 100 : 0;
    },

    get fluxoCaixa() {
      return this.totalReceitas - this.totalDespesas;
    },

    // Alertas
    get alertas() {
      const alertas = [];
      
      if (this.despesasAtrasadas > 0) {
        alertas.push({
          tipo: 'despesa_atrasada',
          titulo: 'Despesas em atraso',
          descricao: `${despesas.filter(d => d.status === 'Em Atraso').length} despesa(s) em atraso`,
          valor: this.despesasAtrasadas,
          urgencia: 'alta'
        });
      }
      
      if (this.receitasPendentes > 0) {
        alertas.push({
          tipo: 'receita_pendente',
          titulo: 'Recebimentos pendentes',
          descricao: `${receitas.filter(r => r.status === 'Pendente').length} receita(s) aguardando`,
          valor: this.receitasPendentes,
          urgencia: 'media'
        });
      }
      
      if (this.fluxoCaixa < 0) {
        alertas.push({
          tipo: 'fluxo_negativo',
          titulo: 'Fluxo de caixa negativo',
          descricao: 'Despesas superiores às receitas',
          valor: this.fluxoCaixa,
          urgencia: 'alta'
        });
      }
      
      return alertas;
    }
  };

  return estatisticas;
};

// Hook para dados de fluxo de caixa
export const useFluxoCaixa = () => {
  const { receitas } = useReceitas();
  const { despesas } = useDespesas();

  // Simular movimentações futuras baseadas nos dados atuais
  const movimentacoes = [
    ...receitas.map(r => ({
      id: `receita-${r.id}`,
      data: r.data,
      descricao: r.descricao,
      tipo: 'entrada',
      valor: r.valor,
      status: r.status === 'Recebido' ? 'confirmado' : 'previsto',
      categoria: r.categoria
    })),
    ...despesas.map(d => ({
      id: `despesa-${d.id}`,
      data: d.vencimento,
      descricao: d.descricao,
      tipo: 'saida',
      valor: d.valor,
      status: d.status === 'Pago' ? 'confirmado' : 'previsto',
      categoria: d.categoria
    }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  // Calcular saldo acumulado
  let saldoAtual = 15420.50; // Saldo inicial simulado
  const movimentacoesComSaldo = movimentacoes.map(mov => {
    if (mov.status === 'confirmado') {
      if (mov.tipo === 'entrada') {
        saldoAtual += mov.valor;
      } else {
        saldoAtual -= mov.valor;
      }
    }
    return {
      ...mov,
      saldoAcumulado: saldoAtual
    };
  });

  // Projeções
  const projecoes = {
    saldoAtual: 15420.50,
    projecao30dias: saldoAtual - 1450,
    projecao60dias: saldoAtual - 1450,
    projecao90dias: saldoAtual - 1450
  };

  return {
    movimentacoes: movimentacoesComSaldo,
    projecoes,
    saldoAtual: projecoes.saldoAtual
  };
};

// Hook para gerenciar profissionais
export const useProfissionais = () => {
  const profissionais = [
    { id: '1', nome: 'Dr. João Silva', especialidade: 'Cardiologia', ativo: true },
    { id: '2', nome: 'Dr. Maria Santos', especialidade: 'Cirurgia', ativo: true },
    { id: '3', nome: 'Dr. Pedro Lima', especialidade: 'Clínica Geral', ativo: true },
    { id: '4', nome: 'Dr. Ana Costa', especialidade: 'Telemedicina', ativo: true },
    { id: '5', nome: 'Dr. Carlos Oliveira', especialidade: 'Especialista', ativo: true }
  ];

  return {
    profissionais,
    loading: false
  };
};

