import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calculator,
  Zap
} from 'lucide-react';

const FluxoCaixaPage = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30');
  const [tipoVisualizacao, setTipoVisualizacao] = useState('timeline');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados mock para demonstração do fluxo de caixa
  const dadosFluxoCaixa = {
    saldoAtual: 15420.50,
    projecao30dias: 8950.30,
    projecao60dias: 12340.80,
    projecao90dias: 18750.20,
    entradas: [
      { data: '2025-01-15', descricao: 'Recebimento Consultas', valor: 2400.00, categoria: 'receita', confirmado: true },
      { data: '2025-01-20', descricao: 'Convênio Unimed', valor: 3200.00, categoria: 'receita', confirmado: false },
      { data: '2025-01-25', descricao: 'Procedimentos Particulares', valor: 1800.00, categoria: 'receita', confirmado: false },
      { data: '2025-02-05', descricao: 'Recebimento Mensal', valor: 4500.00, categoria: 'receita', confirmado: false },
      { data: '2025-02-15', descricao: 'Convênios Diversos', valor: 2800.00, categoria: 'receita', confirmado: false }
    ],
    saidas: [
      { data: '2025-01-15', descricao: 'Aluguel Clínica', valor: 3500.00, categoria: 'despesa', confirmado: true },
      { data: '2025-01-20', descricao: 'Salários', valor: 8500.00, categoria: 'despesa', confirmado: true },
      { data: '2025-01-25', descricao: 'Fornecedores', valor: 1200.00, categoria: 'despesa', confirmado: false },
      { data: '2025-02-01', descricao: 'Impostos', valor: 2100.00, categoria: 'despesa', confirmado: false },
      { data: '2025-02-15', descricao: 'Utilidades', valor: 850.00, categoria: 'despesa', confirmado: false }
    ]
  };

  const calcularFluxoPorPeriodo = () => {
    const hoje = new Date();
    const periodos = {
      7: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000),
      15: new Date(hoje.getTime() + 15 * 24 * 60 * 60 * 1000),
      30: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000),
      60: new Date(hoje.getTime() + 60 * 24 * 60 * 60 * 1000),
      90: new Date(hoje.getTime() + 90 * 24 * 60 * 60 * 1000)
    };

    const resultado = {};
    
    Object.entries(periodos).forEach(([dias, dataLimite]) => {
      const entradas = dadosFluxoCaixa.entradas
        .filter(e => new Date(e.data) <= dataLimite)
        .reduce((sum, e) => sum + e.valor, 0);
      
      const saidas = dadosFluxoCaixa.saidas
        .filter(s => new Date(s.data) <= dataLimite)
        .reduce((sum, s) => sum + s.valor, 0);
      
      resultado[dias] = {
        entradas,
        saidas,
        saldo: dadosFluxoCaixa.saldoAtual + entradas - saidas,
        variacao: entradas - saidas
      };
    });

    return resultado;
  };

  const getTimelineData = () => {
    const todas = [
      ...dadosFluxoCaixa.entradas.map(e => ({ ...e, tipo: 'entrada' })),
      ...dadosFluxoCaixa.saidas.map(s => ({ ...s, tipo: 'saida' }))
    ].sort((a, b) => new Date(a.data) - new Date(b.data));

    let saldoAcumulado = dadosFluxoCaixa.saldoAtual;
    
    return todas.map(item => {
      if (item.tipo === 'entrada') {
        saldoAcumulado += item.valor;
      } else {
        saldoAcumulado -= item.valor;
      }
      
      return {
        ...item,
        saldoAcumulado
      };
    });
  };

  const getAlertas = () => {
    const alertas = [];
    const fluxoPorPeriodo = calcularFluxoPorPeriodo();
    
    // Verificar saldo baixo
    if (dadosFluxoCaixa.saldoAtual < 10000) {
      alertas.push({
        tipo: 'aviso',
        titulo: 'Saldo baixo',
        descricao: 'Saldo atual abaixo do recomendado',
        valor: dadosFluxoCaixa.saldoAtual
      });
    }

    // Verificar fluxo negativo
    if (fluxoPorPeriodo['30'].variacao < 0) {
      alertas.push({
        tipo: 'erro',
        titulo: 'Fluxo negativo em 30 dias',
        descricao: 'Saídas superiores às entradas previstas',
        valor: fluxoPorPeriodo['30'].variacao
      });
    }

    // Verificar grandes saídas
    const grandesSaidas = dadosFluxoCaixa.saidas.filter(s => s.valor > 5000);
    if (grandesSaidas.length > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Grandes saídas previstas',
        descricao: `${grandesSaidas.length} pagamento${grandesSaidas.length > 1 ? 's' : ''} acima de R$ 5.000`,
        valor: grandesSaidas.reduce((sum, s) => sum + s.valor, 0)
      });
    }

    return alertas;
  };

  const fluxoPorPeriodo = calcularFluxoPorPeriodo();
  const timelineData = getTimelineData();
  const alertas = getAlertas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-gray-600">Projeções e análise do fluxo financeiro</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={periodoSelecionado} 
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Próximos 7 dias</option>
            <option value="15">Próximos 15 dias</option>
            <option value="30">Próximos 30 dias</option>
            <option value="60">Próximos 60 dias</option>
            <option value="90">Próximos 90 dias</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Exportar Projeção
          </button>
        </div>
      </div>

      {/* Saldo Atual e Projeções */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(dadosFluxoCaixa.saldoAtual)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Atualizado hoje</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projeção 30 dias</p>
              <p className={`text-2xl font-bold ${fluxoPorPeriodo['30'].saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(fluxoPorPeriodo['30'].saldo)}
              </p>
              <div className="flex items-center mt-1">
                {fluxoPorPeriodo['30'].variacao >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${fluxoPorPeriodo['30'].variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(fluxoPorPeriodo['30'].variacao))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projeção 60 dias</p>
              <p className={`text-2xl font-bold ${fluxoPorPeriodo['60'].saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(fluxoPorPeriodo['60'].saldo)}
              </p>
              <div className="flex items-center mt-1">
                {fluxoPorPeriodo['60'].variacao >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${fluxoPorPeriodo['60'].variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(fluxoPorPeriodo['60'].variacao))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projeção 90 dias</p>
              <p className={`text-2xl font-bold ${fluxoPorPeriodo['90'].saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(fluxoPorPeriodo['90'].saldo)}
              </p>
              <div className="flex items-center mt-1">
                {fluxoPorPeriodo['90'].variacao >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${fluxoPorPeriodo['90'].variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(fluxoPorPeriodo['90'].variacao))}
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline do Fluxo */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Timeline do Fluxo</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setTipoVisualizacao('timeline')}
                className={`px-3 py-1 rounded text-sm ${tipoVisualizacao === 'timeline' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              >
                Timeline
              </button>
              <button 
                onClick={() => setTipoVisualizacao('grafico')}
                className={`px-3 py-1 rounded text-sm ${tipoVisualizacao === 'grafico' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              >
                Gráfico
              </button>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {timelineData.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    item.tipo === 'entrada' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {item.tipo === 'entrada' ? (
                      <ArrowUpRight className={`w-4 h-4 ${item.confirmado ? 'text-green-600' : 'text-green-400'}`} />
                    ) : (
                      <ArrowDownRight className={`w-4 h-4 ${item.confirmado ? 'text-red-600' : 'text-red-400'}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.descricao}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(item.data)} • {item.confirmado ? 'Confirmado' : 'Previsto'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.tipo === 'entrada' ? '+' : '-'}{formatCurrency(item.valor)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Saldo: {formatCurrency(item.saldoAcumulado)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas e Análises */}
        <div className="space-y-6">
          {/* Alertas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas</h3>
            <div className="space-y-3">
              {alertas.map((alerta, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    alerta.tipo === 'erro' ? 'bg-red-50' : 
                    alerta.tipo === 'aviso' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}>
                    {alerta.tipo === 'erro' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : alerta.tipo === 'aviso' ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alerta.titulo}</p>
                    <p className="text-sm text-gray-600">{alerta.descricao}</p>
                    {alerta.valor && (
                      <p className={`text-sm font-medium ${
                        alerta.tipo === 'erro' ? 'text-red-600' : 
                        alerta.tipo === 'aviso' ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {formatCurrency(Math.abs(alerta.valor))}
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
                  <p className="text-sm text-gray-600">Fluxo de caixa saudável</p>
                </div>
              )}
            </div>
          </div>

          {/* Simulador Rápido */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Simulador Rápido</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Calculator className="w-4 h-4 mr-2" />
                Simular Cenário
              </button>
              <button className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Zap className="w-4 h-4 mr-2" />
                Stress Test
              </button>
              <button className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-4 h-4 mr-2" />
                Análise Detalhada
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo por Período */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo por Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(fluxoPorPeriodo).map(([dias, dados]) => (
            <div key={dias} className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-600">{dias} dias</p>
              <p className={`text-lg font-bold ${dados.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dados.saldo)}
              </p>
              <p className="text-xs text-gray-500">
                Entradas: {formatCurrency(dados.entradas)}
              </p>
              <p className="text-xs text-gray-500">
                Saídas: {formatCurrency(dados.saidas)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FluxoCaixaPage;

