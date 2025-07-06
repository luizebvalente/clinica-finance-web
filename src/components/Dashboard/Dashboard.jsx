import { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados mock para demonstração
  const dadosMock = {
    receitas: [
      { id: '1', data: '2025-01-10', descricao: 'Consulta Cardiologia', categoria: 'consulta', profissional: 'Dr. João Silva', valor: 180.00, status: 'recebido' },
      { id: '2', data: '2025-01-10', descricao: 'Ecocardiograma', categoria: 'procedimento', profissional: 'Dr. João Silva', valor: 350.00, status: 'pendente' },
      { id: '3', data: '2025-01-09', descricao: 'Consulta Unimed', categoria: 'convenio', profissional: 'Dr. Maria Santos', valor: 120.00, status: 'atrasado' },
      { id: '4', data: '2025-01-09', descricao: 'Holter 24h', categoria: 'procedimento', profissional: 'Dr. João Silva', valor: 280.00, status: 'recebido' },
      { id: '5', data: '2025-01-08', descricao: 'Telemedicina', categoria: 'telemedicina', profissional: 'Dr. Maria Santos', valor: 80.00, status: 'recebido' }
    ],
    despesas: [
      { id: '1', vencimento: '2025-01-15', descricao: 'Aluguel Clínica', categoria: 'administrativa', tipo: 'fixa', valor: 3500.00, status: 'pendente', recorrente: true },
      { id: '2', vencimento: '2025-01-12', descricao: 'Material Cirúrgico', categoria: 'clinica', tipo: 'variavel', valor: 850.00, status: 'atrasado', recorrente: false },
      { id: '3', vencimento: '2025-01-20', descricao: 'Energia Elétrica', categoria: 'utilidades', tipo: 'fixa', valor: 450.00, status: 'pendente', recorrente: true },
      { id: '4', vencimento: '2025-01-10', descricao: 'Marketing Digital', categoria: 'marketing', tipo: 'variavel', valor: 600.00, status: 'pago', recorrente: false },
      { id: '5', vencimento: '2025-01-25', descricao: 'Internet/Telefone', categoria: 'utilidades', tipo: 'fixa', valor: 120.00, status: 'pendente', recorrente: true }
    ]
  };

  const calcularKPIs = () => {
    const totalReceitas = dadosMock.receitas.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = dadosMock.despesas.reduce((sum, d) => sum + d.valor, 0);
    const lucro = totalReceitas - totalDespesas;
    
    const receitasRecebidas = dadosMock.receitas
      .filter(r => r.status === 'recebido')
      .reduce((sum, r) => sum + r.valor, 0);
    
    const despesasPagas = dadosMock.despesas
      .filter(d => d.status === 'pago')
      .reduce((sum, d) => sum + d.valor, 0);
    
    const fluxoCaixa = receitasRecebidas - despesasPagas;

    return {
      receitas: { valor: totalReceitas, variacao: 12.5 },
      despesas: { valor: totalDespesas, variacao: 8.2 },
      lucro: { valor: lucro, variacao: lucro > 0 ? 18.9 : -5.2 },
      fluxoCaixa: { valor: fluxoCaixa, variacao: 5.1 }
    };
  };

  const getReceitasPorCategoria = () => {
    const categorias = {};
    dadosMock.receitas.forEach(receita => {
      if (!categorias[receita.categoria]) {
        categorias[receita.categoria] = 0;
      }
      categorias[receita.categoria] += receita.valor;
    });

    const totalReceitas = dadosMock.receitas.reduce((sum, r) => sum + r.valor, 0);
    return Object.entries(categorias).map(([categoria, valor]) => ({
      categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
      valor,
      percentual: ((valor / totalReceitas) * 100).toFixed(1)
    }));
  };

  const getDespesasPorCategoria = () => {
    const categorias = {};
    dadosMock.despesas.forEach(despesa => {
      if (!categorias[despesa.categoria]) {
        categorias[despesa.categoria] = 0;
      }
      categorias[despesa.categoria] += despesa.valor;
    });

    const totalDespesas = dadosMock.despesas.reduce((sum, d) => sum + d.valor, 0);
    return Object.entries(categorias).map(([categoria, valor]) => ({
      categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
      valor,
      percentual: ((valor / totalDespesas) * 100).toFixed(1)
    }));
  };

  const getProximosVencimentos = () => {
    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 7);

    return dadosMock.despesas
      .filter(d => {
        const vencimento = new Date(d.vencimento);
        return vencimento >= hoje && vencimento <= proximosDias && d.status !== 'pago';
      })
      .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))
      .slice(0, 5);
  };

  const getAlertas = () => {
    const alertas = [];
    
    // Contas em atraso
    const contasAtrasadas = dadosMock.despesas.filter(d => d.status === 'atrasado');
    if (contasAtrasadas.length > 0) {
      alertas.push({
        tipo: 'erro',
        titulo: `${contasAtrasadas.length} conta${contasAtrasadas.length > 1 ? 's' : ''} em atraso`,
        descricao: 'Verificar pagamentos pendentes',
        valor: contasAtrasadas.reduce((sum, d) => sum + d.valor, 0)
      });
    }

    // Receitas pendentes
    const receitasPendentes = dadosMock.receitas.filter(r => r.status === 'pendente' || r.status === 'atrasado');
    if (receitasPendentes.length > 0) {
      alertas.push({
        tipo: 'aviso',
        titulo: 'Recebimentos pendentes',
        descricao: `${receitasPendentes.length} receita${receitasPendentes.length > 1 ? 's' : ''} aguardando`,
        valor: receitasPendentes.reduce((sum, r) => sum + r.valor, 0)
      });
    }

    return alertas;
  };

  const kpis = calcularKPIs();
  const receitasPorCategoria = getReceitasPorCategoria();
  const despesasPorCategoria = getDespesasPorCategoria();
  const proximosVencimentos = getProximosVencimentos();
  const alertas = getAlertas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral da sua clínica</p>
        </div>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Janeiro 2025</option>
            <option>Dezembro 2024</option>
            <option>Novembro 2024</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita do Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(kpis.receitas.valor)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{kpis.receitas.variacao}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesa do Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(kpis.despesas.valor)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">+{kpis.despesas.variacao}%</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro do Mês</p>
              <p className={`text-2xl font-bold ${kpis.lucro.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(kpis.lucro.valor)}
              </p>
              <div className="flex items-center mt-2">
                {kpis.lucro.valor >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${kpis.lucro.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpis.lucro.valor >= 0 ? '+' : ''}{kpis.lucro.variacao}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fluxo de Caixa</p>
              <p className={`text-2xl font-bold ${kpis.fluxoCaixa.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(kpis.fluxoCaixa.valor)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{kpis.fluxoCaixa.variacao}%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas por Categoria */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Receitas por Categoria</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Distribuição das receitas por tipo de serviço</p>
          <div className="space-y-3">
            {receitasPorCategoria.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">{item.categoria}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(item.valor)}</p>
                  <p className="text-xs text-gray-500">{item.percentual}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Despesas por Categoria */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Despesas por Categoria</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Distribuição dos gastos por categoria</p>
          <div className="space-y-3">
            {despesasPorCategoria.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-orange-500' : 
                    index === 2 ? 'bg-pink-500' : 'bg-indigo-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">{item.categoria}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(item.valor)}</p>
                  <p className="text-xs text-gray-500">{item.percentual}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas e Próximos Vencimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas e Pendências */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas e Pendências</h3>
          <div className="space-y-4">
            {alertas.map((alerta, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  alerta.tipo === 'erro' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  {alerta.tipo === 'erro' ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alerta.titulo}</p>
                  <p className="text-sm text-gray-600">{alerta.descricao}</p>
                  {alerta.valor && (
                    <p className={`text-sm font-medium ${
                      alerta.tipo === 'erro' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {formatCurrency(alerta.valor)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {alertas.length === 0 && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Próximos Vencimentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Próximos Vencimentos</h3>
          <div className="space-y-4">
            {proximosVencimentos.map((despesa) => (
              <div key={despesa.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(despesa.vencimento).getDate()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(despesa.vencimento).toLocaleDateString('pt-BR', { month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{despesa.descricao}</p>
                    <p className="text-xs text-gray-500">{formatDate(despesa.vencimento)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(despesa.valor)}
                </p>
              </div>
            ))}
            {proximosVencimentos.length === 0 && (
              <p className="text-sm text-gray-500">Nenhum vencimento nos próximos 7 dias</p>
            )}
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Financeiro do Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total de Receitas</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(kpis.receitas.valor)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total de Despesas</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(kpis.despesas.valor)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Lucro Líquido</p>
            <p className={`text-xl font-bold ${kpis.lucro.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(kpis.lucro.valor)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Margem de Lucro</p>
            <p className={`text-xl font-bold ${kpis.lucro.valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.receitas.valor > 0 ? 
                ((kpis.lucro.valor / kpis.receitas.valor) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

