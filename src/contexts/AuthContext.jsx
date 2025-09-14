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
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
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

  // Função para buscar dados da clínica
  const getClinicaData = async (clinicaId) => {
    try {
      const clinicaDoc = await getDoc(doc(db, 'clinicas', clinicaId));
      if (clinicaDoc.exists()) {
        return { id: clinicaDoc.id, ...clinicaDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados da clínica:', error);
      return null;
    }
  };

  // Função para criar categorias padrão para uma nova clínica
  const criarCategoriasIniciais = async (clinicaId) => {
    try {
      await setDoc(doc(db, 'clinicas', clinicaId, 'configuracoes', 'categorias'), {
        receitas: ['Consulta', 'Procedimento', 'Convênio', 'Telemedicina', 'Exames'],
        despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal'],
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao criar categorias iniciais:', error);
    }
  };

  // Função para criar profissionais iniciais
  const criarProfissionaisIniciais = async (clinicaId, nomeUsuario) => {
    try {
      // Criar o usuário como primeiro profissional
      await setDoc(doc(db, 'clinicas', clinicaId, 'profissionais', 'prof_inicial'), {
        nome: nomeUsuario,
        especialidade: 'Clínico Geral',
        crm: '',
        email: '',
        telefone: '',
        status: 'ativo',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao criar profissionais iniciais:', error);
    }
  };

  // Função para criar uma nova clínica
  const criarClinica = async (dadosClinica, userId, nomeUsuario) => {
    try {
      const clinicaId = `clinica_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clinicaData = {
        nome: dadosClinica.nome,
        cnpj: dadosClinica.cnpj || '',
        endereco: dadosClinica.endereco || '',
        telefone: dadosClinica.telefone || '',
        email: dadosClinica.email || '',
        ownerId: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'ativa',
        configuracoes: {
          moeda: 'BRL',
          fuso: 'America/Sao_Paulo',
          tema: 'light'
        }
      };

      // Criar documento da clínica
      await setDoc(doc(db, 'clinicas', clinicaId), clinicaData);
      
      // Criar estrutura de permissões do usuário na clínica
      await setDoc(doc(db, 'clinicas', clinicaId, 'usuarios', userId), {
        userId: userId,
        role: 'owner',
        permissions: ['all'],
        addedAt: Timestamp.now(),
        status: 'ativo'
      });

      // Criar categorias e profissionais iniciais
      await Promise.all([
        criarCategoriasIniciais(clinicaId),
        criarProfissionaisIniciais(clinicaId, nomeUsuario)
      ]);

      return { id: clinicaId, ...clinicaData };
    } catch (error) {
      console.error('Erro ao criar clínica:', error);
      throw error;
    }
  };

  // Função de login
  const login = async (email, password, clinicaId = null) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Buscar perfil do usuário
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Perfil de usuário não encontrado');
      }

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        ...userDoc.data()
      };

      // Verificar clínicas disponíveis
      let clinicaData = null;
      let clinicaAcesso = null;

      if (clinicaId) {
        // Verificar acesso à clínica específica
        const acessoDoc = await getDoc(doc(db, 'clinicas', clinicaId, 'usuarios', firebaseUser.uid));
        
        if (acessoDoc.exists() && acessoDoc.data().status === 'ativo') {
          clinicaAcesso = acessoDoc.data();
          clinicaData = await getClinicaData(clinicaId);
        }
        
        if (!clinicaData || !clinicaAcesso) {
          throw new Error('Usuário não tem acesso a esta clínica');
        }
      } else {
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
        }
      }

      // Atualizar último login
      await updateDoc(doc(db, 'usuarios', firebaseUser.uid), {
        lastLogin: Timestamp.now(),
        lastClinicaId: clinicaData?.id || null
      });

      const userCompleto = {
        ...userData,
        clinica: clinicaData,
        clinicaRole: clinicaAcesso?.role || 'user',
        permissions: clinicaAcesso?.permissions || []
      };

      // Persistir no localStorage para uso offline
      localStorage.setItem('currentUser', JSON.stringify(userCompleto));

      setUser(firebaseUser);
      setUserProfile(userCompleto);
      setCurrentUser(userCompleto);
      
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
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Email ou senha incorretos';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Criar documento do usuário
      const userData = {
        email: firebaseUser.email,
        nome: dadosAdicionais.nome || email.split('@')[0],
        telefone: dadosAdicionais.telefone || '',
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        status: 'ativo'
      };
      
      await setDoc(doc(db, 'usuarios', firebaseUser.uid), userData);

      // Criar clínica se fornecida
      let clinicaData = null;
      if (dadosAdicionais.clinica) {
        clinicaData = await criarClinica(
          dadosAdicionais.clinica, 
          firebaseUser.uid, 
          userData.nome
        );

        // Atualizar usuário com ID da clínica
        await updateDoc(doc(db, 'usuarios', firebaseUser.uid), {
          lastClinicaId: clinicaData.id
        });
      }

      const userCompleto = {
        id: firebaseUser.uid,
        ...userData,
        clinica: clinicaData,
        clinicaRole: 'owner',
        permissions: ['all']
      };

      // Persistir no localStorage
      localStorage.setItem('currentUser', JSON.stringify(userCompleto));
      
      setUser(firebaseUser);
      setUserProfile(userCompleto);
      setCurrentUser(userCompleto);
      
      toast.success('Conta criada com sucesso!');
      return userCompleto;
    } catch (error) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Erro ao criar conta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
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

  // Função para buscar clínicas do usuário
  const getUsuarioClinicas = async (userId) => {
    try {
      // Buscar clínicas onde o usuário é owner
      const ownerQuery = query(
        collection(db, 'clinicas'),
        where('ownerId', '==', userId),
        where('status', '==', 'ativa')
      );
      const ownerSnapshot = await getDocs(ownerQuery);
      
      const clinicas = [];
      ownerSnapshot.forEach(doc => {
        clinicas.push({
          id: doc.id,
          ...doc.data(),
          userRole: 'owner'
        });
      });

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

      const clinicaData = await getClinicaData(clinicaId);
      if (!clinicaData) throw new Error('Clínica não encontrada');

      // Verificar acesso
      const acessoDoc = await getDoc(doc(db, 'clinicas', clinicaId, 'usuarios', currentUser.id));
      
      if (!acessoDoc.exists() || acessoDoc.data().status !== 'ativo') {
        throw new Error('Usuário não tem acesso a esta clínica');
      }

      const acessoData = acessoDoc.data();

      // Atualizar último acesso
      await updateDoc(doc(db, 'usuarios', currentUser.id), {
        lastClinicaId: clinicaId,
        lastLogin: Timestamp.now()
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
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setCurrentUser(null);
      // Limpar localStorage
      localStorage.removeItem('currentUser');
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
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperação enviado!');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      let errorMessage = 'Erro ao enviar email de recuperação';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Tentar recuperar do localStorage primeiro
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id === firebaseUser.uid) {
              setUser(firebaseUser);
              setUserProfile(parsedUser);
              setCurrentUser(parsedUser);
              setLoading(false);
              return;
            }
          }

          // Buscar dados do Firestore
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Buscar última clínica acessada
            let clinicaData = null;
            let clinicaAcesso = null;

            if (userData.lastClinicaId) {
              clinicaData = await getClinicaData(userData.lastClinicaId);
              
              if (clinicaData) {
                // Verificar se ainda tem acesso
                const acessoDoc = await getDoc(doc(db, 'clinicas', userData.lastClinicaId, 'usuarios', firebaseUser.uid));
                
                if (acessoDoc.exists() && acessoDoc.data().status === 'ativo') {
                  clinicaAcesso = acessoDoc.data();
                }
              }
            }

            // Se não tem acesso à última clínica, buscar primeira disponível
            if (!clinicaData || !clinicaAcesso) {
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
              }
            }

            const userCompleto = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData,
              clinica: clinicaData,
              clinicaRole: clinicaAcesso?.role || 'user',
              permissions: clinicaAcesso?.permissions || []
            };

            // Salvar no localStorage
            localStorage.setItem('currentUser', JSON.stringify(userCompleto));

            setUser(firebaseUser);
            setUserProfile(userCompleto);
            setCurrentUser(userCompleto);
          } else {
            // Usuário sem perfil - logout
            await signOut(auth);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setUser(null);
          setUserProfile(null);
          setCurrentUser(null);
        }
      } else {
        // Usuário deslogado
        setUser(null);
        setUserProfile(null);
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
