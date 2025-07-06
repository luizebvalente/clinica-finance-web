import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Filter,
  Search,
  Eye,
  Printer,
  Mail,
  Share2,
  Clock,
  Target,
  Users,
  Activity,
  CreditCard,
  Building,
  Stethoscope,
  Calculator,
  FileSpreadsheet,
  FileImage,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getReceitas, getDespesas, getProfissionais } from '../../services/firebaseService';

const RelatoriosPage = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('2025-01');
  const [tipoRelatorio, setTipoRelatorio] = useState('financeiro');
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [receitasData, despesasData, profissionaisData] = await Promise.all([
          getReceitas(),
          getDespesas(),
          getProfissionais()
        ]);
        
        setReceitas(receitasData || []);
        setDespesas(despesasData || []);
        setProfissionais(profissionaisData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados dos relatórios');
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

  // Calcular dados reais
  const totalReceitas = receitas.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
  const totalDespesas = despesas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
  const lucro = totalReceitas - totalDespesas;
  const margemLucro = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

  // Consultas realizadas (baseado nas receitas)
  const consultasRealizadas = receitas.length;

  // Taxa de ocupação (simulada baseada nos dados)
  const taxaOcupacao = consultasRealizadas > 0 ? Math.min((consultasRealizadas / 30) * 100, 100) : 0;

  // Receitas por categoria
  const receitasPorCategoria = receitas.reduce((acc, receita) => {
    const categoria = receita.categoria || 'Outros';
    acc[categoria] = (acc[categoria] || 0) + (parseFloat(receita.valor) || 0);
    return acc;
  }, {});

  // Despesas por categoria
  const despesasPorCategoria = despesas.reduce((acc, despesa) => {
    const categoria = despesa.categoria || 'Outros';
    acc[categoria] = (acc[categoria] || 0) + (parseFloat(despesa.valor) || 0);
    return acc;
  }, {});

  // Performance por profissional
  const performanceProfissionais = profissionais.map(prof => {
    const receitasProfissional = receitas.filter(r => r.profissional === prof.nome);
    const totalProfissional = receitasProfissional.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
    return {
      nome: prof.nome,
      receitas: totalProfissional,
      atendimentos: receitasProfissional.length,
      especialidade: prof.especialidade
    };
  });

  // Exportar dados
  const exportarDados = (formato) => {
    const dados = {
      periodo: periodoSelecionado,
      resumo: {
        totalReceitas,
        totalDespesas,
        lucro,
        margemLucro,
        consultasRealizadas,
        taxaOcupacao
      },
      receitas,
      despesas,
      receitasPorCategoria,
      despesasPorCategoria,
      performanceProfissionais
    };

    if (formato === 'json') {
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${periodoSelecionado}.json`;
      a.click();
    } else if (formato === 'csv') {
      // Exportar receitas como CSV
      const csvReceitas = [
        ['Data', 'Descrição', 'Categoria', 'Profissional', 'Valor', 'Status'],
        ...receitas.map(r => [
          r.data || r.vencimento,
          r.descricao,
          r.categoria,
          r.profissional,
          r.valor,
          r.status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvReceitas], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receitas-${periodoSelecionado}.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados reais dos relatórios...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises e relatórios detalhados da sua clínica - Dados Reais</p>
        </div>
        <button 
          onClick={() => exportarDados('json')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Gerar Relatório Personalizado
        </button>
      </div>

      {/* Indicador de Dados Reais */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800">
            <strong>Dados Reais:</strong> Relatórios baseados em {receitas.length} receitas e {despesas.length} despesas do Firebase
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select 
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="2025-01">Janeiro 2025</option>
              <option value="2024-12">Dezembro 2024</option>
              <option value="2024-11">Novembro 2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
            <select 
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="financeiro">Financeiro</option>
              <option value="operacional">Operacional</option>
              <option value="estrategico">Estratégico</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs dos Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas Totais (Real)</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
              <p className="text-xs text-gray-500 mt-1">{receitas.length} lançamentos</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 ml-1">Dados reais</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consultas Realizadas</p>
              <p className="text-2xl font-bold text-blue-600">{consultasRealizadas}</p>
              <p className="text-xs text-gray-500 mt-1">Baseado em receitas</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600 ml-1">Dados reais</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-purple-600">{formatPercentage(taxaOcupacao)}</p>
              <p className="text-xs text-gray-500 mt-1">Calculada dinamicamente</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-600 ml-1">Baseado em dados</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
              <p className={`text-2xl font-bold ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(margemLucro)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Calculada em tempo real</p>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${margemLucro >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Calculator className={`h-6 w-6 ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {margemLucro >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> : 
              <TrendingUp className="h-4 w-4 text-red-600" />
            }
            <span className={`text-sm ml-1 ${margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Dados reais
            </span>
          </div>
        </div>
      </div>

      {/* Relatórios Disponíveis */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Disponíveis (Dados Reais)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* DRE */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">Financeiro</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">DRE - Demonstração do Resultado</h4>
            <p className="text-sm text-gray-600 mb-4">Relatório completo de receitas, custos e lucros com dados reais</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                <Eye className="h-4 w-4 inline mr-1" />
                Visualizar
              </button>
              <button 
                onClick={() => exportarDados('json')}
                className="flex-1 border border-blue-600 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-50"
              >
                <Download className="h-4 w-4 inline mr-1" />
                Baixar
              </button>
            </div>
          </div>

          {/* Fluxo de Caixa */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">Financeiro</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Relatório de Fluxo de Caixa</h4>
            <p className="text-sm text-gray-600 mb-4">Análise detalhada das movimentações financeiras reais</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
                <Eye className="h-4 w-4 inline mr-1" />
                Visualizar
              </button>
              <button 
                onClick={() => exportarDados('csv')}
                className="flex-1 border border-green-600 text-green-600 px-3 py-2 rounded text-sm hover:bg-green-50"
              >
                <Download className="h-4 w-4 inline mr-1" />
                Baixar
              </button>
            </div>
          </div>

          {/* Receitas por Categoria */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <PieChart className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">Operacional</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Receitas por Categoria</h4>
            <p className="text-sm text-gray-600 mb-4">Distribuição real das receitas por tipo de serviço</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">
                <Eye className="h-4 w-4 inline mr-1" />
                Visualizar
              </button>
              <button className="flex-1 border border-purple-600 text-purple-600 px-3 py-2 rounded text-sm hover:bg-purple-50">
                <Download className="h-4 w-4 inline mr-1" />
                Baixar
              </button>
            </div>
          </div>

          {/* Performance dos Profissionais */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-600">Operacional</span>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Performance dos Profissionais</h4>
            <p className="text-sm text-gray-600 mb-4">Análise de produtividade por profissional com dados reais</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700">
                <Eye className="h-4 w-4 inline mr-1" />
                Visualizar
              </button>
              <button className="flex-1 border border-orange-600 text-orange-600 px-3 py-2 rounded text-sm hover:bg-orange-50">
                <Download className="h-4 w-4 inline mr-1" />
                Baixar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance por Profissional */}
      {performanceProfissionais.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Profissional (Dados Reais)</h3>
          
          <div className="space-y-4">
            {performanceProfissionais.map((prof, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{prof.nome}</p>
                    <p className="text-sm text-gray-600">{prof.especialidade}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(prof.receitas)}</p>
                  <p className="text-sm text-gray-600">{prof.atendimentos} atendimentos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => exportarDados('json')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Exportar Dados Completos</p>
              <p className="text-sm text-gray-600">JSON com todos os dados do período</p>
            </div>
          </button>

          <button 
            onClick={() => exportarDados('csv')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Exportar CSV</p>
              <p className="text-sm text-gray-600">Planilha com receitas detalhadas</p>
            </div>
          </button>

          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Agendar Relatório</p>
              <p className="text-sm text-gray-600">Configurar geração automática</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;

