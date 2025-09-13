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
        return clinicaDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados da clínica:', error);
      return null;
    }
  };

  // Função para criar uma nova clínica
  const criarClinica = async (dadosClinica, userId) => {
    try {
      const clinicaId = `clinica_${Date.now()}`;
      const clinicaData = {
        id: clinicaId,
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

      await setDoc(doc(db, 'clinicas', clinicaId), clinicaData);
      
      // Criar categorias padrão para a clínica
      await setDoc(doc(db, 'clinicas', clinicaId, 'configuracoes', 'categorias'), {
        receitas: ['Consulta', 'Procedimento', 'Convênio', 'Telemedicina', 'Exames'],
        despesas: ['Administrativa', 'Clínica', 'Utilidades', 'Marketing', 'Equipamentos', 'Pessoal']
      });

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
      
      let userData;
      if (userDoc.exists()) {
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data()
        };

        // Verificar se o usuário tem acesso à clínica especificada
        let clinicaData = null;
        let clinicaAcesso = null;

        if (clinicaId) {
          // Verificar acesso à clínica específica
          const acessoQuery = query(
            collection(db, 'clinicas', clinicaId, 'usuarios'),
            where('userId', '==', firebaseUser.uid),
            where('status', '==', 'ativo')
          );
          const acessoSnapshot = await getDocs(acessoQuery);
          
          if (!acessoSnapshot.empty) {
            clinicaAcesso = acessoSnapshot.docs[0].data();
            clinicaData = await getClinicaData(clinicaId);
          } else {
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

        if (!clinicaData) {
          throw new Error('Nenhuma clínica encontrada para este usuário');
        }

        // Atualizar último login
        await updateDoc(doc(db, 'usuarios', firebaseUser.uid), {
          lastLogin: Timestamp.now(),
          lastClinicaId: clinicaData.id
        });

        const userCompleto = {
          ...userData,
          clinica: clinicaData,
          clinicaRole: clinicaAcesso.role || 'user',
          permissions: clinicaAcesso.permissions || []
        };

        setUser(firebaseUser);
        setUserProfile(userCompleto);
        setCurrentUser(userCompleto);
        
        toast.success(`Bem-vindo à ${clinicaData.nome}!`);
        return userCompleto;
      } else {
        throw new Error('Perfil de usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
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
        clinicaData = await criarClinica(dadosAdicionais.clinica, firebaseUser.uid);
        
        // Adicionar usuário como owner da clínica
        await setDoc(doc(db, 'clinicas', clinicaData.id, 'usuarios', firebaseUser.uid), {
          userId: firebaseUser.uid,
          role: 'owner',
          permissions: ['all'],
          addedAt: Timestamp.now(),
          status: 'ativo'
        });

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

      // TODO: Buscar clínicas onde o usuário tem acesso (mas não é owner)
      // Isso seria para funcionários que têm acesso a múltiplas clínicas

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
      const acessoQuery = query(
        collection(db, 'clinicas', clinicaId, 'usuarios'),
        where('userId', '==', currentUser.id),
        where('status', '==', 'ativo')
      );
      const acessoSnapshot = await getDocs(acessoQuery);
      
      if (acessoSnapshot.empty) {
        throw new Error('Usuário não tem acesso a esta clínica');
      }

      const acessoData = acessoSnapshot.docs[0].data();

      // Atualizar último acesso
      await updateDoc(doc(db, 'usuarios', currentUser.id), {
        lastClinicaId: clinicaId,
        lastLogin: Timestamp.now()
      });

      const userAtualizado = {
        ...currentUser,
        clinica: { id: clinicaId, ...clinicaData },
        clinicaRole: acessoData.role,
        permissions: acessoData.permissions || []
      };

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
          // Usuário logado - buscar dados do Firestore
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
                const acessoQuery = query(
                  collection(db, 'clinicas', userData.lastClinicaId, 'usuarios'),
                  where('userId', '==', firebaseUser.uid),
                  where('status', '==', 'ativo')
                );
                const acessoSnapshot = await getDocs(acessoQuery);
                
                if (!acessoSnapshot.empty) {
                  clinicaAcesso = acessoSnapshot.docs[0].data();
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

            setUser(firebaseUser);
            setUserProfile(userCompleto);
            setCurrentUser(userCompleto);
          } else {
            // Usuário sem perfil - logout
            setUser(null);
            setUserProfile(null);
            setCurrentUser(null);
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
