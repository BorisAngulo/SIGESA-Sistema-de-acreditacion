import React, { useState } from 'react';
import { Eye, EyeOff, User, X } from 'lucide-react';
import logoIn from '../assets/logoIn.png';
import '../styles/Login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Intento de iniciar sesión:', { email, password });
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
              <img src={logoIn} alt="DUEA UMSS" className="main-logo-image" />
            </div>
            
            <div className="info-section">
              <p className="organization">DUEA UMSS</p>
              <p className="system-name">Sistema de Evaluación y Acreditación</p>
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
                <div className="input-group">
                  <label className="input-label">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="usuario@umss.edu.bo"
                    required
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
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-button">
                  Iniciar Sesión
                </button>
              </form>

              <button className="forgot-password">
                ¿Te olvidaste tu contraseña?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}