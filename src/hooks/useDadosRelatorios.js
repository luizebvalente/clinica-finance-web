import { useMemo } from 'react';

// Hook personalizado para gerenciar dados de relatórios com filtros
export const useDadosRelatorios = (filtros) => {
  // Dados mock completos
  const dadosMock = useMemo(() => ({
    receitas: [
      { id: 1, descricao: 'Consulta - João Silva', categoria: 'consultas', valor: 250.00, data: '2025-01-03', mes: '01', ano: '2025', status: 'pago' },
      { id: 2, descricao: 'Procedimento - Maria Santos', categoria: 'procedimentos', valor: 850.00, data: '2025-01-08', mes: '01', ano: '2025', status: 'pago' },
      { id: 3, descricao: 'Convênio - Unimed', categoria: 'convenios', valor: 3200.00, data: '2025-01-15', mes: '01', ano: '2025', status: 'pendente' },
      { id: 4, descricao: 'Telemedicina - Pedro Costa', categoria: 'telemedicina', valor: 180.00, data: '2025-01-12', mes: '01', ano: '2025', status: 'pendente' },
      { id: 5, descricao: 'Exames - Ana Lima', categoria: 'exames', valor: 420.00, data: '2025-01-05', mes: '01', ano: '2025', status: 'atrasado' },
      { id: 6, descricao: 'Consulta - Carlos Souza', categoria: 'consultas', valor: 250.00, data: '2024-12-20', mes: '12', ano: '2024', status: 'pago' },
      { id: 7, descricao: 'Procedimento - Juliana Lima', categoria: 'procedimentos', valor: 1200.00, data: '2024-12-15', mes: '12', ano: '2024', status: 'pago' },
      { id: 8, descricao: 'Consulta - Roberto Alves', categoria: 'consultas', valor: 250.00, data: '2024-11-10', mes: '11', ano: '2024', status: 'pago' },
      { id: 9, descricao: 'Telemedicina - Fernanda Costa', categoria: 'telemedicina', valor: 180.00, data: '2025-01-20', mes: '01', ano: '2025', status: 'pendente' },
      { id: 10, descricao: 'Procedimento - Marcos Silva', categoria: 'procedimentos', valor: 950.00, data: '2025-01-22', mes: '01', ano: '2025', status: 'pendente' }
    ],
    despesas: [
      { id: 1, descricao: 'Aluguel', categoria: 'administrativa', valor: 3500.00, data: '2025-01-05', mes: '01', ano: '2025', status: 'pago' },
      { id: 2, descricao: 'Energia Elétrica', categoria: 'utilidades', valor: 850.00, data: '2025-01-10', mes: '01', ano: '2025', status: 'pago' },
      { id: 3, descricao: 'Internet', categoria: 'administrativa', valor: 250.00, data: '2025-01-15', mes: '01', ano: '2025', status: 'pendente' },
      { id: 4, descricao: 'Material Médico', categoria: 'clinica', valor: 1200.00, data: '2025-01-20', mes: '01', ano: '2025', status: 'pendente' },
      { id: 5, descricao: 'Salários', categoria: 'pessoal', valor: 8500.00, data: '2025-01-05', mes: '01', ano: '2025', status: 'atrasado' },
      { id: 6, descricao: 'Marketing Digital', categoria: 'marketing', valor: 1450.00, data: '2025-01-25', mes: '01', ano: '2025', status: 'pendente' },
      { id: 7, descricao: 'Aluguel', categoria: 'administrativa', valor: 3500.00, data: '2024-12-05', mes: '12', ano: '2024', status: 'pago' },
      { id: 8, descricao: 'Energia Elétrica', categoria: 'utilidades', valor: 820.00, data: '2024-12-10', mes: '12', ano: '2024', status: 'pago' },
      { id: 9, descricao: 'Aluguel', categoria: 'administrativa', valor: 3500.00, data: '2024-11-05', mes: '11', ano: '2024', status: 'pago' },
      { id: 10, descricao: 'Equipamento Médico', categoria: 'equipamentos', valor: 2500.00, data: '2025-01-18', mes: '01', ano: '2025', status: 'pendente' }
    ]
  }), []);

  // Função para filtrar dados
  const filtrarDados = useMemo(() => {
    let receitasFiltradas = [...dadosMock.receitas];
    let despesasFiltradas = [...dadosMock.despesas];

    // Filtro por ano
    if (filtros.ano) {
      receitasFiltradas = receitasFiltradas.filter(item => item.ano === filtros.ano);
      despesasFiltradas = despesasFiltradas.filter(item => item.ano === filtros.ano);
    }

    // Filtro por mês
    if (filtros.mes) {
      receitasFiltradas = receitasFiltradas.filter(item => item.mes === filtros.mes);
      despesasFiltradas = despesasFiltradas.filter(item => item.mes === filtros.mes);
    }

    // Filtro por período
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
          const mesAnterior = String(hoje.getMonth()).padStart(2, '0');
          receitasFiltradas = receitasFiltradas.filter(item => 
            item.mes === mesAnterior && item.ano === anoAtual
          );
          despesasFiltradas = despesasFiltradas.filter(item => 
            item.mes === mesAnterior && item.ano === anoAtual
          );
          break;
        case 'ano_atual':
          receitasFiltradas = receitasFiltradas.filter(item => item.ano === anoAtual);
          despesasFiltradas = despesasFiltradas.filter(item => item.ano === anoAtual);
          break;
        // Para trimestre_atual e customizado, implementar lógica adicional se necessário
      }
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

    // Filtro por período customizado
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

    return { receitas: receitasFiltradas, despesas: despesasFiltradas };
  }, [filtros, dadosMock]);

  // Calcular totais
  const totais = useMemo(() => {
    const totalReceitas = filtrarDados.receitas.reduce((sum, item) => sum + item.valor, 0);
    const totalDespesas = filtrarDados.despesas.reduce((sum, item) => sum + item.valor, 0);
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
      if (!receitasPorCategoria[item.categoria]) {
        receitasPorCategoria[item.categoria] = 0;
      }
      receitasPorCategoria[item.categoria] += item.valor;
    });

    filtrarDados.despesas.forEach(item => {
      if (!despesasPorCategoria[item.categoria]) {
        despesasPorCategoria[item.categoria] = 0;
      }
      despesasPorCategoria[item.categoria] += item.valor;
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
      receitasPorStatus[item.status] += item.valor;
    });

    filtrarDados.despesas.forEach(item => {
      despesasPorStatus[item.status] += item.valor;
    });

    return { receitas: receitasPorStatus, despesas: despesasPorStatus };
  }, [filtrarDados]);

  return {
    receitas: filtrarDados.receitas,
    despesas: filtrarDados.despesas,
    totais,
    totaisPorCategoria,
    totaisPorStatus
  };
};
