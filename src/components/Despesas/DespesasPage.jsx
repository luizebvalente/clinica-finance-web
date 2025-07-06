import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, CreditCard, Calendar, Tag, CheckCircle } from 'lucide-react';
import { useDespesas, useCategorias } from '../../hooks/useFinancialData';

const DespesasPage = () => {
  const { despesas, loading, adicionarDespesa, atualizarDespesa, removerDespesa, marcarComoPago } = useDespesas();
  const { categorias } = useCategorias();
  
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    tipo: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState(null);
  const [formData, setFormData] = useState({
    data: '',
    descricao: '',
    categoria: '',
    tipo: 'Variável',
    valor: '',
    vencimento: '',
    status: 'Pendente',
    recorrente: false,
    observacoes: ''
  });

  // Filtrar despesas
  const despesasFiltradas = despesas.filter(despesa => {
    const matchBusca = despesa.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
    const matchCategoria = !filtros.categoria || despesa.categoria === filtros.categoria;
    const matchTipo = !filtros.tipo || despesa.tipo === filtros.tipo;
    const matchStatus = !filtros.status || despesa.status === filtros.status;
    
    return matchBusca && matchCategoria && matchTipo && matchStatus;
  });

  // Calcular totais
  const totais = {
    total: despesasFiltradas.reduce((sum, d) => sum + d.valor, 0),
    pago: despesasFiltradas.filter(d => d.status === 'Pago').reduce((sum, d) => sum + d.valor, 0),
    pendente: despesasFiltradas.filter(d => d.status === 'Pendente').reduce((sum, d) => sum + d.valor, 0),
    atrasado: despesasFiltradas.filter(d => d.status === 'Em Atraso').reduce((sum, d) => sum + d.valor, 0),
    fixas: despesasFiltradas.filter(d => d.tipo === 'Fixa').reduce((sum, d) => sum + d.valor, 0),
    variaveis: despesasFiltradas.filter(d => d.tipo === 'Variável').reduce((sum, d) => sum + d.valor, 0)
  };

  const percentualFixas = totais.total > 0 ? (totais.fixas / totais.total) * 100 : 0;
  const percentualVariaveis = totais.total > 0 ? (totais.variaveis / totais.total) * 100 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const despesaData = {
        ...formData,
        valor: parseFloat(formData.valor)
      };

      if (editingDespesa) {
        await atualizarDespesa(editingDespesa.id, despesaData);
      } else {
        await adicionarDespesa(despesaData);
      }

      setShowModal(false);
      setEditingDespesa(null);
      setFormData({
        data: '',
        descricao: '',
        categoria: '',
        tipo: 'Variável',
        valor: '',
        vencimento: '',
        status: 'Pendente',
        recorrente: false,
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    }
  };

  const handleEdit = (despesa) => {
    setEditingDespesa(despesa);
    setFormData({
      data: despesa.data,
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      tipo: despesa.tipo,
      valor: despesa.valor.toString(),
      vencimento: despesa.vencimento,
      status: despesa.status,
      recorrente: despesa.recorrente || false,
      observacoes: despesa.observacoes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await removerDespesa(id);
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
      }
    }
  };

  const handleMarcarComoPago = async (id) => {
    try {
      await marcarComoPago(id);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Em Atraso': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo) => {
    return tipo === 'Fixa' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600">Controle os gastos da sua clínica</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Despesa
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total do Período</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totais.total)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.pago)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendente</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totais.pendente)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Atraso</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totais.atrasado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análise por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas Fixas</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totais.fixas)}</p>
              <p className="text-sm text-gray-600">{percentualFixas.toFixed(1)}% do total</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">{percentualFixas.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas Variáveis</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totais.variaveis)}</p>
              <p className="text-sm text-gray-600">{percentualVariaveis.toFixed(1)}% do total</p>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">{percentualVariaveis.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar despesas..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.despesas?.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos os tipos</option>
              <option value="Fixa">Fixa</option>
              <option value="Variável">Variável</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos os status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Atraso">Em Atraso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Despesas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {despesasFiltradas.map((despesa) => (
                <tr key={despesa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(despesa.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{despesa.descricao}</div>
                    {despesa.recorrente && (
                      <div className="text-xs text-blue-600">Recorrente</div>
                    )}
                    {despesa.observacoes && (
                      <div className="text-sm text-gray-500">{despesa.observacoes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {despesa.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(despesa.tipo)}`}>
                      {despesa.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(despesa.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {despesa.vencimento ? new Date(despesa.vencimento).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(despesa.status)}`}>
                      {despesa.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {despesa.status !== 'Pago' && (
                        <button
                          onClick={() => handleMarcarComoPago(despesa.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Marcar como pago"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(despesa)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(despesa.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Despesa */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.despesas?.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Variável">Variável</option>
                    <option value="Fixa">Fixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={formData.vencimento}
                    onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Em Atraso">Em Atraso</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recorrente"
                    checked={formData.recorrente}
                    onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recorrente" className="ml-2 block text-sm text-gray-900">
                    Despesa recorrente
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingDespesa(null);
                      setFormData({
                        data: '',
                        descricao: '',
                        categoria: '',
                        tipo: 'Variável',
                        valor: '',
                        vencimento: '',
                        status: 'Pendente',
                        recorrente: false,
                        observacoes: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    {editingDespesa ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DespesasPage;

