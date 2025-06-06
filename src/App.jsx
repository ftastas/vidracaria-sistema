import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Páginas de autenticação
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Páginas do dashboard
import Dashboard from './pages/dashboard/Dashboard';
import Orcamentos from './pages/dashboard/Orcamentos';
import Financas from './pages/dashboard/Financas';
import OrdensServico from './pages/dashboard/OrdensServico';
import Estoque from './pages/dashboard/Estoque';
import Caixa from './pages/dashboard/Caixa';

// Cria o cliente de consulta para o React Query
const queryClient = new QueryClient();

// Componente para rotas protegidas
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Componente principal da aplicação
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rotas de autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />

            {/* Rotas do dashboard (protegidas) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/orcamentos" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Orcamentos />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/financas" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Financas />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ordens" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OrdensServico />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/estoque" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Estoque />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/caixa" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Caixa />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Rota padrão - redireciona para o dashboard ou login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

