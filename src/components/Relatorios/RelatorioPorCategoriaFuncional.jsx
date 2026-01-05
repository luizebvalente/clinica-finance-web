import { PieChart, DollarSign, TrendingUp, Package } from 'lucide-react';
import { useDadosRelatorios } from '../../hooks/useDadosRelatorios';

const RelatorioPorCategoriaFuncional = ({ tipo, filtros }) => {
  const dados = useDadosRelatorios(filtros);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Preparar dados por categoria
  const categoriasDados = tipo === 'receitas' ? dados.totaisPorCategoria.receitas : dados.totaisPorCategoria.despesas;
  const itens = tipo === 'receitas' ? dados.receitas : dados.despesas;
  
  const total = Object.values(categoriasDados).reduce((sum, valor) => sum + valor, 0);

  // Mapear nomes de categorias
  const nomesCategoriasReceitas = {
    consultas: 'Consultas',
    procedimentos: 'Procedimentos',
    convenios: 'Convênios',
    telemedicina: 'Telemedicina',
    exames: 'Exames'
  };

  const nomesCategoriasDespesas = {
    administrativa: 'Administrativa',
    clinica: 'Clínica',
    utilidades: 'Utilidades',
    marketing: 'Marketing',
    pessoal: 'Pessoal',
    equipamentos: 'Equipamentos'
  };

  const nomesCateg = tipo === 'receitas' ? nomesCategoriasReceitas : nomesCategoriasDespesas;

  // Cores para cada categoria
  const coresCategorias = {
    0: 'bg-blue-500',
    1: 'bg-green-500',
    2: 'bg-purple-500',
    3: 'bg-orange-500',
    4: 'bg-teal-500',
    5: 'bg-pink-500'
  };

  // Transformar dados em array para exibição
  const dadosArray = Object.entries(categoriasDados).map(([categoria, valor], index) => {
    const quantidadeItens = itens.filter(item => item.categoria === categoria).length;
    const percentual = total > 0 ? (valor / total) * 100 : 0;
    
    return {
      categoria: nomesCateg[categoria] || categoria,
      valor,
      percentual,
      itens: quantidadeItens,
      variacao: 0, // Pode ser calculado comparando com período anterior
      cor: coresCategorias[index] || 'bg-gray-500'
    };
  }).sort((a, b) => b.valor - a.valor); // Ordenar por valor decrescente

  const renderGraficoPizza = () => {
    if (dadosArray.length === 0 || total === 0) {
      return (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <div className="text-center text-gray-400">
            <PieChart className="w-16 h-16 mx-auto mb-2" />
            <p className="text-sm">Sem dados</p>
          </div>
        </div>
      );
    }

    let acumulado = 0;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {dadosArray.map((item, index) => {
            const percentual = item.percentual;
            const offset = acumulado;
            acumulado += percentual;
            
            const circumference = 2 * Math.PI * 30;
            const strokeDasharray = `${(percentual / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((offset / 100) * circumference);
            
            // Extrair cor hex do className
            const corMap = {
              'bg-blue-500': '#3b82f6',
              'bg-green-500': '#22c55e',
              'bg-purple-500': '#a855f7',
              'bg-orange-500': '#f97316',
              'bg-teal-500': '#14b8a6',
              'bg-pink-500': '#ec4899',
              'bg-gray-500': '#6b7280'
            };
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke={corMap[item.cor]}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
      </div>
    );
  };

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <PieChart className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {tipo === 'receitas' ? 'Receitas' : 'Despesas'} por Categoria
              </h3>
              <p className="text-sm text-gray-600">Distribuição e análise detalhada</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum dado encontrado para os filtros selecionados.</p>
          <p className="text-sm text-gray-400 mt-2">Tente ajustar os filtros para visualizar os dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <PieChart className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {tipo === 'receitas' ? 'Receitas' : 'Despesas'} por Categoria
            </h3>
            <p className="text-sm text-gray-600">Distribuição e análise detalhada</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div className="flex items-center justify-center">
          {renderGraficoPizza()}
        </div>

        {/* Legenda e Detalhes */}
        <div className="space-y-3">
          {dadosArray.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.cor}`}></div>
                  <span className="font-medium text-gray-900">{item.categoria}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Valor</p>
                  <p className="font-medium text-gray-900">{formatCurrency(item.valor)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Percentual</p>
                  <p className="font-medium text-gray-900">{formatPercent(item.percentual)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Itens</p>
                  <p className="font-medium text-gray-900">{item.itens}</p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.cor}`}
                    style={{ width: `${item.percentual}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Total Geral</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Categorias</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{dadosArray.length}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Maior Categoria</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{dadosArray[0]?.categoria || '-'}</p>
          <p className="text-sm text-gray-600">{dadosArray[0] ? formatPercent(dadosArray[0].percentual) : '-'}</p>
        </div>
      </div>

      {/* Análise */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-gray-900 mb-2">Análise</h4>
        <div className="space-y-1 text-sm text-gray-700">
          {dadosArray.length > 0 && (
            <>
              <p>
                • A categoria <strong>{dadosArray[0].categoria}</strong> representa a maior parte com <strong>{formatPercent(dadosArray[0].percentual)}</strong> do total.
              </p>
              <p>
                • O valor médio por categoria é de <strong>{formatCurrency(total / dadosArray.length)}</strong>.
              </p>
              <p>
                • Total de <strong>{itens.length}</strong> {tipo === 'receitas' ? 'receitas' : 'despesas'} registradas no período.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatorioPorCategoriaFuncional;
