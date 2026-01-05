import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

const RelatorioComparativo = ({ dados, filtros }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularVariacao = (atual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const renderIndicadorVariacao = (variacao) => {
    if (variacao > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-1" />
          +{variacao.toFixed(1)}%
        </span>
      );
    } else if (variacao < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm font-medium">
          <TrendingDown className="w-4 h-4 mr-1" />
          {variacao.toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-gray-600 text-sm font-medium">
          <Minus className="w-4 h-4 mr-1" />
          0%
        </span>
      );
    }
  };

  // Dados mock para demonstração
  const dadosComparativos = {
    periodoAtual: {
      receitas: 15420.00,
      despesas: 12350.00,
      lucro: 3070.00,
      consultas: 145,
      pacientes: 234,
      ticketMedio: 106.34
    },
    periodoAnterior: {
      receitas: 14100.00,
      despesas: 12100.00,
      lucro: 2000.00,
      consultas: 134,
      pacientes: 215,
      ticketMedio: 105.22
    }
  };

  const metricas = [
    {
      nome: 'Receitas Totais',
      atual: dadosComparativos.periodoAtual.receitas,
      anterior: dadosComparativos.periodoAnterior.receitas,
      tipo: 'moeda',
      cor: 'green'
    },
    {
      nome: 'Despesas Totais',
      atual: dadosComparativos.periodoAtual.despesas,
      anterior: dadosComparativos.periodoAnterior.despesas,
      tipo: 'moeda',
      cor: 'red'
    },
    {
      nome: 'Lucro Líquido',
      atual: dadosComparativos.periodoAtual.lucro,
      anterior: dadosComparativos.periodoAnterior.lucro,
      tipo: 'moeda',
      cor: 'blue'
    },
    {
      nome: 'Consultas Realizadas',
      atual: dadosComparativos.periodoAtual.consultas,
      anterior: dadosComparativos.periodoAnterior.consultas,
      tipo: 'numero',
      cor: 'purple'
    },
    {
      nome: 'Pacientes Atendidos',
      atual: dadosComparativos.periodoAtual.pacientes,
      anterior: dadosComparativos.periodoAnterior.pacientes,
      tipo: 'numero',
      cor: 'indigo'
    },
    {
      nome: 'Ticket Médio',
      atual: dadosComparativos.periodoAtual.ticketMedio,
      anterior: dadosComparativos.periodoAnterior.ticketMedio,
      tipo: 'moeda',
      cor: 'teal'
    }
  ];

  const getCoresMetrica = (cor) => {
    const cores = {
      green: 'bg-green-50 border-green-200',
      red: 'bg-red-50 border-red-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      indigo: 'bg-indigo-50 border-indigo-200',
      teal: 'bg-teal-50 border-teal-200'
    };
    return cores[cor] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Relatório Comparativo</h3>
            <p className="text-sm text-gray-600">Comparação entre períodos selecionados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricas.map((metrica, index) => {
          const variacao = calcularVariacao(metrica.atual, metrica.anterior);
          const diferenca = metrica.atual - metrica.anterior;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getCoresMetrica(metrica.cor)}`}
            >
              <p className="text-sm font-medium text-gray-600 mb-2">{metrica.nome}</p>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Período Atual</p>
                  <p className="text-xl font-bold text-gray-900">
                    {metrica.tipo === 'moeda' 
                      ? formatCurrency(metrica.atual)
                      : metrica.atual.toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Período Anterior</p>
                    <p className="text-sm font-medium text-gray-700">
                      {metrica.tipo === 'moeda' 
                        ? formatCurrency(metrica.anterior)
                        : metrica.anterior.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {renderIndicadorVariacao(variacao)}
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Diferença</p>
                  <p className={`text-sm font-medium ${diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {diferenca >= 0 ? '+' : ''}
                    {metrica.tipo === 'moeda' 
                      ? formatCurrency(diferenca)
                      : diferenca.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo Executivo */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Resumo Executivo</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            • As receitas <strong className="text-green-600">aumentaram {calcularVariacao(dadosComparativos.periodoAtual.receitas, dadosComparativos.periodoAnterior.receitas).toFixed(1)}%</strong> em relação ao período anterior.
          </p>
          <p>
            • O lucro líquido teve um <strong className="text-green-600">crescimento de {calcularVariacao(dadosComparativos.periodoAtual.lucro, dadosComparativos.periodoAnterior.lucro).toFixed(1)}%</strong>.
          </p>
          <p>
            • Foram realizadas <strong>{dadosComparativos.periodoAtual.consultas}</strong> consultas, um aumento de <strong>{dadosComparativos.periodoAtual.consultas - dadosComparativos.periodoAnterior.consultas}</strong> consultas.
          </p>
          <p>
            • O ticket médio aumentou de <strong>{formatCurrency(dadosComparativos.periodoAnterior.ticketMedio)}</strong> para <strong>{formatCurrency(dadosComparativos.periodoAtual.ticketMedio)}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioComparativo;
