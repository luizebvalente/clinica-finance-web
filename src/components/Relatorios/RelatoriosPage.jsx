import { useState } from 'react';
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
  FilePdf
} from 'lucide-react';

const RelatoriosPage = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('2025-01');
  const [tipoRelatorio, setTipoRelatorio] = useState('financeiro');
  const [formatoExportacao, setFormatoExportacao] = useState('pdf');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados mock para relatórios
  const dadosRelatorios = {
    financeiro: {
      receitas: 15420.00,
      despesas: 12350.00,
      lucro: 3070.00,
      margem: 19.9,
      crescimento: 12.5
    },
    operacional: {
      consultas: 145,
      procedimentos: 89,
      pacientes: 234,
      profissionais: 8,
      ocupacao: 78.5
    },
    fiscal: {
      impostos: 5230.00,
      obrigacoes: 4,
      vencidos: 2,
      conformidade: 85.5
    }
  };

  const relatoriosDisponiveis = [
    {
      id: 'dre',
      titulo: 'DRE - Demonstração do Resultado',
      descricao: 'Relatório completo de receitas, custos e lucros',
      categoria: 'Financeiro',
      icone: BarChart3,
      cor: 'blue',
      dados: {
        receitaBruta: 15420.00,
        deducoes: 1542.00,
        receitaLiquida: 13878.00,
        custos: 3200.00,
        lucroOperacional: 10678.00,
        despesasOperacionais: 8500.00,
        lucroLiquido: 2178.00
      }
    },
    {
      id: 'fluxo_caixa',
      titulo: 'Relatório de Fluxo de Caixa',
      descricao: 'Análise detalhada das movimentações financeiras',
      categoria: 'Financeiro',
      icone: TrendingUp,
      cor: 'green',
      dados: {
        saldoInicial: 12500.00,
        entradas: 15420.00,
        saidas: 12350.00,
        saldoFinal: 15570.00,
        variacao: 3070.00
      }
    },
    {
      id: 'receitas_categoria',
      titulo: 'Receitas por Categoria',
      descricao: 'Distribuição das receitas por tipo de serviço',
      categoria: 'Operacional',
      icone: PieChart,
      cor: 'purple',
      dados: [
        { categoria: 'Consultas', valor: 4200.00, percentual: 27.2 },
        { categoria: 'Procedimentos', valor: 8500.00, percentual: 55.1 },
        { categoria: 'Convênios', valor: 1920.00, percentual: 12.4 },
        { categoria: 'Telemedicina', valor: 800.00, percentual: 5.2 }
      ]
    },
    {
      id: 'despesas_categoria',
      titulo: 'Despesas por Categoria',
      descricao: 'Análise dos gastos por categoria operacional',
      categoria: 'Operacional',
      icone: Calculator,
      cor: 'red',
      dados: [
        { categoria: 'Administrativa', valor: 7800.00, percentual: 63.2 },
        { categoria: 'Clínica', valor: 2100.00, percentual: 17.0 },
        { categoria: 'Marketing', valor: 1450.00, percentual: 11.7 },
        { categoria: 'Utilidades', valor: 1000.00, percentual: 8.1 }
      ]
    },
    {
      id: 'performance_profissionais',
      titulo: 'Performance dos Profissionais',
      descricao: 'Análise de produtividade por profissional',
      categoria: 'Operacional',
      icone: Users,
      cor: 'indigo',
      dados: [
        { nome: 'Dr. João Silva', consultas: 78, receita: 8500.00, especialidade: 'Cardiologia' },
        { nome: 'Dr. Maria Santos', consultas: 67, receita: 6920.00, especialidade: 'Clínica Geral' },
        { nome: 'Dr. Pedro Costa', consultas: 45, receita: 4200.00, especialidade: 'Dermatologia' },
        { nome: 'Dra. Ana Lima', consultas: 52, receita: 5800.00, especialidade: 'Ginecologia' }
      ]
    },
    {
      id: 'impostos_detalhado',
      titulo: 'Relatório Detalhado de Impostos',
      descricao: 'Análise completa de impostos e obrigações',
      categoria: 'Fiscal',
      icone: FileText,
      cor: 'orange',
      dados: [
        { imposto: 'IRPJ', valor: 1250.00, vencimento: '2025-01-31', status: 'Pendente' },
        { imposto: 'CSLL', valor: 450.00, vencimento: '2025-01-31', status: 'Pendente' },
        { imposto: 'PIS', valor: 165.00, vencimento: '2025-01-25', status: 'Pago' },
        { imposto: 'COFINS', valor: 760.00, vencimento: '2025-01-25', status: 'Pago' },
        { imposto: 'ISS', valor: 505.00, vencimento: '2025-02-05', status: 'Pendente' },
        { imposto: 'INSS', valor: 2100.00, vencimento: '2025-02-07', status: 'Pendente' }
      ]
    },
    {
      id: 'ocupacao_agenda',
      titulo: 'Relatório de Ocupação da Agenda',
      descricao: 'Análise da utilização dos horários disponíveis',
      categoria: 'Operacional',
      icone: Clock,
      cor: 'teal',
      dados: {
        horariosDisponiveis: 320,
        horariosOcupados: 251,
        taxaOcupacao: 78.4,
        horariosVagos: 69,
        cancelamentos: 23
      }
    },
    {
      id: 'comparativo_mensal',
      titulo: 'Comparativo Mensal',
      descricao: 'Evolução dos indicadores ao longo dos meses',
      categoria: 'Estratégico',
      icone: Activity,
      cor: 'cyan',
      dados: [
        { mes: 'Nov/24', receitas: 13200.00, despesas: 11800.00, lucro: 1400.00 },
        { mes: 'Dez/24', receitas: 14100.00, despesas: 12100.00, lucro: 2000.00 },
        { mes: 'Jan/25', receitas: 15420.00, despesas: 12350.00, lucro: 3070.00 }
      ]
    }
  ];

  const categorias = ['Todos', 'Financeiro', 'Operacional', 'Fiscal', 'Estratégico'];

  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);

  const relatoriosFiltrados = relatoriosDisponiveis.filter(rel => 
    categoriaFiltro === 'Todos' || rel.categoria === categoriaFiltro
  );

  const getCorIcon = (cor) => {
    const cores = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      red: 'text-red-600 bg-red-50',
      indigo: 'text-indigo-600 bg-indigo-50',
      orange: 'text-orange-600 bg-orange-50',
      teal: 'text-teal-600 bg-teal-50',
      cyan: 'text-cyan-600 bg-cyan-50'
    };
    return cores[cor] || 'text-gray-600 bg-gray-50';
  };

  const renderRelatorioDetalhado = (relatorio) => {
    if (!relatorio) return null;

    switch (relatorio.id) {
      case 'dre':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Demonstração do Resultado do Exercício</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Receita Bruta</span>
                <span className="font-medium text-green-600">{formatCurrency(relatorio.dados.receitaBruta)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">(-) Deduções</span>
                <span className="font-medium text-red-600">{formatCurrency(relatorio.dados.deducoes)}</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span className="text-gray-900">Receita Líquida</span>
                <span className="text-blue-600">{formatCurrency(relatorio.dados.receitaLiquida)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">(-) Custos</span>
                <span className="font-medium text-red-600">{formatCurrency(relatorio.dados.custos)}</span>
              </div>
              <div className="flex justify-between py-2 border-b font-medium">
                <span className="text-gray-900">Lucro Operacional</span>
                <span className="text-green-600">{formatCurrency(relatorio.dados.lucroOperacional)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">(-) Despesas Operacionais</span>
                <span className="font-medium text-red-600">{formatCurrency(relatorio.dados.despesasOperacionais)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold">
                <span className="text-gray-900">Lucro Líquido</span>
                <span className="text-green-600">{formatCurrency(relatorio.dados.lucroLiquido)}</span>
              </div>
            </div>
          </div>
        );

      case 'receitas_categoria':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Distribuição de Receitas por Categoria</h4>
            <div className="space-y-3">
              {relatorio.dados.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="font-medium text-gray-900">{item.categoria}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(item.valor)}</p>
                    <p className="text-sm text-gray-500">{item.percentual}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'performance_profissionais':
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Performance dos Profissionais</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Profissional</th>
                    <th className="text-left py-2">Especialidade</th>
                    <th className="text-right py-2">Consultas</th>
                    <th className="text-right py-2">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.dados.map((prof, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{prof.nome}</td>
                      <td className="py-2 text-gray-600">{prof.especialidade}</td>
                      <td className="py-2 text-right">{prof.consultas}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(prof.receita)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Visualização detalhada em desenvolvimento...</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e relatórios detalhados da sua clínica</p>
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
            Gerar Relatório Personalizado
          </button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas Totais</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dadosRelatorios.financeiro.receitas)}
              </p>
              <p className="text-xs text-green-500 mt-1">+{dadosRelatorios.financeiro.crescimento}% vs mês anterior</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consultas Realizadas</p>
              <p className="text-2xl font-bold text-blue-600">
                {dadosRelatorios.operacional.consultas}
              </p>
              <p className="text-xs text-blue-500 mt-1">+8.2% vs mês anterior</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-purple-600">
                {dadosRelatorios.operacional.ocupacao}%
              </p>
              <p className="text-xs text-purple-500 mt-1">+3.1% vs mês anterior</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
              <p className="text-2xl font-bold text-green-600">
                {dadosRelatorios.financeiro.margem}%
              </p>
              <p className="text-xs text-green-500 mt-1">+2.3% vs mês anterior</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Relatórios Disponíveis</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={categoriaFiltro} 
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Formato:</span>
              <select 
                value={formatoExportacao} 
                onChange={(e) => setFormatoExportacao(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatoriosFiltrados.map((relatorio) => {
            const IconComponent = relatorio.icone;
            return (
              <div key={relatorio.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-full ${getCorIcon(relatorio.cor)}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>
                    {relatorio.categoria}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{relatorio.titulo}</h4>
                <p className="text-sm text-gray-600 mb-4">{relatorio.descricao}</p>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setRelatorioSelecionado(relatorio)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Visualizar</span>
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Visualização */}
      {relatorioSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{relatorioSelecionado.titulo}</h3>
                <p className="text-gray-600">{relatorioSelecionado.descricao}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Printer className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setRelatorioSelecionado(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="border-t pt-6">
              {renderRelatorioDetalhado(relatorioSelecionado)}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
              <button 
                onClick={() => setRelatorioSelecionado(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar {formatoExportacao.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Exportar Dados Completos</p>
              <p className="text-sm text-gray-600">Excel com todos os dados do período</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Enviar por Email</p>
              <p className="text-sm text-gray-600">Agendar envio automático</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-6 h-6 text-purple-600" />
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

