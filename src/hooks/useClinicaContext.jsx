import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getReceitas, 
  getDespesas, 
  getCategorias,
  getProfissionais,
  getEstatisticas,
  getClinicaById
} from '../services/firebaseService';

// Hook para gerenciar dados específicos da clínica atual
export const useClinicaContext = () => {
  const { currentUser } = useAuth();
  const [clinicaData, setClinicaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clinicaId = currentUser?.clinica?.id;

  // Função para recarregar dados da clínica
  const reloadClinicaData = useCallback(async () => {
    if (!clinicaId) return null;

    try {
      setLoading(true);
      setError(null);

      const [
        clinicaInfo,
        receitas,
        despesas,
        categorias,
        profissionais,
        estatisticas
      ] = await Promise.all([
        getClinicaById(clinicaId),
        getReceitas(clinicaId),
        getDespesas(clinicaId),
        getCategorias(clinicaId),
        getProfissionais(clinicaId),
        getEstatisticas(clinicaId)
      ]);

      const data = {
        info: clinicaInfo,
        receitas,
        despesas,
        categorias,
        profissionais,
        estatisticas,
        updatedAt: new Date().toISOString()
      };

      setClinicaData(data);
      return data;
    } catch (err) {
      console.error('Erro ao carregar dados da clínica:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  // Carregar dados quando a clínica mudar
  useEffect(() => {
    if (clinicaId) {
      reloadClinicaData();
    } else {
      setClinicaData(null);
    }
  }, [clinicaId, reloadClinicaData]);

  // Função para invalidar cache de dados específicos
  const invalidateData = useCallback(async (dataTypes = ['all']) => {
    if (!clinicaId) return;

    try {
      setLoading(true);
      
      const updates = {};
      
      if (dataTypes.includes('all') || dataTypes.includes('receitas')) {
        updates.receitas = await getReceitas(clinicaId);
      }
      
      if (dataTypes.includes('all') || dataTypes.includes('despesas')) {
        updates.despesas = await getDespesas(clinicaId);
      }
      
      if (dataTypes.includes('all') || dataTypes.includes('categorias')) {
        updates.categorias = await getCategorias(clinicaId);
      }
      
      if (dataTypes.includes('all') || dataTypes.includes('profissionais')) {
        updates.profissionais = await getProfissionais(clinicaId);
      }
      
      if (dataTypes.includes('all') || dataTypes.includes('estatisticas')) {
        updates.estatisticas = await getEstatisticas(clinicaId);
      }

      setClinicaData(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Erro ao atualizar dados da clínica:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clinicaId]);

  // Verificar se o usuário tem permissão específica
  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;
    
    // Owner sempre tem todas as permissões
    if (currentUser.clinicaRole === 'owner') return true;
    
    // Verificar permissões específicas
    const permissions = currentUser.permissions || [];
    return permissions.includes('all') || permissions.includes(permission);
  }, [currentUser]);

  // Verificar se é owner da clínica
  const isOwner = currentUser?.clinicaRole === 'owner';

  // Verificar se a clínica está ativa
  const isClinicaAtiva = currentUser?.clinica?.status === 'ativa';

  return {
    // Dados da clínica
    clinica: currentUser?.clinica,
    clinicaData,
    clinicaId,
    
    // Status
    loading,
    error,
    isOwner,
    isClinicaAtiva,
    
    // Funções
    reloadClinicaData,
    invalidateData,
    hasPermission,
    
    // Dados específicos (shortcuts)
    receitas: clinicaData?.receitas || [],
    despesas: clinicaData?.despesas || [],
    categorias: clinicaData?.categorias || { receitas: [], despesas: [] },
    profissionais: clinicaData?.profissionais || [],
    estatisticas: clinicaData?.estatisticas || {},
    
    // Metadados
    lastUpdated: clinicaData?.updatedAt
  };
};

// Hook para verificar permissões específicas
export const usePermissions = () => {
  const { currentUser } = useAuth();

  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;
    
    // Owner sempre tem todas as permissões
    if (currentUser.clinicaRole === 'owner') return true;
    
    // Verificar permissões específicas
    const permissions = currentUser.permissions || [];
    return permissions.includes('all') || permissions.includes(permission);
  }, [currentUser]);

  const hasAnyPermission = useCallback((permissionList) => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionList) => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner: currentUser?.clinicaRole === 'owner',
    userRole: currentUser?.clinicaRole,
    permissions: currentUser?.permissions || []
  };
};

// Hook para dados específicos com cache inteligente
export const useClinicaData = (dataType) => {
  const { clinicaData, invalidateData, loading, error, clinicaId } = useClinicaContext();
  const [localLoading, setLocalLoading] = useState(false);

  const reload = useCallback(async () => {
    setLocalLoading(true);
    await invalidateData([dataType]);
    setLocalLoading(false);
  }, [invalidateData, dataType]);

  const data = clinicaData?.[dataType] || [];
  const isLoading = loading || localLoading;

  return {
    data,
    loading: isLoading,
    error,
    reload,
    clinicaId,
    lastUpdated: clinicaData?.updatedAt
  };
};

// Componente HOC para proteger rotas com permissões
export const withPermission = (WrappedComponent, requiredPermission) => {
  return function PermissionWrappedComponent(props) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-sm text-gray-600">
              Você não tem permissão para acessar esta funcionalidade.
            </p>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

export default useClinicaContext;
