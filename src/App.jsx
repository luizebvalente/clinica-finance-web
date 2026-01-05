import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './components/Dashboard/Dashboard';
import ReceitasPage from './components/Receitas/ReceitasPage';
import DespesasPage from './components/Despesas/DespesasPage';
import FluxoCaixaPage from './components/FluxoCaixa/FluxoCaixaPage';
import RelatoriosPageNova from './components/Relatorios/RelatoriosPageNova';
import FiscalPage from './components/Fiscal/FiscalPage';
import ConfiguracoesPage from './components/Configuracoes/ConfiguracoesPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Rota pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="receitas" element={<ReceitasPage />} />
              <Route path="despesas" element={<DespesasPage />} />
              <Route path="fluxo-caixa" element={<FluxoCaixaPage />} />
              <Route path="relatorios" element={<RelatoriosPageNova />} />
              <Route path="fiscal" element={<FiscalPage />} />
              <Route path="configuracoes" element={<ConfiguracoesPage />} />
            </Route>

            {/* Rota padrão - redirecionar para dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

