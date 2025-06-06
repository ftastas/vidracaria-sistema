import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

// Verifica se o Supabase está configurado
const isSupabaseConfigured = !!supabase;

// Usuário de demonstração
const DEMO_USER = {
  id: '1',
  email: 'admin@vidracaria.com',
  user_metadata: {
    nome: 'Administrador',
    role: 'admin'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        // Se o Supabase não estiver configurado, usa o modo de demonstração
        if (!isSupabaseConfigured) {
          console.log('[DEMO MODE] Usando autenticação simulada');
          
          // Verifica se há um usuário demo no localStorage
          const demoLoggedIn = localStorage.getItem('demo_logged_in') === 'true';
          
          if (demoLoggedIn) {
            setUser(DEMO_USER);
          } else {
            setUser(null);
          }
          
          setLoading(false);
          return;
        }
        
        // Código real para o Supabase
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Configurar listener para mudanças de autenticação (apenas se o Supabase estiver configurado)
    let subscription;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
          setLoading(false);
        }
      );
      subscription = data.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Função para login
  const login = async (email, password) => {
    try {
      // Se o Supabase não estiver configurado, usa o modo de demonstração
      if (!isSupabaseConfigured) {
        console.log('[DEMO MODE] Login simulado');
        
        // Simula verificação de credenciais
        if (email === 'admin@vidracaria.com' && password === 'senha123') {
          localStorage.setItem('demo_logged_in', 'true');
          setUser(DEMO_USER);
          return { success: true, data: { user: DEMO_USER } };
        } else {
          return { success: false, error: 'Credenciais inválidas' };
        }
      }
      
      // Código real para o Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Função para registro
  const register = async (email, password, userData = {}) => {
    try {
      // Se o Supabase não estiver configurado, usa o modo de demonstração
      if (!isSupabaseConfigured) {
        console.log('[DEMO MODE] Registro simulado');
        
        // No modo de demonstração, simula sucesso mas não registra realmente
        localStorage.setItem('demo_logged_in', 'true');
        setUser(DEMO_USER);
        return { success: true, data: { user: DEMO_USER } };
      }
      
      // Código real para o Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Função para logout
  const logout = async () => {
    try {
      // Se o Supabase não estiver configurado, usa o modo de demonstração
      if (!isSupabaseConfigured) {
        console.log('[DEMO MODE] Logout simulado');
        
        localStorage.removeItem('demo_logged_in');
        setUser(null);
        return { success: true };
      }
      
      // Código real para o Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Função para recuperação de senha
  const resetPassword = async (email) => {
    try {
      // Se o Supabase não estiver configurado, usa o modo de demonstração
      if (!isSupabaseConfigured) {
        console.log('[DEMO MODE] Recuperação de senha simulada');
        
        // No modo de demonstração, simula sucesso mas não envia email
        return { success: true };
      }
      
      // Código real para o Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

