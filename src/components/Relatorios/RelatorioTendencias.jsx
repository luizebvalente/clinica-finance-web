import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const RelatorioTendencias = ({ filtros }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados mock de tendências
  const tendencias = {
    receitas: {
      titulo: 'Tendência de Receitas',
      dados: [
        { mes: 'Ago/24', valor: 12800.00 },
        { mes: 'Set/24', valor: 13100.00 },
        { mes: 'Out/24', valor: 12900.00 },
        { mes: 'Nov/24', valor: 13200.00 },
        { mes: 'Dez/24', valor: 14100.00 },
        { mes: 'Jan/25', valor: 15420.00 }
      ],
      tendencia: 'crescente',
      previsao: 16200.00,
      cor: 'green'
    },
    despesas: {
      titulo: 'Tendência de Despesas',
      dados: [
        { mes: 'Ago/24', valor: 11200.00 },
        { mes: 'Set/24', valor: 11500.00 },
        { mes: 'Out/24', valor: 11800.00 },
        { mes: 'Nov/24', valor: 11800.00 },
        { mes: 'Dez/24', valor: 12100.00 },
        { mes: 'Jan/25', valor: 12350.00 }
      ],
      tendencia: 'crescente',
      previsao: 12600.00,
      cor: 'red'
    },
    lucro: {
      titulo: 'Tendência de Lucro',
      dados: [
        { mes: 'Ago/24', valor: 1600.00 },
        { mes: 'Set/24', valor: 1600.00 },
        { mes: 'Out/24', valor: 1100.00 },
        { mes: 'Nov/24', valor: 1400.00 },
        { mes: 'Dez/24', valor: 2000.00 },
        { mes: 'Jan/25', valor: 3070.00 }
      ],
      tendencia: 'crescente',
      previsao: 3600.00,
      cor: 'blue'
    }
  };

  const renderGraficoSimples = (dados, cor) => {
    const valores = dados.map(d => d.valor);
    const max = Math.max(...valores);
    const min = Math.min(...valores);
    const range = max - min;

    const cores = {
      green: 'bg-green-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500'
    };

    return (
      <div className="flex items-end space-x-1 h-24">
        {dados.map((item, index) => {
          const altura = range > 0 ? ((item.valor - min) / range) * 100 : 50;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                  className={`w-full ${cores[cor]} rounded-t opacity-70 hover:opacity-100 transition-opacity`}
                  style={{ height: `${altura}%` }}
                  title={`${item.mes}: ${formatCurrency(item.valor)}`}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">{item.mes}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderIndicadorTendencia = (tendencia) => {
    if (tendencia === 'crescente') {
      return (
        <span className="flex items-center text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-1" />
          Crescente
        </span>
      );
    } else if (tendencia === 'decrescente') {
      return (
        <span className="flex items-center text-red-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
          Decrescente
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-gray-600 text-sm font-medium">
          <Activity className="w-4 h-4 mr-1" />
          Estável
        </span>
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Análise de Tendências</h3>
            <p className="text-sm text-gray-600">Evolução dos últimos 6 meses e previsão</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Receitas */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">{tendencias.receitas.titulo}</h4>
            {renderIndicadorTendencia(tendencias.receitas.tendencia)}
          </div>
          {renderGraficoSimples(tendencias.receitas.dados, tendencias.receitas.cor)}
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Previsão para próximo mês:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(tendencias.receitas.previsao)}
              </span>
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">{tendencias.despesas.titulo}</h4>
            {renderIndicadorTendencia(tendencias.despesas.tendencia)}
          </div>
          {renderGraficoSimples(tendencias.despesas.dados, tendencias.despesas.cor)}
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Previsão para próximo mês:</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(tendencias.despesas.previsao)}
              </span>
            </div>
          </div>
        </div>

        {/* Lucro */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">{tendencias.lucro.titulo}</h4>
            {renderIndicadorTendencia(tendencias.lucro.tendencia)}
          </div>
          {renderGraficoSimples(tendencias.lucro.dados, tendencias.lucro.cor)}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Previsão para próximo mês:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(tendencias.lucro.previsao)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 space-y-3">
        <h4 className="font-medium text-gray-900">Insights e Recomendações</h4>
        
        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <strong>Crescimento Positivo:</strong> As receitas apresentam tendência de crescimento consistente nos últimos meses, com aumento médio de 6.2% ao mês.
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <strong>Atenção às Despesas:</strong> As despesas também estão crescendo. Recomenda-se revisar custos operacionais para manter a margem de lucro.
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <strong>Projeção Otimista:</strong> Mantendo a tendência atual, o lucro pode atingir {formatCurrency(tendencias.lucro.previsao)} no próximo mês.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioTendencias;
