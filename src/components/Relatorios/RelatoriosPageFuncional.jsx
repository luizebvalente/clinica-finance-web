import { useState } from 'react';
import { 
  FileText, 
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Stethoscope,
  Activity,
  Target,
  RefreshCw
} from 'lucide-react';

import FiltrosAvancados from './FiltrosAvancados';
import RelatorioComparativoFuncional from './RelatorioComparativoFuncional';
import RelatorioPorCategoriaFuncional from './RelatorioPorCategoriaFuncional';
import RelatorioContasPagarReceberFuncional from './RelatorioContasPagarReceberFuncional';
import { useDadosRelatorios } from '../../hooks/useDadosRelatorios';

const RelatoriosPageFuncional = () => {
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    periodo: 'mes_atual',
    mes: '01',
    ano: '2025',
    categoriaDespesa: '',
    categoriaReceita: '',
    status: '',
    dataInicio: '',
    dataFim: ''
  });

  const [abaSelecionada, setAbaSelecionada] = useState('resumo');

  const dados = useDadosRelatorios(filtros);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleFiltrosChange = (novosFiltros) => {
    setFiltros(novosFiltros);
  };

  const handleLimparFiltros = () => {
    setFiltros({
      tipo: 'todos',
      periodo: 'mes_atual',
      mes: '01',
      ano: '2025',
      categoriaDespesa: '',
      categoriaReceita: '',
      status: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  const abas = [
    { id: 'resumo', label: 'Resumo Executivo', icone: FileText },
    { id: 'comparativo', label: 'Comparativo', icone: BarChart3 },
    { id: 'categorias', label: 'Por Categoria', icone: PieChart },
    { id: 'contas', label: 'Contas a Pagar/Receber', icone: DollarSign }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600">Análises completas e filtros personalizados da sua clínica</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <FiltrosAvancados 
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimpar={handleLimparFiltros}
      />

      {/* Resumo Executivo - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas Totais</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dados.totais.receitas)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{dados.receitas.length} receitas</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(dados.totais.despesas)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{dados.despesas.length} despesas</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <Stethoscope className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
              <p className={`text-2xl font-bold ${dados.totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dados.totais.lucro)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {dados.totais.lucro >= 0 ? 'Superávit' : 'Déficit'}
              </p>
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
              <p className={`text-2xl font-bold ${dados.totais.margem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dados.totais.margem.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Sobre receitas</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <div className="flex space-x-1 p-2 overflow-x-auto">
            {abas.map((aba) => {
              const IconeAba = aba.icone;
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaSelecionada(aba.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    abaSelecionada === aba.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconeAba className="w-4 h-4" />
                  <span>{aba.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Conteúdo das Abas */}
          {abaSelecionada === 'resumo' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Resumo Executivo</h3>
                <p className="text-gray-600 mb-4">Visão geral dos principais indicadores financeiros</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-3">Análise Financeira</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• Total de receitas: <strong>{formatCurrency(dados.totais.receitas)}</strong></p>
                      <p>• Total de despesas: <strong>{formatCurrency(dados.totais.despesas)}</strong></p>
                      <p>• Resultado: <strong className={dados.totais.lucro >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(dados.totais.lucro)}
                      </strong></p>
                      <p>• Margem: <strong>{dados.totais.margem.toFixed(1)}%</strong></p>
                    </div>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-3">Volume de Transações</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>• Receitas registradas: <strong>{dados.receitas.length}</strong></p>
                      <p>• Despesas registradas: <strong>{dados.despesas.length}</strong></p>
                      <p>• Total de transações: <strong>{dados.receitas.length + dados.despesas.length}</strong></p>
                      <p>• Ticket médio receitas: <strong>
                        {dados.receitas.length > 0 ? formatCurrency(dados.totais.receitas / dados.receitas.length) : 'R$ 0,00'}
                      </strong></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {abaSelecionada === 'comparativo' && (
            <RelatorioComparativoFuncional filtros={filtros} />
          )}

          {abaSelecionada === 'categorias' && (
            <div className="space-y-6">
              <RelatorioPorCategoriaFuncional tipo="receitas" filtros={filtros} />
              <RelatorioPorCategoriaFuncional tipo="despesas" filtros={filtros} />
            </div>
          )}

          {abaSelecionada === 'contas' && (
            <RelatorioContasPagarReceberFuncional filtros={filtros} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPageFuncional;
