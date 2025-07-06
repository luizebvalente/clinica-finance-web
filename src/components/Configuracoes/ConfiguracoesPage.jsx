import { useState } from 'react';
import { Plus, Edit, Trash2, Settings, User, Tag, Save, X, Download, Upload } from 'lucide-react';
import { useCategorias, useProfissionais } from '../../hooks/useFinancialData';
import { localStorageService } from '../../services/firebaseService';

const ConfiguracoesPage = () => {
  const [activeTab, setActiveTab] = useState('categorias');
  const { 
    categorias, 
    adicionarCategoriaReceita, 
    adicionarCategoriaDespesa, 
    removerCategoriaReceita, 
    removerCategoriaDespesa 
  } = useCategorias();
  const { 
    profissionais, 
    adicionarProfissional, 
    atualizarProfissional, 
    removerProfissional 
  } = useProfissionais();

  const [novaCategoria, setNovaCategoria] = useState('');
  const [tipoCategoriaAtiva, setTipoCategoriaAtiva] = useState('receitas');
  const [showProfissionalModal, setShowProfissionalModal] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState(null);
  const [formProfissional, setFormProfissional] = useState({
    nome: '',
    especialidade: '',
    crm: '',
    email: '',
    telefone: ''
  });

  const handleAdicionarCategoria = async () => {
    if (!novaCategoria.trim()) return;

    try {
      if (tipoCategoriaAtiva === 'receitas') {
        await adicionarCategoriaReceita(novaCategoria.trim());
      } else {
        await adicionarCategoriaDespesa(novaCategoria.trim());
      }
      setNovaCategoria('');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  const handleRemoverCategoria = async (categoria, tipo) => {
    if (window.confirm(`Tem certeza que deseja remover a categoria "${categoria}"?`)) {
      try {
        if (tipo === 'receitas') {
          await removerCategoriaReceita(categoria);
        } else {
          await removerCategoriaDespesa(categoria);
        }
      } catch (error) {
        console.error('Erro ao remover categoria:', error);
      }
    }
  };

  const handleSubmitProfissional = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProfissional) {
        await atualizarProfissional(editingProfissional.id, formProfissional);
      } else {
        await adicionarProfissional(formProfissional);
      }

      setShowProfissionalModal(false);
      setEditingProfissional(null);
      setFormProfissional({
        nome: '',
        especialidade: '',
        crm: '',
        email: '',
        telefone: ''
      });
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    }
  };

  const handleEditProfissional = (profissional) => {
    setEditingProfissional(profissional);
    setFormProfissional({
      nome: profissional.nome,
      especialidade: profissional.especialidade,
      crm: profissional.crm,
      email: profissional.email || '',
      telefone: profissional.telefone || ''
    });
    setShowProfissionalModal(true);
  };

  const handleRemoverProfissional = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este profissional?')) {
      try {
        await removerProfissional(id);
      } catch (error) {
        console.error('Erro ao remover profissional:', error);
      }
    }
  };

  const handleExportarDados = () => {
    try {
      const dados = localStorageService.exportData();
      const blob = new Blob([dados], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clinica-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados');
    }
  };

  const handleImportarDados = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = localStorageService.importData(e.target.result);
        if (success) {
          alert('Dados importados com sucesso!');
          window.location.reload(); // Recarregar para atualizar os dados
        } else {
          alert('Erro ao importar dados');
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        alert('Erro ao importar dados');
      }
    };
    reader.readAsText(file);
  };

  const handleLimparDados = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      try {
        localStorageService.clearAllData();
        alert('Dados limpos com sucesso!');
        window.location.reload();
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('Erro ao limpar dados');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categorias')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categorias'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="h-4 w-4 inline mr-2" />
            Categorias
          </button>
          <button
            onClick={() => setActiveTab('profissionais')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profissionais'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profissionais
          </button>
          <button
            onClick={() => setActiveTab('sistema')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sistema'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Sistema
          </button>
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          {/* Seletor de Tipo */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setTipoCategoriaAtiva('receitas')}
                className={`px-4 py-2 rounded-lg ${
                  tipoCategoriaAtiva === 'receitas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Categorias de Receitas
              </button>
              <button
                onClick={() => setTipoCategoriaAtiva('despesas')}
                className={`px-4 py-2 rounded-lg ${
                  tipoCategoriaAtiva === 'despesas'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Categorias de Despesas
              </button>
            </div>

            {/* Adicionar Nova Categoria */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={`Nova categoria de ${tipoCategoriaAtiva}`}
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAdicionarCategoria()}
              />
              <button
                onClick={handleAdicionarCategoria}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>

            {/* Lista de Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {(tipoCategoriaAtiva === 'receitas' ? categorias.receitas : categorias.despesas)?.map((categoria) => (
                <div key={categoria} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{categoria}</span>
                  <button
                    onClick={() => handleRemoverCategoria(categoria, tipoCategoriaAtiva)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profissionais' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Profissionais da Clínica</h3>
              <button
                onClick={() => setShowProfissionalModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Profissional
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profissionais.map((profissional) => (
                <div key={profissional.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{profissional.nome}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditProfissional(profissional)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoverProfissional(profissional.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{profissional.especialidade}</p>
                  <p className="text-sm text-gray-600 mb-1">CRM: {profissional.crm}</p>
                  {profissional.email && (
                    <p className="text-sm text-gray-600 mb-1">{profissional.email}</p>
                  )}
                  {profissional.telefone && (
                    <p className="text-sm text-gray-600">{profissional.telefone}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sistema' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Backup e Restauração</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Exportar Dados</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Faça backup de todos os seus dados (receitas, despesas, categorias e profissionais).
                </p>
                <button
                  onClick={handleExportarDados}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Dados
                </button>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Importar Dados</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Restaure seus dados a partir de um arquivo de backup.
                </p>
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer inline-flex">
                  <Upload className="h-4 w-4" />
                  Importar Dados
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportarDados}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Limpar Dados</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Remove todos os dados do sistema. Esta ação não pode ser desfeita.
                </p>
                <button
                  onClick={handleLimparDados}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar Todos os Dados
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Versão:</strong> 1.0.0</p>
              <p><strong>Armazenamento:</strong> LocalStorage (Navegador)</p>
              <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
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
              <form onSubmit={handleSubmitProfissional} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formProfissional.nome}
                    onChange={(e) => setFormProfissional({ ...formProfissional, nome: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                  <input
                    type="text"
                    value={formProfissional.especialidade}
                    onChange={(e) => setFormProfissional({ ...formProfissional, especialidade: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CRM</label>
                  <input
                    type="text"
                    value={formProfissional.crm}
                    onChange={(e) => setFormProfissional({ ...formProfissional, crm: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formProfissional.email}
                    onChange={(e) => setFormProfissional({ ...formProfissional, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formProfissional.telefone}
                    onChange={(e) => setFormProfissional({ ...formProfissional, telefone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfissionalModal(false);
                      setEditingProfissional(null);
                      setFormProfissional({
                        nome: '',
                        especialidade: '',
                        crm: '',
                        email: '',
                        telefone: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingProfissional ? 'Atualizar' : 'Salvar'}
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

