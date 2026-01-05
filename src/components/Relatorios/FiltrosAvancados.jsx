import { useState } from 'react';
import { Filter, X, Calendar, DollarSign, Tag, CheckCircle } from 'lucide-react';

const FiltrosAvancados = ({ filtros, onFiltrosChange, onLimpar }) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const categoriasDespesas = [
    { value: 'administrativa', label: 'Administrativa' },
    { value: 'clinica', label: 'Clínica' },
    { value: 'utilidades', label: 'Utilidades' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'pessoal', label: 'Pessoal' },
    { value: 'equipamentos', label: 'Equipamentos' }
  ];

  const categoriasReceitas = [
    { value: 'consultas', label: 'Consultas' },
    { value: 'procedimentos', label: 'Procedimentos' },
    { value: 'convenios', label: 'Convênios' },
    { value: 'telemedicina', label: 'Telemedicina' },
    { value: 'exames', label: 'Exames' }
  ];

  const statusOptions = [
    { value: 'pago', label: 'Pago' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'atrasado', label: 'Atrasado' }
  ];

  const tiposRelatorio = [
    { value: 'todos', label: 'Todos' },
    { value: 'receitas', label: 'Receitas' },
    { value: 'despesas', label: 'Despesas' },
    { value: 'lucro', label: 'Lucro/Prejuízo' }
  ];

  const periodos = [
    { value: 'mes_atual', label: 'Mês Atual' },
    { value: 'mes_anterior', label: 'Mês Anterior' },
    { value: 'trimestre_atual', label: 'Trimestre Atual' },
    { value: 'ano_atual', label: 'Ano Atual' },
    { value: 'customizado', label: 'Período Customizado' }
  ];

  const meses = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const anos = [
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];

  const handleFiltroChange = (campo, valor) => {
    onFiltrosChange({ ...filtros, [campo]: valor });
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.tipo && filtros.tipo !== 'todos') count++;
    if (filtros.periodo && filtros.periodo !== 'mes_atual') count++;
    if (filtros.mes) count++;
    if (filtros.ano) count++;
    if (filtros.categoriaDespesa) count++;
    if (filtros.categoriaReceita) count++;
    if (filtros.status) count++;
    if (filtros.dataInicio) count++;
    if (filtros.dataFim) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filtros Avançados</h3>
          {filtrosAtivos > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {filtrosAtivos} {filtrosAtivos === 1 ? 'filtro ativo' : 'filtros ativos'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {filtrosAtivos > 0 && (
            <button
              onClick={onLimpar}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Limpar Filtros</span>
            </button>
          )}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="space-y-4 pt-4 border-t">
          {/* Linha 1: Tipo de Relatório e Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Tipo de Relatório
              </label>
              <select
                value={filtros.tipo || 'todos'}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tiposRelatorio.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Período
              </label>
              <select
                value={filtros.periodo || 'mes_atual'}
                onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {periodos.map(periodo => (
                  <option key={periodo.value} value={periodo.value}>{periodo.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 2: Mês e Ano (quando aplicável) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês Específico
              </label>
              <select
                value={filtros.mes || ''}
                onChange={(e) => handleFiltroChange('mes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os meses</option>
                {meses.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <select
                value={filtros.ano || '2025'}
                onChange={(e) => handleFiltroChange('ano', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {anos.map(ano => (
                  <option key={ano.value} value={ano.value}>{ano.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Período Customizado (quando selecionado) */}
          {filtros.periodo === 'customizado' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtros.dataInicio || ''}
                  onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim || ''}
                  onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Linha 4: Categorias (dependendo do tipo) */}
          {(filtros.tipo === 'despesas' || filtros.tipo === 'todos') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoria de Despesa
              </label>
              <select
                value={filtros.categoriaDespesa || ''}
                onChange={(e) => handleFiltroChange('categoriaDespesa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categoriasDespesas.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          )}

          {(filtros.tipo === 'receitas' || filtros.tipo === 'todos') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoria de Receita
              </label>
              <select
                value={filtros.categoriaReceita || ''}
                onChange={(e) => handleFiltroChange('categoriaReceita', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categoriasReceitas.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Linha 5: Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filtros.status || ''}
              onChange={(e) => handleFiltroChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosAvancados;
