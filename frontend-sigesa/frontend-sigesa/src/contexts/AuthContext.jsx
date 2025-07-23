import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verificar el token y obtener información del usuario
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.datos);
      } else {
        // Token inválido, limpiar estado
        logout();
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Intentando login con:', { email, url: 'http://127.0.0.1:8000/api/auth/login' });
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (response.ok && data.exito) {
        const { access_token, user } = data.datos;
        console.log('Usuario recibido:', user);
        setToken(access_token);
        setUser(user);
        localStorage.setItem('token', access_token);
        return { success: true, user: user };
      } else {
        console.error('Error en respuesta del servidor:', data);
        return { 
          success: false, 
          error: data.error || data.mensaje || 'Credenciales inválidas',
          details: data
        };
      }
    } catch (error) {
      console.error('Error de red en login:', error);
      return { 
        success: false, 
        error: 'Error de conexión. Verifica que el servidor esté funcionando.',
        networkError: error.message
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('http://127.0.0.1:8000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  };

  const getUserRole = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }
    return user.roles[0].name; // Asumiendo que un usuario tiene un rol principal
  };

  const hasRole = (role) => {
    const userRole = getUserRole();
    return userRole === role;
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    getUserRole,
    hasRole,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
