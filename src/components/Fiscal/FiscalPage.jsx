import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Calculator,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  FileCheck,
  Archive,
  Printer,
  Mail,
  Settings,
  Info,
  Target,
  Zap
} from 'lucide-react';

const FiscalPage = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('2025-01');
  const [tipoRelatorio, setTipoRelatorio] = useState('dre');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados mock para demonstração fiscal
  const dadosFiscais = {
    impostos: {
      irpj: { valor: 1250.00, vencimento: '2025-01-31', status: 'pendente' },
      csll: { valor: 450.00, vencimento: '2025-01-31', status: 'pendente' },
      pis: { valor: 165.00, vencimento: '2025-01-25', status: 'pago' },
      cofins: { valor: 760.00, vencimento: '2025-01-25', status: 'pago' },
      iss: { valor: 505.00, vencimento: '2025-02-05', status: 'pendente' },
      inss: { valor: 2100.00, vencimento: '2025-02-07', status: 'pendente' }
    },
    dre: {
      receitaBruta: 15420.00,
      deducoes: 1542.00,
      receitaLiquida: 13878.00,
      custos: 3200.00,
      lucroOperacional: 10678.00,
      despesasOperacionais: 8500.00,
      lucroAntesImpostos: 2178.00,
      impostos: 435.60,
      lucroLiquido: 1742.40
    },
    obrigacoes: [
      { nome: 'DEFIS', prazo: '2025-03-31', status: 'pendente', descricao: 'Declaração de Informações Socioeconômicas e Fiscais' },
      { nome: 'DIRF', prazo: '2025-02-28', status: 'pendente', descricao: 'Declaração do Imposto de Renda Retido na Fonte' },
      { nome: 'RAIS', prazo: '2025-03-31', status: 'pendente', descricao: 'Relação Anual de Informações Sociais' },
      { nome: 'GFIP', prazo: '2025-02-07', status: 'atrasado', descricao: 'Guia de Recolhimento do FGTS e Informações à Previdência Social' }
    ]
  };

  const calcularTotalImpostos = () => {
    return Object.values(dadosFiscais.impostos).reduce((total, imposto) => total + imposto.valor, 0);
  };

  const getImpostosVencidos = () => {
    const hoje = new Date();
    return Object.entries(dadosFiscais.impostos).filter(([_, imposto]) => {
      return new Date(imposto.vencimento) < hoje && imposto.status === 'pendente';
    });
  };

  const getProximosVencimentos = () => {
    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 15);

    return Object.entries(dadosFiscais.impostos)
      .filter(([_, imposto]) => {
        const vencimento = new Date(imposto.vencimento);
        return vencimento >= hoje && vencimento <= proximosDias && imposto.status === 'pendente';
      })
      .sort(([_, a], [__, b]) => new Date(a.vencimento) - new Date(b.vencimento));
  };

  const getObrigacoesPendentes = () => {
    return dadosFiscais.obrigacoes.filter(obr => obr.status !== 'cumprida');
  };

  const totalImpostos = calcularTotalImpostos();
  const impostosVencidos = getImpostosVencidos();
  const proximosVencimentos = getProximosVencimentos();
  const obrigacoesPendentes = getObrigacoesPendentes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Fiscal</h1>
          <p className="text-gray-600">Gestão de impostos e obrigações fiscais</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={periodoSelecionado} 
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2025-01">Janeiro 2025</option>
            <option value="2024-12">Dezembro 2024</option>
            <option value="2024-11">Novembro 2024</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Gerar Relatório
          </button>
        </div>
      </div>

      {/* Resumo Fiscal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Impostos</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalImpostos)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Período atual</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <Calculator className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impostos Vencidos</p>
              <p className="text-2xl font-bold text-red-600">
                {impostosVencidos.length}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {impostosVencidos.length > 0 ? 'Ação necessária' : 'Em dia'}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos Vencimentos</p>
              <p className="text-2xl font-bold text-yellow-600">
                {proximosVencimentos.length}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Próximos 15 dias</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Obrigações Pendentes</p>
              <p className="text-2xl font-bold text-blue-600">
                {obrigacoesPendentes.length}
              </p>
              <p className="text-xs text-blue-600 mt-1">Declarações</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Impostos e DRE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impostos do Período */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Impostos do Período</h3>
            <Calculator className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(dadosFiscais.impostos).map(([tipo, imposto]) => (
              <div key={tipo} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    imposto.status === 'pago' ? 'bg-green-50' : 
                    new Date(imposto.vencimento) < new Date() ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    {imposto.status === 'pago' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : new Date(imposto.vencimento) < new Date() ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tipo.toUpperCase()}</p>
                    <p className="text-xs text-gray-500">
                      Vencimento: {formatDate(imposto.vencimento)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(imposto.valor)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    imposto.status === 'pago' ? 'bg-green-100 text-green-700' :
                    new Date(imposto.vencimento) < new Date() ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {imposto.status === 'pago' ? 'Pago' :
                     new Date(imposto.vencimento) < new Date() ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DRE Simplificada */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">DRE - Demonstração do Resultado</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Receita Bruta</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(dadosFiscais.dre.receitaBruta)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">(-) Deduções</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(dadosFiscais.dre.deducoes)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-900">Receita Líquida</span>
              <span className="text-sm font-bold text-blue-600">
                {formatCurrency(dadosFiscais.dre.receitaLiquida)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">(-) Custos</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(dadosFiscais.dre.custos)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-900">Lucro Operacional</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(dadosFiscais.dre.lucroOperacional)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">(-) Despesas Operacionais</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(dadosFiscais.dre.despesasOperacionais)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">(-) Impostos</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(dadosFiscais.dre.impostos)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t-2 border-gray-300">
              <span className="text-base font-bold text-gray-900">Lucro Líquido</span>
              <span className="text-base font-bold text-green-600">
                {formatCurrency(dadosFiscais.dre.lucroLiquido)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Obrigações Fiscais e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Obrigações Fiscais */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Obrigações Fiscais</h3>
          <div className="space-y-4">
            {dadosFiscais.obrigacoes.map((obrigacao, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  obrigacao.status === 'cumprida' ? 'bg-green-50' :
                  obrigacao.status === 'atrasado' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  {obrigacao.status === 'cumprida' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : obrigacao.status === 'atrasado' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{obrigacao.nome}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      obrigacao.status === 'cumprida' ? 'bg-green-100 text-green-700' :
                      obrigacao.status === 'atrasado' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {obrigacao.status === 'cumprida' ? 'Cumprida' :
                       obrigacao.status === 'atrasado' ? 'Atrasada' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{obrigacao.descricao}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Prazo: {formatDate(obrigacao.prazo)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relatórios Disponíveis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relatórios Disponíveis</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">DRE Completa</p>
                  <p className="text-xs text-gray-500">Demonstração do Resultado do Exercício</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Balanço Patrimonial</p>
                  <p className="text-xs text-gray-500">Posição financeira da clínica</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Calculator className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Relatório de Impostos</p>
                  <p className="text-xs text-gray-500">Detalhamento de todos os impostos</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Compliance Report</p>
                  <p className="text-xs text-gray-500">Relatório de conformidade fiscal</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Archive className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Backup Fiscal</p>
                  <p className="text-xs text-gray-500">Arquivo completo para contabilidade</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Centro de Ações Fiscais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Atenção Necessária</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              {impostosVencidos.length} imposto{impostosVencidos.length !== 1 ? 's' : ''} vencido{impostosVencidos.length !== 1 ? 's' : ''} e {obrigacoesPendentes.filter(o => o.status === 'atrasado').length} obrigação atrasada
            </p>
            <button className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors">
              Ver Detalhes
            </button>
          </div>

          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Próximos Vencimentos</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              {proximosVencimentos.length} imposto{proximosVencimentos.length !== 1 ? 's' : ''} vence{proximosVencimentos.length === 1 ? '' : 'm'} nos próximos 15 dias
            </p>
            <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
              Programar Pagamento
            </button>
          </div>

          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">Otimização Fiscal</h4>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Análise de oportunidades de economia tributária disponível
            </p>
            <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
              Analisar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiscalPage;

