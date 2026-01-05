import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { useDadosRelatorios } from '../../hooks/useDadosRelatorios';

const RelatorioComparativoFuncional = ({ filtros }) => {
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

  // Dados do período atual
  const dadosAtual = useDadosRelatorios(filtros);

  // Dados do período anterior (ajustar filtros para mês anterior)
  const filtrosAnterior = {
    ...filtros,
    mes: filtros.mes ? String(parseInt(filtros.mes) - 1).padStart(2, '0') : '12',
    ano: filtros.mes === '01' ? String(parseInt(filtros.ano) - 1) : filtros.ano
  };
  const dadosAnterior = useDadosRelatorios(filtrosAnterior);

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

  const metricas = [
    {
      nome: 'Receitas Totais',
      atual: dadosAtual.totais.receitas,
      anterior: dadosAnterior.totais.receitas,
      tipo: 'moeda',
      cor: 'green'
    },
    {
      nome: 'Despesas Totais',
      atual: dadosAtual.totais.despesas,
      anterior: dadosAnterior.totais.despesas,
      tipo: 'moeda',
      cor: 'red'
    },
    {
      nome: 'Lucro Líquido',
      atual: dadosAtual.totais.lucro,
      anterior: dadosAnterior.totais.lucro,
      tipo: 'moeda',
      cor: 'blue'
    },
    {
      nome: 'Quantidade de Receitas',
      atual: dadosAtual.totais.quantidadeReceitas,
      anterior: dadosAnterior.totais.quantidadeReceitas,
      tipo: 'numero',
      cor: 'purple'
    },
    {
      nome: 'Quantidade de Despesas',
      atual: dadosAtual.totais.quantidadeDespesas,
      anterior: dadosAnterior.totais.quantidadeDespesas,
      tipo: 'numero',
      cor: 'indigo'
    },
    {
      nome: 'Margem de Lucro',
      atual: dadosAtual.totais.margem,
      anterior: dadosAnterior.totais.margem,
      tipo: 'percentual',
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

  const formatarValor = (valor, tipo) => {
    if (tipo === 'moeda') return formatCurrency(valor);
    if (tipo === 'percentual') return `${valor.toFixed(1)}%`;
    return valor.toLocaleString('pt-BR');
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

      {dadosAtual.totais.receitas === 0 && dadosAtual.totais.despesas === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum dado encontrado para os filtros selecionados.</p>
          <p className="text-sm text-gray-400 mt-2">Tente ajustar os filtros para visualizar os dados.</p>
        </div>
      ) : (
        <>
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
                        {formatarValor(metrica.atual, metrica.tipo)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Período Anterior</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatarValor(metrica.anterior, metrica.tipo)}
                        </p>
                      </div>
                      {renderIndicadorVariacao(variacao)}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Diferença</p>
                      <p className={`text-sm font-medium ${diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diferenca >= 0 ? '+' : ''}
                        {formatarValor(Math.abs(diferenca), metrica.tipo)}
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
                • As receitas {calcularVariacao(dadosAtual.totais.receitas, dadosAnterior.totais.receitas) >= 0 ? 
                  <strong className="text-green-600">aumentaram {Math.abs(calcularVariacao(dadosAtual.totais.receitas, dadosAnterior.totais.receitas)).toFixed(1)}%</strong> :
                  <strong className="text-red-600">diminuíram {Math.abs(calcularVariacao(dadosAtual.totais.receitas, dadosAnterior.totais.receitas)).toFixed(1)}%</strong>
                } em relação ao período anterior.
              </p>
              <p>
                • O lucro líquido teve {calcularVariacao(dadosAtual.totais.lucro, dadosAnterior.totais.lucro) >= 0 ? 
                  <strong className="text-green-600">crescimento de {Math.abs(calcularVariacao(dadosAtual.totais.lucro, dadosAnterior.totais.lucro)).toFixed(1)}%</strong> :
                  <strong className="text-red-600">queda de {Math.abs(calcularVariacao(dadosAtual.totais.lucro, dadosAnterior.totais.lucro)).toFixed(1)}%</strong>
                }.
              </p>
              <p>
                • Foram registradas <strong>{dadosAtual.totais.quantidadeReceitas}</strong> receitas, {
                  dadosAtual.totais.quantidadeReceitas > dadosAnterior.totais.quantidadeReceitas ? 
                  `um aumento de ${dadosAtual.totais.quantidadeReceitas - dadosAnterior.totais.quantidadeReceitas}` :
                  dadosAtual.totais.quantidadeReceitas < dadosAnterior.totais.quantidadeReceitas ?
                  `uma redução de ${dadosAnterior.totais.quantidadeReceitas - dadosAtual.totais.quantidadeReceitas}` :
                  'mantendo o mesmo número'
                }.
              </p>
              <p>
                • A margem de lucro {dadosAtual.totais.margem >= 0 ? 'está' : 'está negativa'} em <strong>{dadosAtual.totais.margem.toFixed(1)}%</strong>.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RelatorioComparativoFuncional;
