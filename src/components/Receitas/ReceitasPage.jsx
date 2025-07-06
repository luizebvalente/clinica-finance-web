import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, DollarSign, Calendar, User, Tag } from 'lucide-react';
import { receitasService, categoriasService, profissionaisService } from '../../services/localStorageService';

const ReceitasPage = () => {
  const [receitas, setReceitas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    profissional: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editingReceita, setEditingReceita] = useState(null);
  const [formData, setFormData] = useState({
    data: '',
    descricao: '',
    categoria: '',
    profissional: '',
    valor: '',
    status: 'Pendente',
    observacoes: ''
  });
  const [novaCategoria, setNovaCategoria] = useState('');

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setReceitas(receitasService.getAll());
    setCategorias(categoriasService.getCategoriasReceitas());
    setProfissionais(profissionaisService.getAll());
  };

  // Filtrar receitas
  const receitasFiltradas = receitas.filter(receita => {
    const matchBusca = receita.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      receita.profissional.toLowerCase().includes(filtros.busca.toLowerCase());
    const matchCategoria = !filtros.categoria || receita.categoria === filtros.categoria;
    const matchProfissional = !filtros.profissional || receita.profissional === filtros.profissional;
    const matchStatus = !filtros.status || receita.status === filtros.status;
    
    return matchBusca && matchCategoria && matchProfissional && matchStatus;
  });

  // Calcular totais
  const totais = receitasFiltradas.reduce((acc, receita) => {
    acc.total += receita.valor;
    if (receita.status === 'Recebido') acc.recebido += receita.valor;
    if (receita.status === 'Pendente') acc.pendente += receita.valor;
    return acc;
  }, { total: 0, recebido: 0, pendente: 0 });

  // Abrir modal para nova receita
  const abrirModalNova = () => {
    setEditingReceita(null);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      categoria: '',
      profissional: '',
      valor: '',
      status: 'Pendente',
      observacoes: ''
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const abrirModalEdicao = (receita) => {
    setEditingReceita(receita);
    setFormData({
      data: receita.data,
      descricao: receita.descricao,
      categoria: receita.categoria,
      profissional: receita.profissional,
      valor: receita.valor.toString(),
      status: receita.status,
      observacoes: receita.observacoes || ''
    });
    setShowModal(true);
  };

  // Salvar receita
  const salvarReceita = (e) => {
    e.preventDefault();
    
    const dadosReceita = {
      ...formData,
      valor: parseFloat(formData.valor)
    };

    if (editingReceita) {
      receitasService.update(editingReceita.id, dadosReceita);
    } else {
      receitasService.create(dadosReceita);
    }

    carregarDados();
    setShowModal(false);
  };

  // Excluir receita
  const excluirReceita = (id) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      receitasService.delete(id);
      carregarDados();
    }
  };

  // Adicionar categoria
  const adicionarCategoria = () => {
    if (novaCategoria.trim()) {
      categoriasService.addCategoriaReceita(novaCategoria.trim());
      setCategorias(categoriasService.getCategoriasReceitas());
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600">Gerencie as receitas da sua clínica</p>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total do Período</p>
              <p className="text-2xl font-bold text-gray-900">{formatarMoeda(totais.total)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recebido</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.recebido)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
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
              <DollarSign className="w-6 h-6 text-orange-600" />
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
              placeholder="Buscar receitas..."
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
            value={filtros.profissional}
            onChange={(e) => setFiltros({...filtros, profissional: e.target.value})}
          >
            <option value="">Todos os profissionais</option>
            {profissionais.map(prof => (
              <option key={prof.id} value={prof.nome}>{prof.nome}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filtros.status}
            onChange={(e) => setFiltros({...filtros, status: e.target.value})}
          >
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Recebido">Recebido</option>
            <option value="Em Atraso">Em Atraso</option>
          </select>
        </div>
      </div>

      {/* Tabela de Receitas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receitasFiltradas.map((receita) => (
                <tr key={receita.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarData(receita.data)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{receita.descricao}</div>
                      {receita.observacoes && (
                        <div className="text-gray-500 text-xs">{receita.observacoes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {receita.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receita.profissional}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatarMoeda(receita.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      receita.status === 'Recebido' ? 'bg-green-100 text-green-800' :
                      receita.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {receita.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => abrirModalEdicao(receita)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirReceita(receita.id)}
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

        {receitasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma receita encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma nova receita.
            </p>
            <div className="mt-6">
              <button
                onClick={abrirModalNova}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Receita */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingReceita ? 'Editar Receita' : 'Nova Receita'}
              </h3>
              
              <form onSubmit={salvarReceita} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700">Profissional</label>
                  <select
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.profissional}
                    onChange={(e) => setFormData({...formData, profissional: e.target.value})}
                  >
                    <option value="">Selecione um profissional</option>
                    {profissionais.map(prof => (
                      <option key={prof.id} value={prof.nome}>{prof.nome}</option>
                    ))}
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
                    <option value="Recebido">Recebido</option>
                    <option value="Em Atraso">Em Atraso</option>
                  </select>
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
                    {editingReceita ? 'Atualizar' : 'Criar'}
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
                              categoriasService.removeCategoriaReceita(categoria);
                              setCategorias(categoriasService.getCategoriasReceitas());
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

export default ReceitasPage;

