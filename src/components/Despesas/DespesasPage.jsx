import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, CreditCard, Calendar, Tag, CheckCircle } from 'lucide-react';
import { despesasService, categoriasService } from '../../services/localStorageService';

const DespesasPage = () => {
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    tipo: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState(null);
  const [formData, setFormData] = useState({
    vencimento: '',
    descricao: '',
    categoria: '',
    tipo: 'Fixa',
    valor: '',
    status: 'Pendente',
    recorrente: false,
    observacoes: ''
  });
  const [novaCategoria, setNovaCategoria] = useState('');

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setDespesas(despesasService.getAll());
    setCategorias(categoriasService.getCategoriasDespesas());
  };

  // Filtrar despesas
  const despesasFiltradas = despesas.filter(despesa => {
    const matchBusca = despesa.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
    const matchCategoria = !filtros.categoria || despesa.categoria === filtros.categoria;
    const matchTipo = !filtros.tipo || despesa.tipo === filtros.tipo;
    const matchStatus = !filtros.status || despesa.status === filtros.status;
    
    return matchBusca && matchCategoria && matchTipo && matchStatus;
  });

  // Calcular totais
  const totais = despesasFiltradas.reduce((acc, despesa) => {
    acc.total += despesa.valor;
    if (despesa.status === 'Pago') acc.pago += despesa.valor;
    if (despesa.status === 'Pendente') acc.pendente += despesa.valor;
    if (despesa.status === 'Em Atraso') acc.emAtraso += despesa.valor;
    if (despesa.tipo === 'Fixa') acc.fixas += despesa.valor;
    if (despesa.tipo === 'Variável') acc.variaveis += despesa.valor;
    return acc;
  }, { total: 0, pago: 0, pendente: 0, emAtraso: 0, fixas: 0, variaveis: 0 });

  // Abrir modal para nova despesa
  const abrirModalNova = () => {
    setEditingDespesa(null);
    setFormData({
      vencimento: new Date().toISOString().split('T')[0],
      descricao: '',
      categoria: '',
      tipo: 'Fixa',
      valor: '',
      status: 'Pendente',
      recorrente: false,
      observacoes: ''
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const abrirModalEdicao = (despesa) => {
    setEditingDespesa(despesa);
    setFormData({
      vencimento: despesa.vencimento,
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      tipo: despesa.tipo,
      valor: despesa.valor.toString(),
      status: despesa.status,
      recorrente: despesa.recorrente,
      observacoes: despesa.observacoes || ''
    });
    setShowModal(true);
  };

  // Salvar despesa
  const salvarDespesa = (e) => {
    e.preventDefault();
    
    const dadosDespesa = {
      ...formData,
      valor: parseFloat(formData.valor)
    };

    if (editingDespesa) {
      despesasService.update(editingDespesa.id, dadosDespesa);
    } else {
      despesasService.create(dadosDespesa);
    }

    carregarDados();
    setShowModal(false);
  };

  // Excluir despesa
  const excluirDespesa = (id) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      despesasService.delete(id);
      carregarDados();
    }
  };

  // Marcar como pago
  const marcarComoPago = (id) => {
    despesasService.marcarComoPago(id);
    carregarDados();
  };

  // Adicionar categoria
  const adicionarCategoria = () => {
    if (novaCategoria.trim()) {
      categoriasService.addCategoriaDespesa(novaCategoria.trim());
      setCategorias(categoriasService.getCategoriasDespesas());
      setNovaCategoria('');
      setShowCategoriaModal(false);
    }
  };

  // Formatar moeda
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Formatar data
  const formatarData = (data) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // Verificar se está em atraso
  const estaEmAtraso = (vencimento, status) => {
    if (status === 'Pago') return false;
    const hoje = new Date();
    const dataVencimento = new Date(vencimento + 'T00:00:00');
    return dataVencimento < hoje;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600">Gerencie as despesas da sua clínica</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoriaModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            Categorias
          </button>
          <button
            onClick={abrirModalNova}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total do Período</p>
              <p className="text-2xl font-bold text-gray-900">{formatarMoeda(totais.total)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.pago)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendente</p>
              <p className="text-2xl font-bold text-orange-600">{formatarMoeda(totais.pendente)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Atraso</p>
              <p className="text-2xl font-bold text-red-600">{formatarMoeda(totais.emAtraso)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Análise por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas Fixas vs Variáveis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Despesas Fixas</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatarMoeda(totais.fixas)}</span>
                <span className="text-xs text-gray-500">
                  ({totais.total > 0 ? ((totais.fixas / totais.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${totais.total > 0 ? (totais.fixas / totais.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Despesas Variáveis</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatarMoeda(totais.variaveis)}</span>
                <span className="text-xs text-gray-500">
                  ({totais.total > 0 ? ((totais.variaveis / totais.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${totais.total > 0 ? (totais.variaveis / totais.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo por Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Pago</span>
              <span className="text-sm font-bold text-green-800">{formatarMoeda(totais.pago)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-orange-800">Pendente</span>
              <span className="text-sm font-bold text-orange-800">{formatarMoeda(totais.pendente)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-800">Em Atraso</span>
              <span className="text-sm font-bold text-red-800">{formatarMoeda(totais.emAtraso)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar despesas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtros.busca}
              onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filtros.categoria}
            onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
          >
            <option value="">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filtros.tipo}
            onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
          >
            <option value="">Todos os tipos</option>
            <option value="Fixa">Fixa</option>
            <option value="Variável">Variável</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filtros.status}
            onChange={(e) => setFiltros({...filtros, status: e.target.value})}
          >
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Em Atraso">Em Atraso</option>
          </select>
        </div>
      </div>

      {/* Tabela de Despesas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {despesasFiltradas.map((despesa) => (
                <tr key={despesa.id} className={`hover:bg-gray-50 ${estaEmAtraso(despesa.vencimento, despesa.status) ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {formatarData(despesa.vencimento)}
                      {estaEmAtraso(despesa.vencimento, despesa.status) && (
                        <span className="ml-2 text-red-500 text-xs">⚠️</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium flex items-center">
                        {despesa.descricao}
                        {despesa.recorrente && (
                          <span className="ml-2 text-blue-500 text-xs">🔄</span>
                        )}
                      </div>
                      {despesa.observacoes && (
                        <div className="text-gray-500 text-xs">{despesa.observacoes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      {despesa.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      despesa.tipo === 'Fixa' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {despesa.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatarMoeda(despesa.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      despesa.status === 'Pago' ? 'bg-green-100 text-green-800' :
                      despesa.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {despesa.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {despesa.status !== 'Pago' && (
                        <button
                          onClick={() => marcarComoPago(despesa.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Marcar como pago"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => abrirModalEdicao(despesa)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirDespesa(despesa.id)}
                        className="text-red-600 hover:text-red-900"
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

        {despesasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma despesa encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma nova despesa.
            </p>
            <div className="mt-6">
              <button
                onClick={abrirModalNova}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Despesa */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
              </h3>
              
              <form onSubmit={salvarDespesa} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vencimento</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.vencimento}
                    onChange={(e) => setFormData({...formData, vencimento: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="Fixa">Fixa</option>
                    <option value="Variável">Variável</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.recorrente}
                    onChange={(e) => setFormData({...formData, recorrente: e.target.checked})}
                  />
                  <label htmlFor="recorrente" className="ml-2 block text-sm text-gray-900">
                    Despesa recorrente
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingDespesa ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Categorias */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gerenciar Categorias</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova categoria"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                  />
                  <button
                    onClick={adicionarCategoria}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Categorias Existentes:</h4>
                  <div className="space-y-2">
                    {categorias.map(categoria => (
                      <div key={categoria} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{categoria}</span>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir categoria "${categoria}"?`)) {
                              categoriasService.removeCategoriaDespesa(categoria);
                              setCategorias(categoriasService.getCategoriasDespesas());
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowCategoriaModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DespesasPage;

