import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext';
import departamento from '../assets/departamento.png';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout, getUserRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const renderNavLinks = () => {
    if (!isAuthenticated()) {
      return (
        <>
          <NavLink to="/" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
            Inicio
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
            Iniciar Sesión
          </NavLink>
        </>
      );
    }

    const userRole = getUserRole();
    const commonLinks = (
      <NavLink to="/" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
        Inicio
      </NavLink>
    );

    switch (userRole) {
      case 'Admin':
        return (
          <>
            {commonLinks}
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Panel Admin
            </NavLink>
            <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Usuarios
            </NavLink>
            <NavLink to="/facultad" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Facultades
            </NavLink>
            <NavLink to="/reportes" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Reportes
            </NavLink>
          </>
        );
      
      case 'Tecnico':
        return (
          <>
            {commonLinks}
            <NavLink to="/tecnico" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Panel Técnico
            </NavLink>
            <NavLink to="/facultad" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Facultades
            </NavLink>
            <NavLink to="/documentos" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Documentos
            </NavLink>
          </>
        );
      
      case 'Coordinador':
        return (
          <>
            {commonLinks}
            <NavLink to="/coordinador" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Panel Coordinador
            </NavLink>
            <NavLink to="/facultad" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Mi Facultad
            </NavLink>
            <NavLink to="/carreras" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Carreras
            </NavLink>
          </>
        );
      
      case 'General':
        return (
          <>
            {commonLinks}
            <NavLink to="/consultas" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Consultas
            </NavLink>
          </>
        );
      
      default:
        return commonLinks;
    }
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <img src={departamento} alt="Logo general" className="header-logo" />
      </div>

      <nav className="header-nav">
        {renderNavLinks()}
        
        {isAuthenticated() && (
          <div className="user-menu">
            <button 
              className="user-menu-toggle"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-name">{user?.name}</span>
              <span className="user-role">({getUserRole()})</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p className="user-full-name">{user?.name} {user?.lastName}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
                <hr />
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/perfil');
                    setShowUserMenu(false);
                  }}
                >
                  Mi Perfil
                </button>
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
