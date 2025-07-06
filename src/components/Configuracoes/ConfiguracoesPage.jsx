import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings, User, Tag, Save, X } from 'lucide-react';
import { categoriasService, profissionaisService } from '../../services/localStorageService';

const ConfiguracoesPage = () => {
  const [activeTab, setActiveTab] = useState('categorias');
  const [categoriasReceitas, setCategoriasReceitas] = useState([]);
  const [categoriasDespesas, setCategoriasDespesas] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  
  // Estados para modais
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showProfissionalModal, setShowProfissionalModal] = useState(false);
  const [tipoCategoria, setTipoCategoria] = useState('receita'); // 'receita' ou 'despesa'
  const [editingProfissional, setEditingProfissional] = useState(null);
  
  // Estados para formulários
  const [novaCategoria, setNovaCategoria] = useState('');
  const [formProfissional, setFormProfissional] = useState({
    nome: '',
    especialidade: '',
    ativo: true
  });

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setCategoriasReceitas(categoriasService.getCategoriasReceitas());
    setCategoriasDespesas(categoriasService.getCategoriasDespesas());
    setProfissionais(profissionaisService.getAll());
  };

  // Funções para categorias
  const abrirModalCategoria = (tipo) => {
    setTipoCategoria(tipo);
    setNovaCategoria('');
    setShowCategoriaModal(true);
  };

  const adicionarCategoria = () => {
    if (novaCategoria.trim()) {
      if (tipoCategoria === 'receita') {
        categoriasService.addCategoriaReceita(novaCategoria.trim());
        setCategoriasReceitas(categoriasService.getCategoriasReceitas());
      } else {
        categoriasService.addCategoriaDespesa(novaCategoria.trim());
        setCategoriasDespesas(categoriasService.getCategoriasDespesas());
      }
      setNovaCategoria('');
      setShowCategoriaModal(false);
    }
  };

  const removerCategoria = (categoria, tipo) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${categoria}"?`)) {
      if (tipo === 'receita') {
        categoriasService.removeCategoriaReceita(categoria);
        setCategoriasReceitas(categoriasService.getCategoriasReceitas());
      } else {
        categoriasService.removeCategoriaDespesa(categoria);
        setCategoriasDespesas(categoriasService.getCategoriasDespesas());
      }
    }
  };

  // Funções para profissionais
  const abrirModalProfissional = (profissional = null) => {
    setEditingProfissional(profissional);
    if (profissional) {
      setFormProfissional({
        nome: profissional.nome,
        especialidade: profissional.especialidade,
        ativo: profissional.ativo
      });
    } else {
      setFormProfissional({
        nome: '',
        especialidade: '',
        ativo: true
      });
    }
    setShowProfissionalModal(true);
  };

  const salvarProfissional = (e) => {
    e.preventDefault();
    
    if (editingProfissional) {
      profissionaisService.update(editingProfissional.id, formProfissional);
    } else {
      profissionaisService.create(formProfissional);
    }
    
    carregarDados();
    setShowProfissionalModal(false);
  };

  const removerProfissional = (id) => {
    if (confirm('Tem certeza que deseja excluir este profissional?')) {
      profissionaisService.delete(id);
      carregarDados();
    }
  };

  const toggleAtivoProfissional = (id, ativo) => {
    profissionaisService.update(id, { ativo: !ativo });
    carregarDados();
  };

  const tabs = [
    { id: 'categorias', label: 'Categorias', icon: Tag },
    { id: 'profissionais', label: 'Profissionais', icon: User },
    { id: 'geral', label: 'Configurações Gerais', icon: Settings }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          {/* Categorias de Receitas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Categorias de Receitas</h3>
              <button
                onClick={() => abrirModalCategoria('receita')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Categoria
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {categoriasReceitas.map(categoria => (
                <div key={categoria} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border">
                  <span className="text-sm font-medium text-green-800">{categoria}</span>
                  <button
                    onClick={() => removerCategoria(categoria, 'receita')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {categoriasReceitas.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma categoria de receita cadastrada</p>
            )}
          </div>

          {/* Categorias de Despesas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Categorias de Despesas</h3>
              <button
                onClick={() => abrirModalCategoria('despesa')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Categoria
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {categoriasDespesas.map(categoria => (
                <div key={categoria} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border">
                  <span className="text-sm font-medium text-red-800">{categoria}</span>
                  <button
                    onClick={() => removerCategoria(categoria, 'despesa')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {categoriasDespesas.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma categoria de despesa cadastrada</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profissionais' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Profissionais</h3>
              <button
                onClick={() => abrirModalProfissional()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Profissional
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profissionais.map((profissional) => (
                  <tr key={profissional.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {profissional.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profissional.especialidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAtivoProfissional(profissional.id, profissional.ativo)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profissional.ativo 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {profissional.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => abrirModalProfissional(profissional)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removerProfissional(profissional.id)}
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

          {profissionais.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum profissional cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando um novo profissional.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => abrirModalProfissional()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Profissional
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'geral' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Gerais</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Clínica</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o nome da clínica"
                  defaultValue="Clínica Finance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(00) 0000-0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contato@clinica.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Endereço completo da clínica"
              />
            </div>
            
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Categoria */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nova Categoria de {tipoCategoria === 'receita' ? 'Receita' : 'Despesa'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Digite o nome da categoria"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowCategoriaModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={adicionarCategoria}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Profissional */}
      {showProfissionalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
              
              <form onSubmit={salvarProfissional} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formProfissional.nome}
                    onChange={(e) => setFormProfissional({...formProfissional, nome: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formProfissional.especialidade}
                    onChange={(e) => setFormProfissional({...formProfissional, especialidade: e.target.value})}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formProfissional.ativo}
                    onChange={(e) => setFormProfissional({...formProfissional, ativo: e.target.checked})}
                  />
                  <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                    Profissional ativo
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProfissionalModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingProfissional ? 'Atualizar' : 'Criar'}
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

export default ConfiguracoesPage;

