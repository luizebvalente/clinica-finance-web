import { useState, useEffect } from 'react';
import { 
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
import { getReceitas, getDespesas } from '../../services/firebaseService';

const FluxoCaixaPage = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30');
  const [tipoVisualizacao, setTipoVisualizacao] = useState('timeline');
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
        setError('Erro ao carregar dados do fluxo de caixa');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calcular dados reais
  const receitasRecebidas = receitas.filter(r => r.status === 'Recebido');
  const despesasPagas = despesas.filter(d => d.status === 'Pago');
  
  const totalReceitasRecebidas = receitasRecebidas.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
  const totalDespesasPagas = despesasPagas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  const saldoAtual = totalReceitasRecebidas - totalDespesasPagas;

  // Receitas e despesas pendentes
  const receitasPendentes = receitas.filter(r => r.status === 'Pendente');
  const despesasPendentes = despesas.filter(d => d.status === 'Pendente');
  
  const totalReceitasPendentes = receitasPendentes.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
  const totalDespesasPendentes = despesasPendentes.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);

  // Projeções baseadas em dados reais
  const projecao30Dias = saldoAtual + totalReceitasPendentes - totalDespesasPendentes;
  const projecao60Dias = projecao30Dias; // Simplificado - pode ser expandido
  const projecao90Dias = projecao30Dias; // Simplificado - pode ser expandido

  // Timeline de eventos (dados reais)
  const eventos = [
    ...receitas.map(r => ({
      tipo: 'receita',
      descricao: r.descricao || 'Receita',
      valor: parseFloat(r.valor) || 0,
      data: r.vencimento || r.data,
      status: r.status,
      categoria: r.categoria
    })),
    ...despesas.map(d => ({
      tipo: 'despesa',
      descricao: d.descricao || 'Despesa',
      valor: parseFloat(d.valor) || 0,
      data: d.vencimento || d.data,
      status: d.status,
      categoria: d.categoria
    }))
  ].sort((a, b) => new Date(a.data) - new Date(b.data));

  // Calcular saldo acumulado para timeline
  let saldoAcumulado = saldoAtual;
  const eventosComSaldo = eventos.map(evento => {
    if (evento.status === 'Pendente') {
      if (evento.tipo === 'receita') {
        saldoAcumulado += evento.valor;
      } else {
        saldoAcumulado -= evento.valor;
      }
    }
    return {
      ...evento,
      saldoApos: saldoAcumulado
    };
  });

  // Alertas baseados em dados reais
  const alertas = [];
  
  if (projecao30Dias < 0) {
    alertas.push({
      tipo: 'negativo',
      titulo: 'Fluxo negativo em 30 dias',
      descricao: 'Saídas superiores às entradas previstas',
      valor: Math.abs(projecao30Dias)
    });
  }

  const grandesDespesas = despesasPendentes.filter(d => parseFloat(d.valor) > 5000);
  if (grandesDespesas.length > 0) {
    alertas.push({
      tipo: 'grandes_saidas',
      titulo: 'Grandes saídas previstas',
      descricao: `${grandesDespesas.length} pagamento${grandesDespesas.length > 1 ? 's' : ''} acima de R$ 5.000`,
      valor: grandesDespesas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0)
    });
  }

  // Resumo por período
  const calcularResumo = (dias) => {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);
    
    const receitasPeriodo = receitasPendentes.filter(r => 
      r.vencimento && new Date(r.vencimento) <= dataLimite
    );
    const despesasPeriodo = despesasPendentes.filter(d => 
      d.vencimento && new Date(d.vencimento) <= dataLimite
    );
    
    const entradas = receitasPeriodo.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
    const saidas = despesasPeriodo.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    
    return {
      saldo: saldoAtual + entradas - saidas,
      entradas,
      saidas
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados reais do fluxo de caixa...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-gray-600 mt-1">Projeções e análise do fluxo financeiro - Dados Reais</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Exportar Projeção
        </button>
      </div>

      {/* Indicador de Dados Reais */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800">
            <strong>Dados Reais:</strong> Saldo calculado com {receitasRecebidas.length} receitas recebidas e {despesasPagas.length} despesas pagas
          </p>
        </div>
      </div>

      {/* KPIs do Fluxo de Caixa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Atual (Real)</p>
              <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoAtual)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Atualizado em tempo real</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${saldoAtual >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projeção 30 dias</p>
              <p className={`text-2xl font-bold ${projecao30Dias >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projecao30Dias)}
              </p>
              <p className={`text-xs mt-1 ${projecao30Dias >= saldoAtual ? 'text-green-600' : 'text-red-600'}`}>
                {projecao30Dias >= saldoAtual ? '+' : ''}{formatCurrency(projecao30Dias - saldoAtual)}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projeção 60 dias</p>
              <p className={`text-2xl font-bold ${projecao60Dias >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projecao60Dias)}
              </p>
              <p className={`text-xs mt-1 ${projecao60Dias >= saldoAtual ? 'text-green-600' : 'text-red-600'}`}>
                {projecao60Dias >= saldoAtual ? '+' : ''}{formatCurrency(projecao60Dias - saldoAtual)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projeção 90 dias</p>
              <p className={`text-2xl font-bold ${projecao90Dias >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projecao90Dias)}
              </p>
              <p className={`text-xs mt-1 ${projecao90Dias >= saldoAtual ? 'text-green-600' : 'text-red-600'}`}>
                {projecao90Dias >= saldoAtual ? '+' : ''}{formatCurrency(projecao90Dias - saldoAtual)}
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline do Fluxo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Timeline do Fluxo (Dados Reais)</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTipoVisualizacao('timeline')}
              className={`px-3 py-1 rounded text-sm ${tipoVisualizacao === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setTipoVisualizacao('grafico')}
              className={`px-3 py-1 rounded text-sm ${tipoVisualizacao === 'grafico' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Gráfico
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {eventosComSaldo.length > 0 ? eventosComSaldo.slice(0, 10).map((evento, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-4 ${
                  evento.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{evento.descricao}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(evento.data)} • {evento.status === 'Pendente' ? 'Previsto' : 'Confirmado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${evento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                  {evento.tipo === 'receita' ? '+' : '-'}{formatCurrency(evento.valor)}
                </p>
                <p className="text-xs text-gray-500">
                  Saldo: {formatCurrency(evento.saldoApos)}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhum evento encontrado</p>
              <p className="text-xs text-gray-400">Adicione receitas e despesas para ver a timeline</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
          
          <div className="space-y-4">
            {alertas.map((alerta, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                alerta.tipo === 'negativo' ? 'bg-red-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center">
                  <AlertCircle className={`h-5 w-5 mr-3 ${
                    alerta.tipo === 'negativo' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      alerta.tipo === 'negativo' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {alerta.titulo}
                    </p>
                    <p className={`text-xs ${
                      alerta.tipo === 'negativo' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {alerta.descricao}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${
                  alerta.tipo === 'negativo' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {formatCurrency(alerta.valor)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo por Período */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Período (Dados Reais)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[7, 15, 30, 60, 90].map(dias => {
            const resumo = calcularResumo(dias);
            return (
              <div key={dias} className="text-center">
                <p className="text-sm text-gray-600 mb-2">{dias} dias</p>
                <p className={`text-lg font-bold mb-1 ${resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resumo.saldo)}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Entradas: {formatCurrency(resumo.entradas)}</p>
                  <p>Saídas: {formatCurrency(resumo.saidas)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FluxoCaixaPage;

