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
  const { currentUser } = useAuth();
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const clinicaId = currentUser?.clinica?.id;

  const carregarReceitas = useCallback(async () => {
    if (!clinicaId) {
      setReceitas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getReceitas(clinicaId);
      setReceitas(data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  useEffect(() => {
    carregarReceitas();
  }, [carregarReceitas]);

  const adicionarReceita = async (novaReceita) => {
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const receitaAdicionada = await addReceita(novaReceita, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const receitaAtualizada = await updateReceita(id, dadosAtualizados, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      await deleteReceita(id, clinicaId);
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
  const { currentUser } = useAuth();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  const clinicaId = currentUser?.clinica?.id;

  const carregarDespesas = useCallback(async () => {
    if (!clinicaId) {
      setDespesas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getDespesas(clinicaId);
      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  useEffect(() => {
    carregarDespesas();
  }, [carregarDespesas]);

  const adicionarDespesa = async (novaDespesa) => {
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const despesaAdicionada = await addDespesa(novaDespesa, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const despesaAtualizada = await updateDespesa(id, dadosAtualizados, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      await deleteDespesa(id, clinicaId);
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
  const { currentUser } = useAuth();
  const [categorias, setCategorias] = useState({ receitas: [], despesas: [] });
  const [loading, setLoading] = useState(true);

  const clinicaId = currentUser?.clinica?.id;

  const carregarCategorias = useCallback(async () => {
    if (!clinicaId) {
      setCategorias({ receitas: [], despesas: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getCategorias(clinicaId);
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const adicionarCategoriaReceita = async (categoria) => {
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const categoriasAtualizadas = await addCategoriaReceita(categoria, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const categoriasAtualizadas = await addCategoriaDespesa(categoria, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const categoriasAtualizadas = await removeCategoriaReceita(categoria, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const categoriasAtualizadas = await removeCategoriaDespesa(categoria, clinicaId);
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
  const { currentUser } = useAuth();
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);

  const clinicaId = currentUser?.clinica?.id;

  const carregarProfissionais = useCallback(async () => {
    if (!clinicaId) {
      setProfissionais([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getProfissionais(clinicaId);
      setProfissionais(data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  useEffect(() => {
    carregarProfissionais();
  }, [carregarProfissionais]);

  const adicionarProfissional = async (novoProfissional) => {
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const profissionalAdicionado = await addProfissional(novoProfissional, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      const profissionalAtualizado = await updateProfissional(id, dadosAtualizados, clinicaId);
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
    if (!clinicaId) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }

    try {
      await deleteProfissional(id, clinicaId);
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
  const { currentUser } = useAuth();
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

  const clinicaId = currentUser?.clinica?.id;

  const carregarEstatisticas = useCallback(async () => {
    if (!clinicaId) {
      setEstatisticas({
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
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getEstatisticas(clinicaId);
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

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
  const { currentUser } = useAuth();

  const clinicaId = currentUser?.clinica?.id;

  // Timeline de eventos baseado nos dados reais
  const eventos = [
    ...receitas.map(r => ({
      id: `receita-${r.id}`,
      data: r.data,
      descricao: r.descricao,
      tipo: 'entrada',
      valor: parseFloat(r.valor) || 0,
      status: r.status === 'Recebido' ? 'confirmado' : 'previsto',
      categoria: r.categoria
    })),
    ...despesas.map(d => ({
      id: `despesa-${d.id}`,
      data: d.vencimento || d.data,
      descricao: d.descricao,
      tipo: 'saida',
      valor: parseFloat(d.valor) || 0,
      status: d.status === 'Pago' ? 'confirmado' : 'previsto',
      categoria: d.categoria
    }))
  ].sort((a, b) => new Date(a.data) - new Date(b.data));

  // Calcular saldo acumulado
  const receitasRecebidas = receitas.filter(r => r.status === 'Recebido');
  const despesasPagas = despesas.filter(d => d.status === 'Pago');
  
  const saldoAtual = receitasRecebidas.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0) - 
                   despesasPagas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);

  let saldoAcumulado = saldoAtual;
  const eventosComSaldo = eventos.map(evento => {
    if (evento.status === 'previsto') {
      if (evento.tipo === 'entrada') {
        saldoAcumulado += evento.valor;
      } else {
        saldoAcumulado -= evento.valor;
      }
    }
    return {
      ...evento,
      saldoAcumulado
    };
  });

  // Projeções
  const totalEntradas = receitas.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
  const totalSaidas = despesas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  const variacao = totalEntradas - totalSaidas;

  const projecoes = {
    saldoAtual,
    projecao30dias: saldoAtual + variacao,
    projecao60dias: saldoAtual + variacao,
    projecao90dias: saldoAtual + variacao
  };

  return {
    movimentacoes: eventosComSaldo,
    projecoes,
    saldoAtual,
    clinicaId
  };
};

// Hook combinado para facilitar o uso
export const useFinancialData = () => {
  const { currentUser } = useAuth();
  const receitas = useReceitas();
  const despesas = useDespesas();
  const categorias = useCategorias();
  const profissionais = useProfissionais();
  const estatisticas = useEstatisticas();
  const fluxoCaixa = useFluxoCaixa();

  const clinicaId = currentUser?.clinica?.id;
  const clinicaNome = currentUser?.clinica?.nome;

  // Função para recarregar todos os dados
  const recarregarTodos = async () => {
    if (!clinicaId) return;

    await Promise.all([
      receitas.recarregar(),
      despesas.recarregar(),
      categorias.recarregar(),
      profissionais.recarregar(),
      estatisticas.recarregar()
    ]);
  };

  // Verificar se dados estão carregando
  const isLoading = receitas.loading || despesas.loading || categorias.loading || 
                   profissionais.loading || estatisticas.loading;

  // Verificar se há dados disponíveis
  const hasData = receitas.receitas.length > 0 || despesas.despesas.length > 0;

  return {
    // Dados
    receitas,
    despesas,
    categorias,
    profissionais,
    estatisticas,
    fluxoCaixa,
    
    // Estado
    clinicaId,
    clinicaNome,
    isLoading,
    hasData,
    
    // Funções
    recarregarTodos
  };
};

// Hook específico para permissões
export const usePermissions = () => {
  const { currentUser } = useAuth();

  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;
    
    // Owner sempre tem todas as permissões
    if (currentUser.clinicaRole === 'owner') return true;
    
    // Verificar permissões específicas
    const permissions = currentUser.permissions || [];
    return permissions.includes('all') || permissions.includes(permission);
  }, [currentUser]);

  const hasAnyPermission = useCallback((permissionList) => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionList) => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Permissões específicas do sistema
  const canCreateReceita = hasPermission('receitas:create') || hasPermission('financial:all');
  const canEditReceita = hasPermission('receitas:update') || hasPermission('financial:all');
  const canDeleteReceita = hasPermission('receitas:delete') || hasPermission('financial:all');
  
  const canCreateDespesa = hasPermission('despesas:create') || hasPermission('financial:all');
  const canEditDespesa = hasPermission('despesas:update') || hasPermission('financial:all');
  const canDeleteDespesa = hasPermission('despesas:delete') || hasPermission('financial:all');
  
  const canManageCategories = hasPermission('categories:manage') || hasPermission('settings:all');
  const canManageProfissionais = hasPermission('profissionais:manage') || hasPermission('settings:all');
  
  const canViewReports = hasPermission('reports:view') || hasPermission('reports:all');
  const canExportData = hasPermission('data:export') || hasPermission('reports:all');
  
  const canManageSettings = hasPermission('settings:manage') || hasPermission('settings:all');
  const canManageUsers = hasPermission('users:manage');

  return {
    // Funções gerais
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Estado
    isOwner: currentUser?.clinicaRole === 'owner',
    userRole: currentUser?.clinicaRole,
    permissions: currentUser?.permissions || [],
    
    // Permissões específicas
    receitas: {
      create: canCreateReceita,
      edit: canEditReceita,
      delete: canDeleteReceita
    },
    despesas: {
      create: canCreateDespesa,
      edit: canEditDespesa,
      delete: canDeleteDespesa
    },
    settings: {
      categories: canManageCategories,
      profissionais: canManageProfissionais,
      general: canManageSettings,
      users: canManageUsers
    },
    reports: {
      view: canViewReports,
      export: canExportData
    }
  };
};

// Hook para monitorar status da clínica
export const useClinicaStatus = () => {
  const { currentUser } = useAuth();
  
  const isClinicaSelected = !!currentUser?.clinica;
  const isClinicaActive = currentUser?.clinica?.status === 'ativa';
  const clinicaName = currentUser?.clinica?.nome;
  const clinicaId = currentUser?.clinica?.id;
  
  return {
    isClinicaSelected,
    isClinicaActive,
    clinicaName,
    clinicaId,
    hasValidClinica: isClinicaSelected && isClinicaActive
  };
};

// Hook para dados em tempo real (atualização automática)
export const useRealtimeData = (intervalMinutes = 5) => {
  const financial = useFinancialData();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      if (financial.clinicaId && financial.hasData) {
        financial.recarregarTodos();
        setLastUpdate(new Date());
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [financial, intervalMinutes]);

  return {
    ...financial,
    lastUpdate,
    isRealtime: true
  };
};

export default useFinancialData;
