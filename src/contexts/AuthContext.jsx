import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { inicializarDadosClinica } from '../services/firebaseService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug function
  const debugLog = (message, data = null) => {
    console.log(`[AUTH DEBUG] ${message}`, data || '');
  };

  // Função para buscar dados da clínica
  const getClinicaData = async (clinicaId) => {
    try {
      debugLog(`Buscando dados da clínica: ${clinicaId}`);
      const clinicaDoc = await getDoc(doc(db, 'clinicas', clinicaId));
      if (clinicaDoc.exists()) {
        const clinicaData = { id: clinicaDoc.id, ...clinicaDoc.data() };
        debugLog('Clínica encontrada:', clinicaData);
        return clinicaData;
      }
      debugLog('Clínica não encontrada');
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados da clínica:', error);
      return null;
    }
  };

  // Função para criar uma nova clínica
  const criarClinica = async (dadosClinica, userId, nomeUsuario) => {
    try {
      debugLog('Criando nova clínica', { dadosClinica, userId, nomeUsuario });
      
      // Validar pré-requisitos
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }
      if (!dadosClinica?.nome) {
        throw new Error('Nome da clínica é obrigatório');
      }
      
      const clinicaId = `clinica_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clinicaData = {
        nome: dadosClinica.nome,
        cnpj: dadosClinica.cnpj || '',
        endereco: dadosClinica.endereco || '',
        telefone: dadosClinica.telefone || '',
        email: dadosClinica.email || '',
        ownerId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'ativa',
        configuracoes: {
          moeda: 'BRL',
          fuso: 'America/Sao_Paulo',
          tema: 'light'
        }
      };

      debugLog('Iniciando operações de criação da clínica...');
      
      // Usar batch para operações atômicas
      const batch = writeBatch(db);
      
      // Criar documento da clínica
      const clinicaRef = doc(db, 'clinicas', clinicaId);
      batch.set(clinicaRef, clinicaData);
      debugLog('Documento da clínica adicionado ao batch');
      
      // Criar estrutura de permissões do usuário na clínica
      const usuarioClinicaRef = doc(db, 'clinicas', clinicaId, 'usuarios', userId);
      batch.set(usuarioClinicaRef, {
        userId: userId,
        role: 'owner',
        permissions: ['all'],
        addedAt: serverTimestamp(),
        status: 'ativo'
      });
      debugLog('Permissões do usuário adicionadas ao batch');

      debugLog('Executando batch commit...');
      await batch.commit();
      debugLog('Batch commit executado com sucesso');

      // Verificar se a clínica foi realmente criada
      const clinicaVerificacao = await getDoc(clinicaRef);
      if (!clinicaVerificacao.exists()) {
        throw new Error('Falha ao criar clínica - documento não foi salvo no Firestore');
      }
      debugLog('Clínica verificada no Firestore');

      // Inicializar dados da clínica (categorias, profissionais, etc.)
      debugLog('Inicializando dados da clínica...');
      await inicializarDadosClinica(clinicaId, nomeUsuario);
      debugLog('Dados da clínica inicializados com sucesso');

      const novaClinica = { 
        id: clinicaId, 
        ...clinicaData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      debugLog('Clínica criada com sucesso:', novaClinica);
      return novaClinica;
    } catch (error) {
      console.error('Erro detalhado ao criar clínica:', error);
      debugLog('Erro na criação da clínica:', error.message);
      
      // Verificar tipos específicos de erro
      if (error.code === 'permission-denied') {
        throw new Error('Erro de permissão: Verifique as regras do Firestore para a coleção clinicas');
      } else if (error.code === 'unavailable') {
        throw new Error('Serviço temporariamente indisponível. Tente novamente em alguns instantes.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }
      
      throw error;
    }
  };

  // Função de login
  const login = async (email, password, clinicaId = null) => {
    try {
      setLoading(true);
      debugLog('Iniciando processo de login', { email, clinicaId });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      debugLog('Login Firebase realizado com sucesso', { uid: firebaseUser.uid });
      
      // Buscar perfil do usuário
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Perfil de usuário não encontrado. Por favor, crie uma conta primeiro.');
      }

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        ...userDoc.data(),
        // Converter timestamps
        createdAt: userDoc.data().createdAt?.toDate().toISOString(),
        lastLogin: userDoc.data().lastLogin?.toDate().toISOString()
      };

      debugLog('Dados do usuário carregados:', userData);

      // Verificar clínicas disponíveis
      let clinicaData = null;
      let clinicaAcesso = null;

      if (clinicaId) {
        debugLog(`Verificando acesso à clínica específica: ${clinicaId}`);
        // Verificar acesso à clínica específica
        const acessoDoc = await getDoc(doc(db, 'clinicas', clinicaId, 'usuarios', firebaseUser.uid));
        
        if (acessoDoc.exists() && acessoDoc.data().status === 'ativo') {
          clinicaAcesso = acessoDoc.data();
          clinicaData = await getClinicaData(clinicaId);
          debugLog('Acesso verificado para clínica específica');
        } else {
          // Verificar se é owner da clínica
          const clinicaDoc = await getDoc(doc(db, 'clinicas', clinicaId));
          if (clinicaDoc.exists() && clinicaDoc.data().ownerId === firebaseUser.uid) {
            clinicaAcesso = { role: 'owner', permissions: ['all'] };
            clinicaData = await getClinicaData(clinicaId);
            debugLog('Usuário é owner da clínica');
          }
        }
        
        if (!clinicaData || !clinicaAcesso) {
          throw new Error('Usuário não tem acesso a esta clínica');
        }
      } else {
        debugLog('Buscando primeira clínica disponível do usuário');
        // Buscar primeira clínica disponível do usuário
        const clinicasQuery = query(
          collection(db, 'clinicas'),
          where('ownerId', '==', firebaseUser.uid),
          where('status', '==', 'ativa')
        );
        const clinicasSnapshot = await getDocs(clinicasQuery);
        
        if (!clinicasSnapshot.empty) {
          const firstClinica = clinicasSnapshot.docs[0];
          clinicaData = { id: firstClinica.id, ...firstClinica.data() };
          clinicaAcesso = { role: 'owner', permissions: ['all'] };
          debugLog('Primeira clínica encontrada:', clinicaData);
        } else {
          debugLog('Nenhuma clínica encontrada para o usuário');
        }
      }

      // Atualizar último login
      await updateDoc(doc(db, 'usuarios', firebaseUser.uid), {
        lastLogin: serverTimestamp(),
        lastClinicaId: clinicaData?.id || null
      });

      const userCompleto = {
        ...userData,
        clinica: clinicaData,
        clinicaRole: clinicaAcesso?.role || 'user',
        permissions: clinicaAcesso?.permissions || [],
        lastLogin: new Date().toISOString()
      };

      // Persistir no localStorage para uso offline
      localStorage.setItem('currentUser', JSON.stringify(userCompleto));

      setUser(firebaseUser);
      setUserProfile(userCompleto);
      setCurrentUser(userCompleto);
      
      debugLog('Login completo realizado com sucesso:', userCompleto);
      
      if (clinicaData) {
        toast.success(`Bem-vindo à ${clinicaData.nome}!`);
      } else {
        toast.success('Login realizado com sucesso!');
      }
      
      return userCompleto;
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado. Verifique o email.';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Email ou senha incorretos.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desabilitada. Entre em contato com o suporte.';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (email, password, dadosAdicionais = {}) => {
    try {
      setLoading(true);
      debugLog('Iniciando processo de registro', { email, dadosAdicionais });
      
      // Validações iniciais
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }
      
      if (dadosAdicionais.clinica && !dadosAdicionais.clinica.nome) {
        throw new Error('Nome da clínica é obrigatório');
      }
      
      debugLog('Criando usuário no Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      debugLog('Usuário Firebase criado:', { uid: firebaseUser.uid });
      
      // Criar documento do usuário
      const userData = {
        email: firebaseUser.email,
        nome: dadosAdicionais.nome || email.split('@')[0],
        telefone: dadosAdicionais.telefone || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'ativo'
      };
      
      debugLog('Criando documento do usuário no Firestore...');
      await setDoc(doc(db, 'usuarios', firebaseUser.uid), userData);
      debugLog('Documento do usuário criado com sucesso');

      // Criar clínica se fornecida
      let clinicaData = null;
      if (dadosAdicionais.clinica) {
        debugLog('Iniciando criação da clínica...');
        try {
          clinicaData = await criarClinica(
            dadosAdicionais.clinica, 
            firebaseUser.uid, 
            userData.nome
          );
          debugLog('Clínica criada com sucesso:', clinicaData);

          // Atualizar usuário com ID da clínica
          debugLog('Atualizando usuário com ID da clínica...');
          await updateDoc(doc(db, 'usuarios', firebaseUser.uid), {
            lastClinicaId: clinicaData.id
          });
          debugLog('Usuário atualizado com ID da clínica');
        } catch (clinicaError) {
          console.error('Erro ao criar clínica durante registro:', clinicaError);
          debugLog('Erro na criação da clínica:', clinicaError.message);
          
          // Se falhar na criação da clínica, ainda permitir o registro do usuário
          // mas informar o erro
          toast.error(`Usuário criado, mas houve erro na clínica: ${clinicaError.message}`);
          
          // Importante: não fazer throw aqui para não travar o sistema
          // O usuário foi criado com sucesso, mesmo sem a clínica
        }
      }

      const userCompleto = {
        id: firebaseUser.uid,
        ...userData,
        clinica: clinicaData,
        clinicaRole: clinicaData ? 'owner' : null,
        permissions: clinicaData ? ['all'] : [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Persistir no localStorage
      localStorage.setItem('currentUser', JSON.stringify(userCompleto));
      
      setUser(firebaseUser);
      setUserProfile(userCompleto);
      setCurrentUser(userCompleto);
      
      debugLog('Registro completo realizado com sucesso');
      
      if (clinicaData) {
        toast.success('Conta e clínica criadas com sucesso!');
      } else {
        toast.success('Conta criada com sucesso! Você pode criar uma clínica depois.');
      }
      
      return userCompleto;
    } catch (error) {
      console.error('Erro no registro:', error);
      debugLog('Erro detalhado no registro:', error.message);
      
      let errorMessage = 'Erro ao criar conta';
      
      // Tratamento mais específico de erros
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este email já está em uso. Tente fazer login.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Operação não permitida. Contate o suporte.';
            break;
          case 'permission-denied':
            errorMessage = 'Erro de permissão no banco de dados. Verifique as configurações.';
            break;
          case 'unavailable':
            errorMessage = 'Serviço temporariamente indisponível. Tente novamente.';
            break;
          default:
            errorMessage = `Erro do Firebase: ${error.message}`;
        }
      } else {
        // Erro customizado
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // IMPORTANTE: Não fazer throw para evitar tela branca
      // Em vez disso, retornar um objeto de erro
      debugLog('Retornando erro controlado para evitar crash');
      return { error: true, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar clínicas do usuário
  const getUsuarioClinicas = async (userId) => {
    try {
      debugLog(`Buscando clínicas do usuário: ${userId}`);
      
      // Buscar clínicas onde o usuário é owner
      const ownerQuery = query(
        collection(db, 'clinicas'),
        where('ownerId', '==', userId),
        where('status', '==', 'ativa')
      );
      const ownerSnapshot = await getDocs(ownerQuery);
      
      const clinicas = [];
      for (const clinicaDoc of ownerSnapshot.docs) {
        const clinicaData = clinicaDoc.data();
        clinicas.push({
          id: clinicaDoc.id,
          ...clinicaData,
          userRole: 'owner',
          createdAt: clinicaData.createdAt?.toDate().toISOString(),
          updatedAt: clinicaData.updatedAt?.toDate().toISOString()
        });
      }

      // TODO: Buscar clínicas onde o usuário é colaborador
      // Isso pode ser implementado futuramente

      debugLog(`Encontradas ${clinicas.length} clínicas`);
      return clinicas;
    } catch (error) {
      console.error('Erro ao buscar clínicas do usuário:', error);
      return [];
    }
  };

  // Função para trocar de clínica
  const trocarClinica = async (clinicaId) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado');

      debugLog(`Trocando para clínica: ${clinicaId}`);

      const clinicaData = await getClinicaData(clinicaId);
      if (!clinicaData) throw new Error('Clínica não encontrada');

      // Verificar acesso
      let acessoData = null;
      const acessoDoc = await getDoc(doc(db, 'clinicas', clinicaId, 'usuarios', currentUser.id));
      
      if (acessoDoc.exists() && acessoDoc.data().status === 'ativo') {
        acessoData = acessoDoc.data();
      } else {
        // Verificar se é owner
        if (clinicaData.ownerId === currentUser.id) {
          acessoData = { role: 'owner', permissions: ['all'] };
        }
      }

      if (!acessoData) {
        throw new Error('Usuário não tem acesso a esta clínica');
      }

      // Atualizar último acesso
      await updateDoc(doc(db, 'usuarios', currentUser.id), {
        lastClinicaId: clinicaId,
        lastLogin: serverTimestamp()
      });

      const userAtualizado = {
        ...currentUser,
        clinica: clinicaData,
        clinicaRole: acessoData.role,
        permissions: acessoData.permissions || []
      };

      // Atualizar localStorage
      localStorage.setItem('currentUser', JSON.stringify(userAtualizado));

      setUserProfile(userAtualizado);
      setCurrentUser(userAtualizado);
      
      debugLog('Clínica trocada com sucesso');
      toast.success(`Clínica alterada para ${clinicaData.nome}`);
      return userAtualizado;
    } catch (error) {
      console.error('Erro ao trocar clínica:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      debugLog('Realizando logout');
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setCurrentUser(null);
      // Limpar localStorage
      localStorage.removeItem('currentUser');
      debugLog('Logout realizado com sucesso');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
      throw error;
    }
  };

  // Função para resetar senha
  const resetPassword = async (email) => {
    try {
      debugLog(`Enviando email de recuperação para: ${email}`);
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperação enviado!');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      let errorMessage = 'Erro ao enviar email de recuperação';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado com este email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Listener para mudanças de autenticação
  useEffect(() => {
    debugLog('Configurando listener de autenticação');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        
        if (firebaseUser) {
          debugLog('Usuário Firebase detectado:', { uid: firebaseUser.uid });
          
          // Tentar recuperar do localStorage primeiro para evitar tela branca
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.id === firebaseUser.uid) {
                debugLog('Dados do localStorage carregados');
                setUser(firebaseUser);
                setUserProfile(parsedUser);
                setCurrentUser(parsedUser);
                setLoading(false);
                return; // Exit early para evitar requests desnecessários
              }
            } catch (e) {
              debugLog('Erro ao parsear dados do localStorage, continuando com Firebase');
            }
          }

          // Buscar dados do Firestore se localStorage não estiver disponível/válido
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            debugLog('Dados do usuário carregados do Firestore');
            
            // Buscar última clínica acessada
            let clinicaData = null;
            let clinicaAcesso = null;

            if (userData.lastClinicaId) {
              debugLog(`Carregando última clínica: ${userData.lastClinicaId}`);
              clinicaData = await getClinicaData(userData.lastClinicaId);
              
              if (clinicaData) {
                // Verificar se ainda tem acesso
                const acessoDoc = await getDoc(doc(db, 'clinicas', userData.lastClinicaId, 'usuarios', firebaseUser.uid));
                
                if (acessoDoc.exists() && acessoDoc.data().status === 'ativo') {
                  clinicaAcesso = acessoDoc.data();
                } else if (clinicaData.ownerId === firebaseUser.uid) {
                  clinicaAcesso = { role: 'owner', permissions: ['all'] };
                }
              }
            }

            // Se não tem acesso à última clínica, buscar primeira disponível
            if (!clinicaData || !clinicaAcesso) {
              debugLog('Buscando primeira clínica disponível');
              const clinicasQuery = query(
                collection(db, 'clinicas'),
                where('ownerId', '==', firebaseUser.uid),
                where('status', '==', 'ativa')
              );
              const clinicasSnapshot = await getDocs(clinicasQuery);
              
              if (!clinicasSnapshot.empty) {
                const firstClinica = clinicasSnapshot.docs[0];
                clinicaData = { 
                  id: firstClinica.id, 
                  ...firstClinica.data(),
                  createdAt: firstClinica.data().createdAt?.toDate().toISOString(),
                  updatedAt: firstClinica.data().updatedAt?.toDate().toISOString()
                };
                clinicaAcesso = { role: 'owner', permissions: ['all'] };
              }
            }

            const userCompleto = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData,
              clinica: clinicaData,
              clinicaRole: clinicaAcesso?.role || 'user',
              permissions: clinicaAcesso?.permissions || [],
              createdAt: userData.createdAt?.toDate().toISOString(),
              lastLogin: userData.lastLogin?.toDate().toISOString()
            };

            // Salvar no localStorage
            localStorage.setItem('currentUser', JSON.stringify(userCompleto));

            setUser(firebaseUser);
            setUserProfile(userCompleto);
            setCurrentUser(userCompleto);
            
            debugLog('Estado do usuário atualizado com sucesso');
          } else {
            // Usuário sem perfil - logout
            debugLog('Usuário sem perfil encontrado, fazendo logout');
            await signOut(auth);
          }
        } else {
          // Usuário deslogado
          debugLog('Usuário deslogado');
          setUser(null);
          setUserProfile(null);
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Erro no listener de autenticação:', error);
        // Em caso de erro, limpar tudo para evitar estado inconsistente
        setUser(null);
        setUserProfile(null);
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      debugLog('Removendo listener de autenticação');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    currentUser,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    getUsuarioClinicas,
    trocarClinica,
    criarClinica
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
