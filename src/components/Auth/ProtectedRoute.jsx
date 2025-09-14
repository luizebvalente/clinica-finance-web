import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
          <p className="text-sm text-gray-500 mt-2">Carregando dados do usuário</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!currentUser) {
    console.log('Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está autenticado mas não tem clínica, mostrar na AppLayout
  // A AppLayout vai lidar com isso mostrando o seletor de clínica
  return children;
};

export default ProtectedRoute;
