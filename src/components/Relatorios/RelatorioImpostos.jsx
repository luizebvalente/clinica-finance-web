import { FileText, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const RelatorioImpostos = () => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados mock
  const impostos = [
    { 
      id: 1,
      nome: 'IRPJ',
      descricao: 'Imposto de Renda Pessoa Jurídica',
      valor: 1250.00,
      vencimento: '2025-01-31',
      status: 'pendente',
      competencia: '01/2025',
      aliquota: 8.1,
      baseCalculo: 15420.00
    },
    { 
      id: 2,
      nome: 'CSLL',
      descricao: 'Contribuição Social sobre o Lucro Líquido',
      valor: 450.00,
      vencimento: '2025-01-31',
      status: 'pendente',
      competencia: '01/2025',
      aliquota: 2.9,
      baseCalculo: 15420.00
    },
    { 
      id: 3,
      nome: 'PIS',
      descricao: 'Programa de Integração Social',
      valor: 165.00,
      vencimento: '2025-01-25',
      status: 'pago',
      competencia: '01/2025',
      aliquota: 1.07,
      baseCalculo: 15420.00
    },
    { 
      id: 4,
      nome: 'COFINS',
      descricao: 'Contribuição para Financiamento da Seguridade Social',
      valor: 760.00,
      vencimento: '2025-01-25',
      status: 'pago',
      competencia: '01/2025',
      aliquota: 4.93,
      baseCalculo: 15420.00
    },
    { 
      id: 5,
      nome: 'ISS',
      descricao: 'Imposto Sobre Serviços',
      valor: 505.00,
      vencimento: '2025-02-05',
      status: 'pendente',
      competencia: '01/2025',
      aliquota: 3.28,
      baseCalculo: 15420.00
    },
    { 
      id: 6,
      nome: 'INSS',
      descricao: 'Contribuição Previdenciária',
      valor: 2100.00,
      vencimento: '2025-02-07',
      status: 'pendente',
      competencia: '01/2025',
      aliquota: 13.6,
      baseCalculo: 15420.00
    }
  ];

  const obrigacoesAcessorias = [
    {
      id: 1,
      nome: 'DCTF',
      descricao: 'Declaração de Débitos e Créditos Tributários Federais',
      prazo: '2025-02-15',
      status: 'pendente',
      periodicidade: 'Mensal'
    },
    {
      id: 2,
      nome: 'EFD-Contribuições',
      descricao: 'Escrituração Fiscal Digital das Contribuições',
      prazo: '2025-02-10',
      status: 'pendente',
      periodicidade: 'Mensal'
    },
    {
      id: 3,
      nome: 'SPED Contábil',
      descricao: 'Escrituração Contábil Digital',
      prazo: '2025-05-31',
      status: 'aguardando',
      periodicidade: 'Anual'
    },
    {
      id: 4,
      nome: 'DIRF',
      descricao: 'Declaração do Imposto de Renda Retido na Fonte',
      prazo: '2025-02-28',
      status: 'pendente',
      periodicidade: 'Anual'
    }
  ];

  const totais = {
    total: impostos.reduce((sum, imp) => sum + imp.valor, 0),
    pago: impostos.filter(i => i.status === 'pago').reduce((sum, imp) => sum + imp.valor, 0),
    pendente: impostos.filter(i => i.status === 'pendente').reduce((sum, imp) => sum + imp.valor, 0),
    atrasado: impostos.filter(i => i.status === 'atrasado').reduce((sum, imp) => sum + imp.valor, 0)
  };

  const cargaTributaria = {
    receita: 15420.00,
    impostos: totais.total,
    percentual: (totais.total / 15420.00) * 100
  };

  const getStatusBadge = (status) => {
    const configs = {
      pago: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      atrasado: { label: 'Atrasado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      aguardando: { label: 'Aguardando', color: 'bg-gray-100 text-gray-800', icon: Clock }
    };

    const config = configs[status];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Relatório de Impostos e Obrigações Fiscais</h3>
            <p className="text-sm text-gray-600">Gestão completa de tributos e obrigações acessórias</p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total de Impostos</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totais.total)}</p>
          <p className="text-xs text-gray-500 mt-1">{impostos.length} tributos no período</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pagos</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.pago)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {impostos.filter(i => i.status === 'pago').length} tributos pagos
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pendentes</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totais.pendente)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {impostos.filter(i => i.status === 'pendente').length} tributos pendentes
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Carga Tributária</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{cargaTributaria.percentual.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">Sobre a receita bruta</p>
        </div>
      </div>

      {/* Análise da Carga Tributária */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Análise da Carga Tributária</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Receita Bruta</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(cargaTributaria.receita)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total de Impostos</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(cargaTributaria.impostos)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Percentual</p>
            <p className="text-2xl font-bold text-indigo-600">{cargaTributaria.percentual.toFixed(2)}%</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-4 rounded-full flex items-center justify-end pr-2"
              style={{ width: `${cargaTributaria.percentual}%` }}
            >
              <span className="text-xs font-medium text-white">{cargaTributaria.percentual.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Impostos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-medium text-gray-900">Detalhamento de Impostos</h4>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Imposto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Alíquota</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Valor</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Vencimento</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {impostos.map((imposto) => (
                  <tr key={imposto.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{imposto.nome}</td>
                    <td className="py-3 px-4 text-gray-600">{imposto.descricao}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{imposto.aliquota}%</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(imposto.valor)}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{formatDate(imposto.vencimento)}</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(imposto.status)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50 font-bold">
                  <td colSpan="3" className="py-3 px-4 text-gray-900">Total</td>
                  <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(totais.total)}</td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Obrigações Acessórias */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-medium text-gray-900">Obrigações Acessórias</h4>
          <p className="text-sm text-gray-600">Declarações e entregas obrigatórias</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obrigacoesAcessorias.map((obrigacao) => (
              <div key={obrigacao.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">{obrigacao.nome}</h5>
                    <p className="text-sm text-gray-600 mt-1">{obrigacao.descricao}</p>
                  </div>
                  {getStatusBadge(obrigacao.status)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Prazo: {formatDate(obrigacao.prazo)}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {obrigacao.periodicidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendário Fiscal Resumido */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Próximos Vencimentos</h4>
        <div className="space-y-3">
          {[...impostos, ...obrigacoesAcessorias]
            .filter(item => item.status !== 'pago')
            .sort((a, b) => new Date(a.vencimento || a.prazo) - new Date(b.vencimento || b.prazo))
            .slice(0, 5)
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.nome}</p>
                    <p className="text-sm text-gray-600">{item.descricao}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.valor && <p className="font-medium text-gray-900">{formatCurrency(item.valor)}</p>}
                  <p className="text-sm text-gray-600">{formatDate(item.vencimento || item.prazo)}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Alertas e Recomendações */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Alertas e Recomendações</h4>
        <div className="space-y-3">
          {totais.pendente > 0 && (
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <strong>Atenção:</strong> Você possui {formatCurrency(totais.pendente)} em impostos pendentes. Organize o fluxo de caixa para evitar multas.
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Obrigações Acessórias:</strong> Há {obrigacoesAcessorias.filter(o => o.status === 'pendente').length} declarações pendentes de entrega.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Carga Tributária:</strong> Sua carga tributária de {cargaTributaria.percentual.toFixed(1)}% está dentro da média para clínicas médicas (30-35%).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioImpostos;
