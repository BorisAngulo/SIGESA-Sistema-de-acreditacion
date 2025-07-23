import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login exitoso, usuario:', result.user);
        // Redirigir según el rol del usuario
        const userRole = result.user.roles && result.user.roles.length > 0 
          ? result.user.roles[0].name 
          : 'General';
        
        console.log('Rol del usuario:', userRole);
        
        switch (userRole) {
          case 'Admin':
            navigate('/admin');
            break;
          case 'Tecnico':
            navigate('/tecnico');
            break;
          case 'Coordinador':
            navigate('/coordinador');
            break;
          case 'General':
          default:
            navigate('/');
        }
      } else {
        console.error('Error de login:', result);
        setError(result.error || 'Error en las credenciales');
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      setError(`Error inesperado: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Sistema de Gestión de Acreditación (SIGESA)</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿Olvidaste tu contraseña? <a href="#forgot">Recuperar</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
