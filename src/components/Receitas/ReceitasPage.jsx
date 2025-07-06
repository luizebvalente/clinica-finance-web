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
  Trash2
} from 'lucide-react';
import { useReceitas, useProfissionais } from '../../hooks/useFinancialData';
import toast from 'react-hot-toast';

const ReceitasPage = () => {
  const [filtros, setFiltros] = useState({
    periodo: '',
    categoria: '',
    profissional: '',
    status: '',
    busca: ''
  });
  
  const [showForm, setShowForm] = useState(false);
  const { receitas, loading, criarReceita, atualizarReceita, deletarReceita } = useReceitas(filtros);
  const { profissionais } = useProfissionais();

  const categorias = [
    { value: 'consulta', label: 'Consulta' },
    { value: 'procedimento', label: 'Procedimento' },
    { value: 'convenio', label: 'Convênio' },
    { value: 'particular', label: 'Particular' },
    { value: 'telemedicina', label: 'Telemedicina' }
  ];

  const statusOptions = [
    { value: 'recebido', label: 'Recebido', color: 'bg-green-100 text-green-800' },
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
      recebido: CheckCircle,
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

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const calcularTotais = () => {
    const total = receitas.reduce((sum, r) => sum + r.valor, 0);
    const recebido = receitas
      .filter(r => r.status === 'recebido')
      .reduce((sum, r) => sum + r.valor, 0);
    const pendente = receitas
      .filter(r => r.status === 'pendente' || r.status === 'atrasado')
      .reduce((sum, r) => sum + r.valor, 0);

    return { total, recebido, pendente };
  };

  const totais = calcularTotais();

  const handleNovaReceita = () => {
    setShowForm(true);
    toast.info('Formulário de nova receita em desenvolvimento');
  };

  const handleEditReceita = (receita) => {
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleDeleteReceita = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await deletarReceita(id);
        toast.success('Receita excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir receita');
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Receitas</h1>
          <p className="text-gray-600">Controle todas as receitas da sua clínica</p>
        </div>
        <button 
          onClick={handleNovaReceita}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total do Período</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totais.total)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recebido</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totais.recebido)}
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
            value={filtros.profissional} 
            onChange={(e) => handleFiltroChange('profissional', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os Profissionais</option>
            {profissionais.map(prof => (
              <option key={prof.id} value={prof.nome}>
                {prof.nome}
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

      {/* Tabela de Receitas */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Receitas</h3>
          <p className="text-sm text-gray-600">
            {receitas.length} receita{receitas.length !== 1 ? 's' : ''} encontrada{receitas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-6 font-medium text-gray-600">Data</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Descrição</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Categoria</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Profissional</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Valor</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {receitas.map((receita) => (
                <tr key={receita.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm text-gray-900">
                    {formatDate(receita.data)}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-900">
                    {receita.descricao}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">
                    {categorias.find(c => c.value === receita.categoria)?.label || receita.categoria}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">
                    {receita.profissional}
                  </td>
                  <td className="py-3 px-6 text-sm font-medium text-gray-900">
                    {formatCurrency(receita.valor)}
                  </td>
                  <td className="py-3 px-6">
                    {getStatusBadge(receita.status)}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReceita(receita)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReceita(receita.id)}
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

        {receitas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma receita encontrada</p>
          </div>
        )}
      </div>

      {/* Resumo do Período */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do Período</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total do período:</span>
              <span className="font-bold text-lg">{formatCurrency(totais.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recebido:</span>
              <span className="font-medium text-green-600">{formatCurrency(totais.recebido)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendente:</span>
              <span className="font-medium text-orange-600">{formatCurrency(totais.pendente)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button 
              onClick={handleNovaReceita}
              className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </button>
            <button className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </button>
            <button className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Cobrança
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceitasPage;

