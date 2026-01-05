import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getReceitas, getDespesas } from '../services/firebaseService';

// Hook personalizado para gerenciar dados de relatórios com filtros e dados reais
export const useDadosRelatorios = (filtros) => {
  const { currentUser } = useAuth();
  const [receitasOriginais, setReceitasOriginais] = useState([]);
  const [despesasOriginais, setDespesasOriginais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clinicaId = currentUser?.clinica?.id;

  // Buscar dados reais do Firebase
  useEffect(() => {
    const carregarDados = async () => {
      if (!clinicaId) {
        setReceitasOriginais([]);
        setDespesasOriginais([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar receitas e despesas em paralelo
        const [receitasData, despesasData] = await Promise.all([
          getReceitas(clinicaId),
          getDespesas(clinicaId)
        ]);

        // Processar receitas para adicionar campos necessários
        const receitasProcessadas = receitasData.map(receita => {
          const data = receita.data ? new Date(receita.data) : new Date();
          return {
            ...receita,
            mes: String(data.getMonth() + 1).padStart(2, '0'),
            ano: String(data.getFullYear()),
            status: receita.status || 'pendente'
          };
        });

        // Processar despesas para adicionar campos necessários
        const despesasProcessadas = despesasData.map(despesa => {
          const data = despesa.data ? new Date(despesa.data) : new Date();
          return {
            ...despesa,
            mes: String(data.getMonth() + 1).padStart(2, '0'),
            ano: String(data.getFullYear()),
            status: despesa.status || 'pendente'
          };
        });

        setReceitasOriginais(receitasProcessadas);
        setDespesasOriginais(despesasProcessadas);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [clinicaId]);

  // Função para filtrar dados
  const filtrarDados = useMemo(() => {
    let receitasFiltradas = [...receitasOriginais];
    let despesasFiltradas = [...despesasOriginais];

    // CORREÇÃO: Aplicar filtro de período APENAS se mês e ano não estiverem especificados
    const temMesEspecifico = filtros.mes && filtros.mes !== '';
    const temAnoEspecifico = filtros.ano && filtros.ano !== '';

    // Se tem mês e ano específicos, usar eles ao invés do período
    if (temMesEspecifico || temAnoEspecifico) {
      // Filtro por ano
      if (temAnoEspecifico) {
        receitasFiltradas = receitasFiltradas.filter(item => item.ano === filtros.ano);
        despesasFiltradas = despesasFiltradas.filter(item => item.ano === filtros.ano);
      }

      // Filtro por mês
      if (temMesEspecifico) {
        receitasFiltradas = receitasFiltradas.filter(item => item.mes === filtros.mes);
        despesasFiltradas = despesasFiltradas.filter(item => item.mes === filtros.mes);
      }
    } else {
      // Aplicar filtro de período apenas se não houver mês/ano específico
      if (filtros.periodo) {
        const hoje = new Date();
        const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
        const anoAtual = String(hoje.getFullYear());

        switch (filtros.periodo) {
          case 'mes_atual':
            receitasFiltradas = receitasFiltradas.filter(item => 
              item.mes === mesAtual && item.ano === anoAtual
            );
            despesasFiltradas = despesasFiltradas.filter(item => 
              item.mes === mesAtual && item.ano === anoAtual
            );
            break;
          case 'mes_anterior':
            let mesAnterior = hoje.getMonth(); // 0-11
            let anoAnterior = anoAtual;
            if (mesAnterior === 0) {
              mesAnterior = 12;
              anoAnterior = String(parseInt(anoAtual) - 1);
            }
            const mesAnteriorStr = String(mesAnterior).padStart(2, '0');
            receitasFiltradas = receitasFiltradas.filter(item => 
              item.mes === mesAnteriorStr && item.ano === anoAnterior
            );
            despesasFiltradas = despesasFiltradas.filter(item => 
              item.mes === mesAnteriorStr && item.ano === anoAnterior
            );
            break;
          case 'ano_atual':
            receitasFiltradas = receitasFiltradas.filter(item => item.ano === anoAtual);
            despesasFiltradas = despesasFiltradas.filter(item => item.ano === anoAtual);
            break;
          case 'trimestre_atual':
            const trimestreAtual = Math.floor((hoje.getMonth()) / 3);
            const mesesTrimestre = [
              ['01', '02', '03'],
              ['04', '05', '06'],
              ['07', '08', '09'],
              ['10', '11', '12']
            ][trimestreAtual];
            receitasFiltradas = receitasFiltradas.filter(item => 
              mesesTrimestre.includes(item.mes) && item.ano === anoAtual
            );
            despesasFiltradas = despesasFiltradas.filter(item => 
              mesesTrimestre.includes(item.mes) && item.ano === anoAtual
            );
            break;
        }
      }
    }

    // Filtro por período customizado (tem prioridade sobre tudo)
    if (filtros.dataInicio && filtros.dataFim) {
      const dataInicio = new Date(filtros.dataInicio);
      const dataFim = new Date(filtros.dataFim);
      
      receitasFiltradas = receitasFiltradas.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem >= dataInicio && dataItem <= dataFim;
      });
      
      despesasFiltradas = despesasFiltradas.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem >= dataInicio && dataItem <= dataFim;
      });
    }

    // Filtro por categoria de receita
    if (filtros.categoriaReceita) {
      receitasFiltradas = receitasFiltradas.filter(item => 
        item.categoria === filtros.categoriaReceita
      );
    }

    // Filtro por categoria de despesa
    if (filtros.categoriaDespesa) {
      despesasFiltradas = despesasFiltradas.filter(item => 
        item.categoria === filtros.categoriaDespesa
      );
    }

    // Filtro por status
    if (filtros.status) {
      receitasFiltradas = receitasFiltradas.filter(item => item.status === filtros.status);
      despesasFiltradas = despesasFiltradas.filter(item => item.status === filtros.status);
    }

    // Filtro por tipo
    if (filtros.tipo === 'receitas') {
      despesasFiltradas = [];
    } else if (filtros.tipo === 'despesas') {
      receitasFiltradas = [];
    }

    return { receitas: receitasFiltradas, despesas: despesasFiltradas };
  }, [filtros, receitasOriginais, despesasOriginais]);

  // Calcular totais
  const totais = useMemo(() => {
    const totalReceitas = filtrarDados.receitas.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
    const totalDespesas = filtrarDados.despesas.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
    const lucro = totalReceitas - totalDespesas;

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      lucro: lucro,
      margem: totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0,
      quantidadeReceitas: filtrarDados.receitas.length,
      quantidadeDespesas: filtrarDados.despesas.length
    };
  }, [filtrarDados]);

  // Calcular totais por categoria
  const totaisPorCategoria = useMemo(() => {
    const receitasPorCategoria = {};
    const despesasPorCategoria = {};

    filtrarDados.receitas.forEach(item => {
      const categoria = item.categoria || 'sem_categoria';
      if (!receitasPorCategoria[categoria]) {
        receitasPorCategoria[categoria] = 0;
      }
      receitasPorCategoria[categoria] += parseFloat(item.valor) || 0;
    });

    filtrarDados.despesas.forEach(item => {
      const categoria = item.categoria || 'sem_categoria';
      if (!despesasPorCategoria[categoria]) {
        despesasPorCategoria[categoria] = 0;
      }
      despesasPorCategoria[categoria] += parseFloat(item.valor) || 0;
    });

    return { receitas: receitasPorCategoria, despesas: despesasPorCategoria };
  }, [filtrarDados]);

  // Calcular totais por status
  const totaisPorStatus = useMemo(() => {
    const receitasPorStatus = {
      pago: 0,
      pendente: 0,
      atrasado: 0
    };
    const despesasPorStatus = {
      pago: 0,
      pendente: 0,
      atrasado: 0
    };

    filtrarDados.receitas.forEach(item => {
      const status = item.status || 'pendente';
      if (receitasPorStatus[status] !== undefined) {
        receitasPorStatus[status] += parseFloat(item.valor) || 0;
      }
    });

    filtrarDados.despesas.forEach(item => {
      const status = item.status || 'pendente';
      if (despesasPorStatus[status] !== undefined) {
        despesasPorStatus[status] += parseFloat(item.valor) || 0;
      }
    });

    return { receitas: receitasPorStatus, despesas: despesasPorStatus };
  }, [filtrarDados]);

  return {
    receitas: filtrarDados.receitas,
    despesas: filtrarDados.despesas,
    totais,
    totaisPorCategoria,
    totaisPorStatus,
    loading,
    error
  };
};
