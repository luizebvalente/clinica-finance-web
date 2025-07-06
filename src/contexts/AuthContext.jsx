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
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Flag para alternar entre Firebase real e autenticação mock
const USE_FIREBASE_AUTH = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função de login
  const login = async (email, password) => {
    if (!USE_FIREBASE_AUTH) {
      // Autenticação mock para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 'demo-user',
        email: email,
        nome: 'Usuário Demo',
        role: 'admin',
        clinica: 'Clínica Demo'
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('Login realizado com sucesso!');
      return mockUser;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Buscar dados adicionais do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      
      let userData;
      if (userDoc.exists()) {
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data()
        };
        
        // Atualizar último login
        await updateDoc(doc(db, 'usuarios', firebaseUser.uid), {
          lastLogin: Timestamp.now()
        });
      } else {
        // Criar perfil básico se não existir
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          nome: firebaseUser.email.split('@')[0],
          role: 'user',
          clinica: 'Minha Clínica'
        };
        
        await setDoc(doc(db, 'usuarios', firebaseUser.uid), {
          ...userData,
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now()
        });
      }
      
      setUser(userData);
      toast.success('Login realizado com sucesso!');
      return userData;
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
    if (!USE_FIREBASE_AUTH) {
      // Registro mock
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: Date.now().toString(),
        email: email,
        nome: dadosAdicionais.nome || email.split('@')[0],
        role: 'user',
        clinica: dadosAdicionais.clinica || 'Minha Clínica'
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('Conta criada com sucesso!');
      return mockUser;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Criar documento do usuário no Firestore
      const userData = {
        email: firebaseUser.email,
        nome: dadosAdicionais.nome || email.split('@')[0],
        role: dadosAdicionais.role || 'user',
        clinica: dadosAdicionais.clinica || 'Minha Clínica',
        telefone: dadosAdicionais.telefone || '',
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now()
      };
      
      await setDoc(doc(db, 'usuarios', firebaseUser.uid), userData);
      
      const userCompleto = {
        id: firebaseUser.uid,
        ...userData
      };
      
      setUser(userCompleto);
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

  // Função de logout
  const logout = async () => {
    if (!USE_FIREBASE_AUTH) {
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Logout realizado com sucesso!');
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
      throw error;
    }
  };

  // Função para resetar senha
  const resetPassword = async (email) => {
    if (!USE_FIREBASE_AUTH) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Email de recuperação enviado!');
      return;
    }

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

  // Função de login de demonstração
  const loginDemo = async () => {
    const demoUser = {
      id: 'demo-user',
      email: 'demo@clinica.com',
      nome: 'Dr. João Silva',
      role: 'admin',
      clinica: 'Clínica Demo'
    };
    
    setUser(demoUser);
    toast.success('Modo demonstração ativado!');
    return demoUser;
  };

  // Listener para mudanças de autenticação (apenas Firebase real)
  useEffect(() => {
    if (!USE_FIREBASE_AUTH) {
      // Para modo mock, verificar localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Erro ao carregar usuário salvo:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Usuário logado - buscar dados do Firestore
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          
          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data()
            });
          } else {
            // Criar perfil básico se não existir
            const userData = {
              email: firebaseUser.email,
              nome: firebaseUser.email.split('@')[0],
              role: 'user',
              clinica: 'Minha Clínica',
              createdAt: Timestamp.now(),
              lastLogin: Timestamp.now()
            };
            
            await setDoc(doc(db, 'usuarios', firebaseUser.uid), userData);
            
            setUser({
              id: firebaseUser.uid,
              ...userData
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setUser(null);
        }
      } else {
        // Usuário deslogado
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    loginDemo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

