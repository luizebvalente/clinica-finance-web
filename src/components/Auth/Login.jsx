import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Phone, 
  FileText,
  MapPin,
  Users,
  ChevronDown,
  LogIn,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

const Login = () => {
  const { currentUser, login, register, resetPassword, loading } = useAuth();
  const location = useLocation();
  const [modo, setModo] = useState('login'); // 'login', 'register', 'reset'
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [clinicasDisponiveis, setClinicasDisponiveis] = useState([]);
  const [mostrarSelectorClinica, setMostrarSelectorClinica] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    clinicaId: '',
    // Dados do usuário
    nome: '',
    telefone: '',
    // Dados da clínica (para registro)
    clinicaNome: '',
    clinicaCnpj: '',
    clinicaEndereco: '',
    clinicaTelefone: '',
    clinicaEmail: ''
  });

  // Função de debug
  const addDebugInfo = (info) => {
    console.log('[LOGIN DEBUG]', info);
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
  };

  // Se já estiver logado, redirecionar
  if (currentUser) {
    const from = location.state?.from?.pathname || '/dashboard';
    addDebugInfo(`Usuário já logado, redirecionando para ${from}`);
    return <Navigate to={from} replace />;
  }

  // Buscar clínicas disponíveis para um email
  const buscarClinicasDoEmail = async (email) => {
    if (!email || !email.includes('@')) {
      setClinicasDisponiveis([]);
      setMostrarSelectorClinica(false);
      return;
    }

    try {
      addDebugInfo(`Buscando clínicas para email: ${email}`);
      
      // Buscar usuário pelo email
      const usuariosQuery = query(
        collection(db, 'usuarios'),
        where('email', '==', email),
        where('status', '==', 'ativo')
      );
      const usuariosSnapshot = await getDocs(usuariosQuery);
      
      if (usuariosSnapshot.empty) {
        addDebugInfo('Nenhum usuário encontrado com este email');
        setClinicasDisponiveis([]);
        setMostrarSelectorClinica(false);
        return;
      }

      const userId = usuariosSnapshot.docs[0].id;
      addDebugInfo(`Usuário encontrado: ${userId}`);
      
      // Buscar clínicas onde o usuário é owner
      const clinicasQuery = query(
        collection(db, 'clinicas'),
        where('ownerId', '==', userId),
        where('status', '==', 'ativa')
      );
      const clinicasSnapshot = await getDocs(clinicasQuery);
      
      const clinicas = [];
      clinicasSnapshot.forEach(doc => {
        clinicas.push({
          id: doc.id,
          nome: doc.data().nome,
          cnpj: doc.data().cnpj
        });
      });

      addDebugInfo(`Encontradas ${clinicas.length} clínicas`);
      setClinicasDisponiveis(clinicas);
      setMostrarSelectorClinica(clinicas.length > 1);
      
      // Se só tem uma clínica, selecionar automaticamente
      if (clinicas.length === 1) {
        setFormData(prev => ({ ...prev, clinicaId: clinicas[0].id }));
        addDebugInfo(`Clínica selecionada automaticamente: ${clinicas[0].nome}`);
      }
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      addDebugInfo(`Erro ao buscar clínicas: ${error.message}`);
      setClinicasDisponiveis([]);
    }
  };

  // Debounce para busca de clínicas
  useEffect(() => {
    if (modo === 'login' && formData.email) {
      const timer = setTimeout(() => {
        buscarClinicasDoEmail(formData.email);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setClinicasDisponiveis([]);
      setMostrarSelectorClinica(false);
    }
  }, [formData.email, modo]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Preencha email e senha');
      return;
    }

    if (clinicasDisponiveis.length > 1 && !formData.clinicaId) {
      toast.error('Selecione uma clínica');
      return;
    }

    try {
      setCarregando(true);
      addDebugInfo('Iniciando processo de login...');
      addDebugInfo(`Email: ${formData.email}`);
      addDebugInfo(`Clínica selecionada: ${formData.clinicaId || 'nenhuma'}`);
      
      const resultado = await login(formData.email, formData.password, formData.clinicaId);
      
      addDebugInfo('Login realizado com sucesso!');
      addDebugInfo(`Usuário logado: ${resultado?.nome || resultado?.email}`);
      
      // O redirecionamento será feito automaticamente pelo useEffect acima
      
    } catch (error) {
      addDebugInfo(`Erro no login: ${error.message}`);
      console.error('Erro no login:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.nome || !formData.clinicaNome) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setCarregando(true);
      addDebugInfo('Iniciando processo de registro...');
      
      const resultado = await register(formData.email, formData.password, {
        nome: formData.nome,
        telefone: formData.telefone,
        clinica: {
          nome: formData.clinicaNome,
          cnpj: formData.clinicaCnpj,
          endereco: formData.clinicaEndereco,
          telefone: formData.clinicaTelefone,
          email: formData.clinicaEmail || formData.email
        }
      });
      
      // Verificar se houve erro no resultado
      if (resultado && resultado.error) {
        addDebugInfo(`Erro no registro: ${resultado.message}`);
        toast.error(resultado.message);
        return; // Não continuar se houve erro
      }
      
      addDebugInfo('Registro realizado com sucesso!');
      addDebugInfo(`Nova conta criada: ${resultado?.nome}`);
      addDebugInfo(`Clínica criada: ${resultado?.clinica?.nome || 'Não criada'}`);
      
      // Se chegou até aqui, o registro foi bem-sucedido
      // O redirecionamento será feito automaticamente pelo AuthContext
      
    } catch (error) {
      addDebugInfo(`Erro no registro: ${error.message}`);
      console.error('Erro no registro:', error);
      
      // Garantir que o erro seja mostrado ao usuário
      if (!error.message.includes('já foi mostrado')) {
        toast.error(error.message || 'Erro inesperado durante o cadastro');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Digite seu email');
      return;
    }

    try {
      setCarregando(true);
      addDebugInfo(`Enviando email de recuperação para: ${formData.email}`);
      
      await resetPassword(formData.email);
      setModo('login');
      setFormData({ ...formData, password: '', confirmPassword: '' });
      
      addDebugInfo('Email de recuperação enviado com sucesso');
      
    } catch (error) {
      addDebugInfo(`Erro ao enviar email de recuperação: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
          <p className="text-sm text-gray-500 mt-2">Aguarde...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building className="h-10 w-10 text-blue-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">
                Clínica Finance
              </h1>
            </div>
            <p className="text-gray-600">
              {modo === 'login' && 'Acesse sua clínica'}
              {modo === 'register' && 'Cadastre sua clínica'}
              {modo === 'reset' && 'Recuperar senha'}
            </p>
          </div>

          {/* Debug Info - Mostrar apenas em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <details>
                <summary className="text-sm font-medium cursor-pointer">Debug Info</summary>
                <pre className="text-xs mt-2 whitespace-pre-wrap">{debugInfo}</pre>
              </details>
            </div>
          )}

          {/* Formulário de Login */}
          {modo === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Seletor de Clínica */}
              {mostrarSelectorClinica && clinicasDisponiveis.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clínica
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      name="clinicaId"
                      value={formData.clinicaId}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Selecione uma clínica</option>
                      {clinicasDisponiveis.map((clinica) => (
                        <option key={clinica.id} value={clinica.id}>
                          {clinica.nome}
                          {clinica.cnpj && ` - ${clinica.cnpj}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Indicador de clínica única */}
              {clinicasDisponiveis.length === 1 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {clinicasDisponiveis[0].nome}
                      </p>
                      <p className="text-xs text-green-600">Clínica selecionada automaticamente</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModo('reset')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {carregando ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="h-5 w-5 mr-2" />
                )}
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Formulário de Registro */}
          {modo === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Dados do Usuário */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">Dados do Responsável</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dr. João Silva"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Clínica */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">Dados da Clínica</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Clínica *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="clinicaNome"
                      value={formData.clinicaNome}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Clínica Exemplo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="clinicaCnpj"
                      value={formData.clinicaCnpj}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="clinicaEndereco"
                      value={formData.clinicaEndereco}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Rua Exemplo, 123 - Bairro - Cidade"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone da Clínica
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      name="clinicaTelefone"
                      value={formData.clinicaTelefone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 3333-4444"
                    />
                  </div>
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">Senha de Acesso</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirme sua senha"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {carregando ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <UserPlus className="h-5 w-5 mr-2" />
                )}
                {carregando ? 'Criando conta...' : 'Criar Conta e Clínica'}
              </button>
            </form>
          )}

          {/* Formulário de Reset de Senha */}
          {modo === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Enviaremos um link de recuperação para este email.
                </p>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {carregando ? 'Enviando...' : 'Enviar Email de Recuperação'}
              </button>
            </form>
          )}

          {/* Botões de Navegação */}
          <div className="mt-6 space-y-4">
            {modo === 'login' && (
              <div className="text-center space-y-3">
                <button
                  onClick={() => {
                    setModo('register');
                    setDebugInfo('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Não tem conta? Cadastrar nova clínica
                </button>
              </div>
            )}

            {modo === 'register' && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setModo('login');
                    setDebugInfo('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Já tem conta? Fazer login
                </button>
              </div>
            )}

            {modo === 'reset' && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setModo('login');
                    setDebugInfo('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Voltar ao login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Sistema de Gestão Financeira para Clínicas Médicas</p>
          <p className="mt-1">Multi-Clínica - Powered by Firebase</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-1 text-xs">Modo de desenvolvimento ativo</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
