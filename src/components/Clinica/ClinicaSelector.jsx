import { useState, useEffect } from 'react';
import { 
  Building, 
  ChevronDown, 
  Plus, 
  Users, 
  Settings,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ClinicaSelector = () => {
  const { currentUser, getUsuarioClinicas, trocarClinica, criarClinica } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNovaClinicaModal, setShowNovaClinicaModal] = useState(false);
  const [formNovaClinica, setFormNovaClinica] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: ''
  });

  // Carregar clínicas do usuário
  useEffect(() => {
    const carregarClinicas = async () => {
      if (currentUser?.id) {
        try {
          setLoading(true);
          const clinicasUsuario = await getUsuarioClinicas(currentUser.id);
          setClinicas(clinicasUsuario);
        } catch (error) {
          console.error('Erro ao carregar clínicas:', error);
          toast.error('Erro ao carregar clínicas disponíveis');
        } finally {
          setLoading(false);
        }
      }
    };

    carregarClinicas();
  }, [currentUser?.id, getUsuarioClinicas]);

  const handleTrocarClinica = async (clinicaId) => {
    if (clinicaId === currentUser?.clinica?.id) {
      setIsOpen(false);
      return;
    }

    try {
      setLoading(true);
      await trocarClinica(clinicaId);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao trocar clínica:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarNovaClinica = async (e) => {
    e.preventDefault();
    
    if (!formNovaClinica.nome.trim()) {
      toast.error('Nome da clínica é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const novaClinica = await criarClinica(formNovaClinica, currentUser.id);
      
      // Atualizar lista de clínicas
      const clinicasAtualizadas = await getUsuarioClinicas(currentUser.id);
      setClinicas(clinicasAtualizadas);
      
      // Trocar para a nova clínica
      await trocarClinica(novaClinica.id);
      
      setShowNovaClinicaModal(false);
      setFormNovaClinica({
        nome: '',
        cnpj: '',
        endereco: '',
        telefone: '',
        email: ''
      });
      
      toast.success(`Clínica "${novaClinica.nome}" criada com sucesso!`);
    } catch (error) {
      console.error('Erro ao criar nova clínica:', error);
      toast.error('Erro ao criar nova clínica');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <Building className="w-4 h-4" />
          <span className="max-w-40 truncate">
            {currentUser.clinica?.nome || 'Selecionar Clínica'}
          </span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Suas Clínicas</h3>
              <p className="text-xs text-gray-500">Selecione uma clínica para acessar</p>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {clinicas.map((clinica) => (
                <button
                  key={clinica.id}
                  onClick={() => handleTrocarClinica(clinica.id)}
                  className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  disabled={loading}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {clinica.nome}
                          </p>
                          {clinica.cnpj && (
                            <p className="text-xs text-gray-500 truncate">
                              CNPJ: {clinica.cnpj}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          clinica.userRole === 'owner' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {clinica.userRole === 'owner' ? 'Proprietário' : 'Usuário'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          clinica.status === 'ativa' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {clinica.status === 'ativa' ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                    {currentUser.clinica?.id === clinica.id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}

              {clinicas.length === 0 && !loading && (
                <div className="px-3 py-4 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma clínica encontrada</p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="p-3 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  setShowNovaClinicaModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Nova Clínica</span>
              </button>
            </div>
          </div>
        )}

        {/* Overlay para fechar dropdown */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Modal Nova Clínica */}
      {showNovaClinicaModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nova Clínica
              </h3>
              <form onSubmit={handleCriarNovaClinica} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Clínica *
                  </label>
                  <input
                    type="text"
                    value={formNovaClinica.nome}
                    onChange={(e) => setFormNovaClinica({ 
                      ...formNovaClinica, 
                      nome: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Clínica Exemplo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formNovaClinica.cnpj}
                    onChange={(e) => setFormNovaClinica({ 
                      ...formNovaClinica, 
                      cnpj: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formNovaClinica.endereco}
                    onChange={(e) => setFormNovaClinica({ 
                      ...formNovaClinica, 
                      endereco: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua Exemplo, 123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formNovaClinica.telefone}
                    onChange={(e) => setFormNovaClinica({ 
                      ...formNovaClinica, 
                      telefone: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 3333-4444"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formNovaClinica.email}
                    onChange={(e) => setFormNovaClinica({ 
                      ...formNovaClinica, 
                      email: e.target.value 
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contato@clinica.com"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNovaClinicaModal(false);
                      setFormNovaClinica({
                        nome: '',
                        cnpj: '',
                        endereco: '',
                        telefone: '',
                        email: ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Clínica
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClinicaSelector;
