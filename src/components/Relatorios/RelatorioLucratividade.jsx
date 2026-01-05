import { TrendingUp, DollarSign, Percent, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const RelatorioLucratividade = () => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Dados mock
  const dadosLucratividade = {
    receitaBruta: 15420.00,
    deducoes: 1542.00,
    receitaLiquida: 13878.00,
    custosProdutos: 3200.00,
    lucroBruto: 10678.00,
    despesasOperacionais: 8500.00,
    lucroOperacional: 2178.00,
    despesasFinanceiras: 350.00,
    receitasFinanceiras: 150.00,
    lucroAntesImpostos: 1978.00,
    impostos: 395.60,
    lucroLiquido: 1582.40
  };

  const margens = {
    margemBruta: (dadosLucratividade.lucroBruto / dadosLucratividade.receitaLiquida) * 100,
    margemOperacional: (dadosLucratividade.lucroOperacional / dadosLucratividade.receitaLiquida) * 100,
    margemLiquida: (dadosLucratividade.lucroLiquido / dadosLucratividade.receitaLiquida) * 100
  };

  const indicadores = {
    pontoEquilibrio: 8500.00,
    ticketMedio: 106.34,
    custoMedioAtendimento: 45.20,
    margemContribuicao: 61.14
  };

  const analiseServicos = [
    {
      servico: 'Consultas',
      receita: 4200.00,
      custos: 1260.00,
      lucro: 2940.00,
      margem: 70.0,
      volume: 145
    },
    {
      servico: 'Procedimentos',
      receita: 8500.00,
      custos: 2550.00,
      lucro: 5950.00,
      margem: 70.0,
      volume: 89
    },
    {
      servico: 'Convênios',
      receita: 1920.00,
      custos: 960.00,
      lucro: 960.00,
      margem: 50.0,
      volume: 67
    },
    {
      servico: 'Telemedicina',
      receita: 800.00,
      custos: 160.00,
      lucro: 640.00,
      margem: 80.0,
      volume: 34
    }
  ];

  const renderBarraProgresso = (valor, max, cor) => {
    const percentual = (valor / max) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${cor}`}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        ></div>
      </div>
    );
  };

  const getCorMargem = (margem) => {
    if (margem >= 70) return 'text-green-600';
    if (margem >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Análise de Lucratividade</h3>
            <p className="text-sm text-gray-600">Indicadores detalhados de rentabilidade</p>
          </div>
        </div>
      </div>

      {/* Cards de Margens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Percent className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Margem Bruta</span>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">{formatPercent(margens.margemBruta)}</p>
          <p className="text-sm text-gray-600">Lucro Bruto: {formatCurrency(dadosLucratividade.lucroBruto)}</p>
          <div className="mt-4">
            {renderBarraProgresso(margens.margemBruta, 100, 'bg-green-600')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Percent className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Margem Operacional</span>
            </div>
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">{formatPercent(margens.margemOperacional)}</p>
          <p className="text-sm text-gray-600">Lucro Operacional: {formatCurrency(dadosLucratividade.lucroOperacional)}</p>
          <div className="mt-4">
            {renderBarraProgresso(margens.margemOperacional, 100, 'bg-blue-600')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Percent className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Margem Líquida</span>
            </div>
            <CheckCircle className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">{formatPercent(margens.margemLiquida)}</p>
          <p className="text-sm text-gray-600">Lucro Líquido: {formatCurrency(dadosLucratividade.lucroLiquido)}</p>
          <div className="mt-4">
            {renderBarraProgresso(margens.margemLiquida, 100, 'bg-purple-600')}
          </div>
        </div>
      </div>

      {/* DRE Simplificado */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Demonstração do Resultado (DRE)</h4>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Receita Bruta</span>
            <span className="font-medium text-gray-900">{formatCurrency(dadosLucratividade.receitaBruta)}</span>
          </div>
          <div className="flex justify-between py-2 pl-4">
            <span className="text-gray-600">(-) Deduções e Abatimentos</span>
            <span className="font-medium text-red-600">{formatCurrency(dadosLucratividade.deducoes)}</span>
          </div>
          <div className="flex justify-between py-2 border-b font-medium bg-blue-50 px-2 rounded">
            <span className="text-gray-900">= Receita Líquida</span>
            <span className="text-blue-600">{formatCurrency(dadosLucratividade.receitaLiquida)}</span>
          </div>
          <div className="flex justify-between py-2 pl-4">
            <span className="text-gray-600">(-) Custos dos Produtos/Serviços</span>
            <span className="font-medium text-red-600">{formatCurrency(dadosLucratividade.custosProdutos)}</span>
          </div>
          <div className="flex justify-between py-2 border-b font-medium bg-green-50 px-2 rounded">
            <span className="text-gray-900">= Lucro Bruto</span>
            <span className="text-green-600">{formatCurrency(dadosLucratividade.lucroBruto)}</span>
          </div>
          <div className="flex justify-between py-2 pl-4">
            <span className="text-gray-600">(-) Despesas Operacionais</span>
            <span className="font-medium text-red-600">{formatCurrency(dadosLucratividade.despesasOperacionais)}</span>
          </div>
          <div className="flex justify-between py-2 border-b font-medium bg-blue-50 px-2 rounded">
            <span className="text-gray-900">= Lucro Operacional (EBIT)</span>
            <span className="text-blue-600">{formatCurrency(dadosLucratividade.lucroOperacional)}</span>
          </div>
          <div className="flex justify-between py-2 pl-4">
            <span className="text-gray-600">(-) Despesas Financeiras</span>
            <span className="font-medium text-red-600">{formatCurrency(dadosLucratividade.despesasFinanceiras)}</span>
          </div>
          <div className="flex justify-between py-2 pl-4">
            <span className="text-gray-600">(+) Receitas Financeiras</span>
            <span className="font-medium text-green-600">{formatCurrency(dadosLucratividade.receitasFinanceiras)}</span>
          </div>
          <div className="flex justify-between py-2 border-b font-medium">
            <span className="text-gray-900">= Lucro Antes dos Impostos</span>
            <span className="text-gray-900">{formatCurrency(dadosLucratividade.lucroAntesImpostos)}</span>
          </div>
          <div className="flex justify-between py-2 pl-4">
            <span className="text-gray-600">(-) Impostos sobre Lucro</span>
            <span className="font-medium text-red-600">{formatCurrency(dadosLucratividade.impostos)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold bg-purple-50 px-2 rounded">
            <span className="text-gray-900">= Lucro Líquido</span>
            <span className="text-purple-600">{formatCurrency(dadosLucratividade.lucroLiquido)}</span>
          </div>
        </div>
      </div>

      {/* Indicadores Chave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Ponto de Equilíbrio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(indicadores.pontoEquilibrio)}</p>
          <p className="text-xs text-gray-500 mt-1">Receita necessária para cobrir custos</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Ticket Médio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(indicadores.ticketMedio)}</p>
          <p className="text-xs text-gray-500 mt-1">Valor médio por atendimento</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Custo Médio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(indicadores.custoMedioAtendimento)}</p>
          <p className="text-xs text-gray-500 mt-1">Custo médio por atendimento</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2 mb-2">
            <Percent className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Margem de Contribuição</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPercent(indicadores.margemContribuicao)}</p>
          <p className="text-xs text-gray-500 mt-1">Contribuição para custos fixos</p>
        </div>
      </div>

      {/* Análise por Serviço */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Lucratividade por Serviço</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Serviço</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Receita</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Custos</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Lucro</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Margem</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Volume</th>
              </tr>
            </thead>
            <tbody>
              {analiseServicos.map((servico, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{servico.servico}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(servico.receita)}</td>
                  <td className="py-3 px-4 text-right text-red-600">{formatCurrency(servico.custos)}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">{formatCurrency(servico.lucro)}</td>
                  <td className={`py-3 px-4 text-right font-bold ${getCorMargem(servico.margem)}`}>
                    {formatPercent(servico.margem)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{servico.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Insights e Recomendações</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Margem Saudável:</strong> A margem líquida de {formatPercent(margens.margemLiquida)} está acima da média do setor (10-15%), indicando boa saúde financeira.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Serviço Mais Lucrativo:</strong> Telemedicina apresenta a maior margem ({formatPercent(80)}). Considere expandir este serviço.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Atenção aos Convênios:</strong> Margem de {formatPercent(50)} nos convênios é baixa. Renegocie contratos ou reduza custos operacionais.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Objetivo de Receita:</strong> Para manter a operação, é necessário faturar no mínimo {formatCurrency(indicadores.pontoEquilibrio)} por mês.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioLucratividade;
