import { PieChart, DollarSign, TrendingUp, Package } from 'lucide-react';

const RelatorioPorCategoria = ({ tipo, filtros }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Dados mock de categorias
  const dadosDespesas = [
    { 
      categoria: 'Administrativa', 
      valor: 7800.00, 
      percentual: 63.2,
      itens: 45,
      variacao: 5.2,
      cor: 'bg-blue-500'
    },
    { 
      categoria: 'Clínica', 
      valor: 2100.00, 
      percentual: 17.0,
      itens: 23,
      variacao: -2.1,
      cor: 'bg-green-500'
    },
    { 
      categoria: 'Marketing', 
      valor: 1450.00, 
      percentual: 11.7,
      itens: 12,
      variacao: 15.3,
      cor: 'bg-purple-500'
    },
    { 
      categoria: 'Utilidades', 
      valor: 1000.00, 
      percentual: 8.1,
      itens: 8,
      variacao: 3.5,
      cor: 'bg-orange-500'
    }
  ];

  const dadosReceitas = [
    { 
      categoria: 'Consultas', 
      valor: 4200.00, 
      percentual: 27.2,
      itens: 145,
      variacao: 8.5,
      cor: 'bg-green-500'
    },
    { 
      categoria: 'Procedimentos', 
      valor: 8500.00, 
      percentual: 55.1,
      itens: 89,
      variacao: 12.3,
      cor: 'bg-blue-500'
    },
    { 
      categoria: 'Convênios', 
      valor: 1920.00, 
      percentual: 12.4,
      itens: 67,
      variacao: -3.2,
      cor: 'bg-purple-500'
    },
    { 
      categoria: 'Telemedicina', 
      valor: 800.00, 
      percentual: 5.2,
      itens: 34,
      variacao: 25.8,
      cor: 'bg-teal-500'
    }
  ];

  const dados = tipo === 'receitas' ? dadosReceitas : dadosDespesas;
  const total = dados.reduce((sum, item) => sum + item.valor, 0);

  const renderGraficoPizza = () => {
    let acumulado = 0;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {dados.map((item, index) => {
            const percentual = item.percentual;
            const offset = acumulado;
            acumulado += percentual;
            
            const circumference = 2 * Math.PI * 30;
            const strokeDasharray = `${(percentual / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((offset / 100) * circumference);
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke={item.cor.replace('bg-', '#')}
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
          {dados.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.cor}`}></div>
                  <span className="font-medium text-gray-900">{item.categoria}</span>
                </div>
                <span className={`text-sm font-medium ${item.variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.variacao >= 0 ? '+' : ''}{item.variacao}%
                </span>
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
          <p className="text-2xl font-bold text-gray-900">{dados.length}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Maior Categoria</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{dados[0].categoria}</p>
          <p className="text-sm text-gray-600">{formatPercent(dados[0].percentual)}</p>
        </div>
      </div>

      {/* Análise */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-gray-900 mb-2">Análise</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <p>
            • A categoria <strong>{dados[0].categoria}</strong> representa a maior parte com <strong>{formatPercent(dados[0].percentual)}</strong> do total.
          </p>
          <p>
            • {dados.filter(d => d.variacao > 0).length} categorias apresentaram crescimento em relação ao período anterior.
          </p>
          <p>
            • O valor médio por categoria é de <strong>{formatCurrency(total / dados.length)}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioPorCategoria;
