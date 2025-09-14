import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Scale, 
  Menu, 
  Bell, 
  Settings, 
  LogOut,
  User,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import ClinicaSelector from '../Clinica/ClinicaSelector';
import toast from 'react-hot-toast';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      path: '/dashboard' 
    },
    { 
      id: 'receitas', 
      label: 'Receitas', 
      icon: DollarSign, 
      path: '/receitas' 
    },
    { 
      id: 'despesas', 
      label: 'Despesas', 
      icon: CreditCard, 
      path: '/despesas' 
    },
    { 
      id: 'fluxo', 
      label: 'Fluxo de Caixa', 
      icon: TrendingUp, 
      path: '/fluxo-caixa' 
    },
    { 
      id: 'relatorios', 
      label: 'Relatórios', 
      icon: FileText, 
      path: '/relatorios' 
    },
    { 
      id: 'fiscal', 
      label: 'Fiscal', 
      icon: Scale, 
      path: '/fiscal' 
    },
    { 
      id: 'configuracoes', 
      label: 'Configurações', 
      icon: Settings, 
      path: '/configuracoes' 
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Se não há clínica selecionada, mostrar tela de seleção
  if (currentUser && !currentUser.clinica) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <Building className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Selecione uma Clínica
            </h2>
            <p className="text-gray-600">
              Você precisa selecionar ou criar uma clínica para continuar.
            </p>
          </div>
          
          <div className="space-y-4">
            <ClinicaSelector />
            
            <div className="pt-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Building className="w-6 h-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-blue-600">Clínica Finance</h1>
          </div>

          {/* Info da Clínica */}
          {currentUser?.clinica && (
            <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {currentUser.clinica.nome}
                  </p>
                  <p className="text-xs text-blue-600">
                    {currentUser.clinicaRole === 'owner' ? 'Proprietário' : 'Usuário'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.nome || currentUser?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Breadcrumb / Título da página */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Seletor de Clínicas */}
              <ClinicaSelector />

              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {currentUser?.nome || currentUser?.email?.split('@')[0]}
                </span>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
