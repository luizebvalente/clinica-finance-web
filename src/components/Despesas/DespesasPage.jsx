import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  CreditCard,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useDespesas } from '../../hooks/useFinancialData';
import toast from 'react-hot-toast';

const DespesasPage = () => {
  const [filtros, setFiltros] = useState({
    periodo: '',
    categoria: '',
    tipo: '',
    status: '',
    busca: ''
  });
  
  const [showForm, setShowForm] = useState(false);
  const { despesas, loading, criarDespesa, atualizarDespesa, deletarDespesa } = useDespesas(filtros);

  const categorias = [
    { value: 'administrativa', label: 'Administrativa' },
    { value: 'clinica', label: 'Clínica' },
    { value: 'utilidades', label: 'Utilidades' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'pessoal', label: 'Pessoal' },
    { value: 'equipamentos', label: 'Equipamentos' }
  ];

  const tipos = [
    { value: 'fixa', label: 'Fixa' },
    { value: 'variavel', label: 'Variável' }
  ];

  const statusOptions = [
    { value: 'pago', label: 'Pago', color: 'bg-green-100 text-green-800' },
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'atrasado', label: 'Em Atraso', color: 'bg-red-100 text-red-800' }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    if (!statusConfig) return null;

    const icons = {
      pago: CheckCircle,
      pendente: Clock,
      atrasado: AlertCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getTipoBadge = (tipo) => {
    const config = {
      fixa: { label: 'Fixa', color: 'bg-blue-100 text-blue-800' },
      variavel: { label: 'Variável', color: 'bg-purple-100 text-purple-800' }
    };

    const tipoConfig = config[tipo];
    if (!tipoConfig) return tipo;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoConfig.color}`}>
        {tipoConfig.label}
      </span>
    );
  };

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const calcularTotais = () => {
    const total = despesas.reduce((sum, d) => sum + d.valor, 0);
    const pago = despesas
      .filter(d => d.status === 'pago')
      .reduce((sum, d) => sum + d.valor, 0);
    const pendente = despesas
      .filter(d => d.status === 'pendente')
      .reduce((sum, d) => sum + d.valor, 0);
    const atrasado = despesas
      .filter(d => d.status === 'atrasado')
      .reduce((sum, d) => sum + d.valor, 0);
    const fixas = despesas
      .filter(d => d.tipo === 'fixa')
      .reduce((sum, d) => sum + d.valor, 0);
    const variaveis = despesas
      .filter(d => d.tipo === 'variavel')
      .reduce((sum, d) => sum + d.valor, 0);

    return { total, pago, pendente, atrasado, fixas, variaveis };
  };

  const totais = calcularTotais();

  const handleNovaDespesa = () => {
    setShowForm(true);
    toast.info('Formulário de nova despesa em desenvolvimento');
  };

  const handleEditDespesa = (despesa) => {
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleDeleteDespesa = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deletarDespesa(id);
        toast.success('Despesa excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir despesa');
      }
    }
  };

  const handlePagarDespesa = async (id) => {
    try {
      await atualizarDespesa(id, { status: 'pago' });
      toast.success('Despesa marcada como paga!');
    } catch (error) {
      toast.error('Erro ao atualizar despesa');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Despesas</h1>
          <p className="text-gray-600">Gerencie todas as despesas da sua clínica</p>
        </div>
        <button 
          onClick={handleNovaDespesa}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total do Período</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totais.total)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pago</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totais.pago)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendente</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(totais.pendente)}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Atraso</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totais.atrasado)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              value={filtros.busca}
              onChange={(e) => handleFiltroChange('busca', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select 
            value={filtros.categoria} 
            onChange={(e) => handleFiltroChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as Categorias</option>
            {categorias.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select 
            value={filtros.tipo} 
            onChange={(e) => handleFiltroChange('tipo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os Tipos</option>
            {tipos.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>

          <select 
            value={filtros.status} 
            onChange={(e) => handleFiltroChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatório
            </button>
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Despesas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Despesas</h3>
          <p className="text-sm text-gray-600">
            {despesas.length} despesa{despesas.length !== 1 ? 's' : ''} encontrada{despesas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-6 font-medium text-gray-600">Vencimento</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Descrição</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Categoria</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Valor</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((despesa) => (
                <tr key={despesa.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm text-gray-900">
                    {formatDate(despesa.vencimento)}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-900">
                    <div className="flex items-center">
                      {despesa.recorrente && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" title="Despesa recorrente"></div>
                      )}
                      {despesa.descricao}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">
                    {categorias.find(c => c.value === despesa.categoria)?.label || despesa.categoria}
                  </td>
                  <td className="py-3 px-6">
                    {getTipoBadge(despesa.tipo)}
                  </td>
                  <td className="py-3 px-6 text-sm font-medium text-gray-900">
                    {formatCurrency(despesa.valor)}
                  </td>
                  <td className="py-3 px-6">
                    {getStatusBadge(despesa.status)}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex space-x-2">
                      {despesa.status !== 'pago' && (
                        <button
                          onClick={() => handlePagarDespesa(despesa.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Marcar como pago"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditDespesa(despesa)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDespesa(despesa.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {despesas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma despesa encontrada</p>
          </div>
        )}
      </div>

      {/* Resumo e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do Período</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total do período:</span>
              <span className="font-bold text-lg">{formatCurrency(totais.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pago:</span>
              <span className="font-medium text-green-600">{formatCurrency(totais.pago)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendente:</span>
              <span className="font-medium text-orange-600">{formatCurrency(totais.pendente)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Em atraso:</span>
              <span className="font-medium text-red-600">{formatCurrency(totais.atrasado)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Análise por Tipo</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Despesas Fixas:</span>
              <span className="font-medium text-blue-600">{formatCurrency(totais.fixas)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Despesas Variáveis:</span>
              <span className="font-medium text-purple-600">{formatCurrency(totais.variaveis)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Percentual Fixo:</span>
                <span className="font-medium">
                  {totais.total > 0 ? ((totais.fixas / totais.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={handleNovaDespesa}
            className="flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </button>
          <button className="flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </button>
          <button className="flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default DespesasPage;

