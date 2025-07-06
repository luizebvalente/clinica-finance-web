import { useState, useEffect, useCallback } from 'react';
import { 
  getReceitas, 
  addReceita, 
  updateReceita, 
  deleteReceita,
  getDespesas,
  addDespesa,
  updateDespesa,
  deleteDespesa,
  getCategorias,
  updateCategorias,
  addCategoriaReceita,
  addCategoriaDespesa,
  removeCategoriaReceita,
  removeCategoriaDespesa,
  getProfissionais,
  addProfissional,
  updateProfissional,
  deleteProfissional,
  getEstatisticas
} from '../services/firebaseService';
import toast from 'react-hot-toast';

// Hook para gerenciar receitas
export const useReceitas = () => {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarReceitas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReceitas();
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarReceitas();
  }, [carregarReceitas]);

  const adicionarReceita = async (novaReceita) => {
    try {
      const receitaAdicionada = await addReceita(novaReceita);
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

  const carregarDespesas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDespesas();
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDespesas();
  }, [carregarDespesas]);

  const adicionarDespesa = async (novaDespesa) => {
    try {
      const despesaAdicionada = await addDespesa(novaDespesa);
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

  const marcarComoPago = async (id) => {
    try {
      await atualizarDespesa(id, { status: 'Pago' });
      toast.success('Despesa marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar despesa como paga:', error);
      toast.error('Erro ao marcar despesa como paga');
      throw error;
    }
  };

  return { 
    despesas, 
    loading, 
    adicionarDespesa, 
    atualizarDespesa, 
    removerDespesa,
    marcarComoPago,
    recarregar: carregarDespesas
  };
};

// Hook para gerenciar categorias
export const useCategorias = () => {
  const [categorias, setCategorias] = useState({ receitas: [], despesas: [] });
  const [loading, setLoading] = useState(true);

  const carregarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const adicionarCategoriaReceita = async (categoria) => {
    try {
      const categoriasAtualizadas = await addCategoriaReceita(categoria);
      setCategorias(categoriasAtualizadas);
      toast.success('Categoria de receita adicionada!');
      return categoriasAtualizadas;
    } catch (error) {
      console.error('Erro ao adicionar categoria de receita:', error);
      toast.error('Erro ao adicionar categoria de receita');
      throw error;
    }
  };

  const adicionarCategoriaDespesa = async (categoria) => {
    try {
      const categoriasAtualizadas = await addCategoriaDespesa(categoria);
      setCategorias(categoriasAtualizadas);
      toast.success('Categoria de despesa adicionada!');
      return categoriasAtualizadas;
    } catch (error) {
      console.error('Erro ao adicionar categoria de despesa:', error);
      toast.error('Erro ao adicionar categoria de despesa');
      throw error;
    }
  };

  const removerCategoriaReceita = async (categoria) => {
    try {
      const categoriasAtualizadas = await removeCategoriaReceita(categoria);
      setCategorias(categoriasAtualizadas);
      toast.success('Categoria de receita removida!');
      return categoriasAtualizadas;
    } catch (error) {
      console.error('Erro ao remover categoria de receita:', error);
      toast.error('Erro ao remover categoria de receita');
      throw error;
    }
  };

  const removerCategoriaDespesa = async (categoria) => {
    try {
      const categoriasAtualizadas = await removeCategoriaDespesa(categoria);
      setCategorias(categoriasAtualizadas);
      toast.success('Categoria de despesa removida!');
      return categoriasAtualizadas;
    } catch (error) {
      console.error('Erro ao remover categoria de despesa:', error);
      toast.error('Erro ao remover categoria de despesa');
      throw error;
    }
  };

  return {
    categorias,
    loading,
    adicionarCategoriaReceita,
    adicionarCategoriaDespesa,
    removerCategoriaReceita,
    removerCategoriaDespesa,
    recarregar: carregarCategorias
  };
};

// Hook para gerenciar profissionais
export const useProfissionais = () => {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarProfissionais = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfissionais();
      setProfissionais(data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProfissionais();
  }, [carregarProfissionais]);

  const adicionarProfissional = async (novoProfissional) => {
    try {
      const profissionalAdicionado = await addProfissional(novoProfissional);
      setProfissionais(prev => [...prev, profissionalAdicionado]);
      toast.success('Profissional adicionado com sucesso!');
      return profissionalAdicionado;
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
      toast.error('Erro ao adicionar profissional');
      throw error;
    }
  };

  const atualizarProfissional = async (id, dadosAtualizados) => {
    try {
      const profissionalAtualizado = await updateProfissional(id, dadosAtualizados);
      setProfissionais(prev => 
        prev.map(profissional => 
          profissional.id === id ? { ...profissional, ...dadosAtualizados } : profissional
        )
      );
      toast.success('Profissional atualizado com sucesso!');
      return profissionalAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast.error('Erro ao atualizar profissional');
      throw error;
    }
  };

  const removerProfissional = async (id) => {
    try {
      await deleteProfissional(id);
      setProfissionais(prev => prev.filter(profissional => profissional.id !== id));
      toast.success('Profissional removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      toast.error('Erro ao remover profissional');
      throw error;
    }
  };

  return {
    profissionais,
    loading,
    adicionarProfissional,
    atualizarProfissional,
    removerProfissional,
    recarregar: carregarProfissionais
  };
};

// Hook para estatísticas e cálculos
export const useEstatisticas = () => {
  const [estatisticas, setEstatisticas] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    lucro: 0,
    totalRecebido: 0,
    totalPago: 0,
    totalPendente: 0,
    fluxoCaixa: 0,
    margemLucro: 0,
    contasVencidas: 0,
    valorVencido: 0,
    receitasPendentesCount: 0
  });
  const [loading, setLoading] = useState(true);

  const carregarEstatisticas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEstatisticas();
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  // Alertas baseados nas estatísticas
  const alertas = [];
  
  if (estatisticas.contasVencidas > 0) {
    alertas.push({
      tipo: 'despesa_atrasada',
      titulo: 'Despesas em atraso',
      descricao: `${estatisticas.contasVencidas} conta(s) em atraso`,
      valor: estatisticas.valorVencido,
      urgencia: 'alta'
    });
  }
  
  if (estatisticas.receitasPendentesCount > 0) {
    alertas.push({
      tipo: 'receita_pendente',
      titulo: 'Recebimentos pendentes',
      descricao: `${estatisticas.receitasPendentesCount} receita(s) aguardando`,
      valor: estatisticas.totalPendente,
      urgencia: 'media'
    });
  }
  
  if (estatisticas.fluxoCaixa < 0) {
    alertas.push({
      tipo: 'fluxo_negativo',
      titulo: 'Fluxo de caixa negativo',
      descricao: 'Despesas superiores às receitas',
      valor: estatisticas.fluxoCaixa,
      urgencia: 'alta'
    });
  }

  return {
    ...estatisticas,
    alertas,
    loading,
    recarregar: carregarEstatisticas
  };
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
      data: d.vencimento || d.data,
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
  const totalEntradas = receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalSaidas = despesas.reduce((sum, d) => sum + d.valor, 0);
  const variacao = totalEntradas - totalSaidas;

  const projecoes = {
    saldoAtual: 15420.50,
    projecao30dias: 15420.50 + variacao,
    projecao60dias: 15420.50 + variacao,
    projecao90dias: 15420.50 + variacao
  };

  return {
    movimentacoes: movimentacoesComSaldo,
    projecoes,
    saldoAtual: projecoes.saldoAtual
  };
};

// Hook combinado para facilitar o uso
export const useFinancialData = () => {
  const receitas = useReceitas();
  const despesas = useDespesas();
  const categorias = useCategorias();
  const profissionais = useProfissionais();
  const estatisticas = useEstatisticas();
  const fluxoCaixa = useFluxoCaixa();

  return {
    receitas,
    despesas,
    categorias,
    profissionais,
    estatisticas,
    fluxoCaixa
  };
};

export default useFinancialData;

