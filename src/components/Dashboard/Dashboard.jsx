import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import { getReceitas, getDespesas } from '../../services/firebaseService';

const Dashboard = () => {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [receitasData, despesasData] = await Promise.all([
          getReceitas(),
          getDespesas()
        ]);
        
        setReceitas(receitasData || []);
        setDespesas(despesasData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  // Calcular dados reais do Firebase
  const totalReceitas = receitas.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
  const totalDespesas = despesas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  const lucro = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

  // Receitas por categoria (dados reais)
  const receitasPorCategoria = receitas.reduce((acc, receita) => {
    const categoria = receita.categoria || 'Outros';
    acc[categoria] = (acc[categoria] || 0) + (parseFloat(receita.valor) || 0);
    return acc;
  }, {});

  // Despesas por categoria (dados reais)
  const despesasPorCategoria = despesas.reduce((acc, despesa) => {
    const categoria = despesa.categoria || 'Outros';
    acc[categoria] = (acc[categoria] || 0) + (parseFloat(despesa.valor) || 0);
    return acc;
  }, {});

  // Contas em atraso (dados reais)
  const hoje = new Date();
  const contasAtrasadas = despesas.filter(despesa => {
    if (!despesa.vencimento || despesa.status === 'Pago') return false;
    return new Date(despesa.vencimento) < hoje;
  });

  // Receitas pendentes (dados reais)
  const receitasPendentes = receitas.filter(receita => receita.status === 'Pendente');

  // Próximos vencimentos (dados reais)
  const proximosDias = 7;
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + proximosDias);
  
  const proximosVencimentos = despesas.filter(despesa => {
    if (!despesa.vencimento || despesa.status === 'Pago') return false;
    const vencimento = new Date(despesa.vencimento);
    return vencimento >= hoje && vencimento <= dataLimite;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados reais do Firebase...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral da sua clínica - Dados Reais do Firebase</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Gerar Relatório
        </button>
      </div>

      {/* Indicador de Dados Reais */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800">
            <strong>Dados Reais:</strong> {receitas.length} receitas e {despesas.length} despesas carregadas do Firebase
          </p>
        </div>
      </div>

      {/* KPIs - Dados Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita do Mês (Real)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceitas)}</p>
              <p className="text-xs text-gray-500 mt-1">{receitas.length} receitas</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">Dados reais</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesa do Mês (Real)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDespesas)}</p>
              <p className="text-xs text-gray-500 mt-1">{despesas.length} despesas</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600 ml-1">Dados reais</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro do Mês (Real)</p>
              <p className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(lucro)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Calculado em tempo real</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${lucro >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {lucro >= 0 ? 
                <TrendingUp className="h-6 w-6 text-green-600" /> : 
                <TrendingDown className="h-6 w-6 text-red-600" />
              }
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {lucro >= 0 ? 
              <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            }
            <span className={`text-sm ml-1 ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(margemLucro)}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fluxo de Caixa (Real)</p>
              <p className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(lucro)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Baseado em dados reais</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">Sincronizado</span>
          </div>
        </div>
      </div>

      {/* Gráficos - Dados Reais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas por Categoria - Dados Reais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Receitas por Categoria</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Distribuição real das receitas por tipo de serviço</p>
          
          <div className="space-y-3">
            {Object.entries(receitasPorCategoria).length > 0 ? Object.entries(receitasPorCategoria)
              .sort(([,a], [,b]) => b - a)
              .map(([categoria, valor], index) => (
              <div key={categoria} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{categoria}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(valor)}</p>
                  <p className="text-xs text-gray-500">{formatPercentage((valor / totalReceitas) * 100)}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma receita encontrada</p>
                <p className="text-xs text-gray-400">Adicione receitas para ver a distribuição</p>
              </div>
            )}
          </div>
        </div>

        {/* Despesas por Categoria - Dados Reais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Despesas por Categoria</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Distribuição real dos gastos por categoria</p>
          
          <div className="space-y-3">
            {Object.entries(despesasPorCategoria).length > 0 ? Object.entries(despesasPorCategoria)
              .sort(([,a], [,b]) => b - a)
              .map(([categoria, valor], index) => (
              <div key={categoria} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-orange-500' : 
                    index === 2 ? 'bg-pink-500' : 'bg-indigo-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{categoria}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(valor)}</p>
                  <p className="text-xs text-gray-500">{formatPercentage((valor / totalDespesas) * 100)}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma despesa encontrada</p>
                <p className="text-xs text-gray-400">Adicione despesas para ver a distribuição</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alertas e Pendências - Dados Reais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Pendências (Reais)</h3>
          
          <div className="space-y-4">
            {/* Contas em Atraso */}
            {contasAtrasadas.length > 0 ? (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {contasAtrasadas.length} conta{contasAtrasadas.length !== 1 ? 's' : ''} em atraso
                    </p>
                    <p className="text-xs text-red-600">Verificar pagamentos pendentes</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-red-800">
                  {formatCurrency(contasAtrasadas.reduce((sum, conta) => sum + (parseFloat(conta.valor) || 0), 0))}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Nenhuma conta em atraso</p>
                    <p className="text-xs text-green-600">Todas as contas estão em dia</p>
                  </div>
                </div>
              </div>
            )}

            {/* Receitas Pendentes */}
            {receitasPendentes.length > 0 ? (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Recebimentos pendentes</p>
                    <p className="text-xs text-yellow-600">
                      {receitasPendentes.length} receita{receitasPendentes.length !== 1 ? 's' : ''} aguardando
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-yellow-800">
                  {formatCurrency(receitasPendentes.reduce((sum, receita) => sum + (parseFloat(receita.valor) || 0), 0))}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Todas as receitas recebidas</p>
                    <p className="text-xs text-green-600">Nenhum recebimento pendente</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Próximos Vencimentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Vencimentos (7 dias)</h3>
          
          {proximosVencimentos.length > 0 ? (
            <div className="space-y-3">
              {proximosVencimentos.slice(0, 5).map((despesa, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">{despesa.descricao}</p>
                      <p className="text-xs text-blue-600">
                        Vence em {new Date(despesa.vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-blue-800">
                    {formatCurrency(parseFloat(despesa.valor) || 0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nenhum vencimento nos próximos 7 dias</p>
              <p className="text-xs text-gray-400">Sua agenda financeira está tranquila</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumo Financeiro - Dados Reais */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro do Período (Dados Reais)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total de Receitas</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
            <p className="text-xs text-gray-400">{receitas.length} lançamentos</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total de Despesas</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
            <p className="text-xs text-gray-400">{despesas.length} lançamentos</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
            <p className={`text-xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(lucro)}
            </p>
            <p className="text-xs text-gray-400">Calculado em tempo real</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Margem de Lucro</p>
            <p className={`text-xl font-bold ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(margemLucro)}
            </p>
            <p className="text-xs text-gray-400">Baseado em dados reais</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

