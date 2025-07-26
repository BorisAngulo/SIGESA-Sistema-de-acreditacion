import React, { useState } from 'react';
import { Eye, EyeOff, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import logoInicio from '../assets/logoInicio.png';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = () => {
    console.log('Cerrando login');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-panels">
          <div className="left-panel">
            <div className="central-logo">
              <img src={logoInicio} alt="SIGESA" className="main-logo-image" />
            </div>
                     
            <div className="info-section">
              <p className="organization">DUEA UMSS</p>
              <p className="system-name">Sistema de Gestión de Acreditación (SIGESA)</p>
            </div>
          </div>

          <div className="right-panel">
            <button onClick={handleClose} className="close-button">
              <X size={24} />
            </button>

            <div className="form-container">
              <h2 className="login-title">Iniciar Sesión</h2>
              <div className="user-avatar">
                <User size={40} />
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    color: '#fca5a5',
                    fontSize: '0.875rem',
                    textAlign: 'center'
                  }}>
                    {error}
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="tu.correo@ejemplo.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    Contraseña:
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input password-input"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                  style={{
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>

            {/*  <button className="forgot-password">
                ¿Olvidaste tu contraseña? Recuperar
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;