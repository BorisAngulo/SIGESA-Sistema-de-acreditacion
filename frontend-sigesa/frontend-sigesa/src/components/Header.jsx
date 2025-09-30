import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext';
import departamento from '../assets/departamento.png';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout, getUserRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModalidadesMenu, setShowModalidadesMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [useImageBackground, setUseImageBackground] = useState(true); // Nueva opción para alternar fondo
  const navigate = useNavigate();

  // Referencias para detectar clics fuera de los menús
  const modalidadesAdminRef = useRef(null);
  const modalidadesTecnicoRef = useRef(null);
  const adminRef = useRef(null);
  const userMenuRef = useRef(null);

  // Efecto para cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalidadesAdminRef.current && !modalidadesAdminRef.current.contains(event.target)) {
        setShowModalidadesMenu(false);
      }
      if (modalidadesTecnicoRef.current && !modalidadesTecnicoRef.current.contains(event.target)) {
        setShowModalidadesMenu(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const handleModalidadesClick = () => {
    setShowModalidadesMenu(!showModalidadesMenu);
  };

  const handleAdminMenuClick = () => {
    setShowAdminMenu(!showAdminMenu);
  };

  const handleAdminOptionSelect = (route) => {
    setShowAdminMenu(false);
    navigate(route);
  };

  const handleModalidadSelect = (modalidad) => {
    setShowModalidadesMenu(false);
    if (modalidad === 'arco-sur') {
      navigate('/modalidades/arco-sur');
    } else if (modalidad === 'ceub') {
      navigate('/modalidades/ceub');
    }
  };

  const renderNavLinks = () => {
    if (!isAuthenticated()) {
      return (
        <>
          <NavLink to="/" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
            Inicio
          </NavLink>
          <NavLink to="/facultad" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Facultades
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
            <div className="modalidades-dropdown" ref={modalidadesAdminRef}>
              <button 
                className="modalidades-toggle header-link"
                onClick={handleModalidadesClick}
              >
                Modalidades
                <span className={`dropdown-arrow ${showModalidadesMenu ? 'open' : ''}`}>▼</span>
              </button>
              
              {showModalidadesMenu && (
                <div className="modalidades-dropdown-menu">
                  <button 
                    className="dropdown-item"
                    onClick={() => handleModalidadSelect('arco-sur')}
                  >
                    ARCU SUR
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleModalidadSelect('ceub')}
                  >
                    CEUB
                  </button>
                </div>
              )}
            </div>
            <div className="modalidades-dropdown" ref={adminRef}>
              <button 
                className="modalidades-toggle header-link"
                onClick={handleAdminMenuClick}
              >
                Administrador
                <span className={`dropdown-arrow ${showAdminMenu ? 'open' : ''}`}>▼</span>
              </button>
              
              {showAdminMenu && (
                <div className="modalidades-dropdown-menu">
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionSelect('/usuarios')}
                  >
                    Usuarios
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionSelect('/actividad')}
                  >
                    Logs
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionSelect('/backups')}
                  >
                    Backups
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionSelect('/documentos')}
                  >
                    Documentos
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionSelect('/carreras-modalidades')}
                  >
                    Carreras-Modalidades
                  </button>
                </div>
              )}
            </div>
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
            <div className="modalidades-dropdown" ref={modalidadesTecnicoRef}>
              <button 
                className="modalidades-toggle header-link"
                onClick={handleModalidadesClick}
              >
                Modalidades
                <span className={`dropdown-arrow ${showModalidadesMenu ? 'open' : ''}`}>▼</span>
              </button>
              
              {showModalidadesMenu && (
                <div className="modalidades-dropdown-menu">
                  <button 
                    className="dropdown-item"
                    onClick={() => handleModalidadSelect('arco-sur')}
                  >
                    ARCU SUR
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleModalidadSelect('ceub')}
                  >
                    CEUB
                  </button>
                </div>
              )}
            </div>
            <NavLink to="/carreras-modalidades" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Carreras-Modalidades
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
            <NavLink to="/mi-facultad" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Mi Carrera
            </NavLink>
            <NavLink to="/documentos" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Documentos
            </NavLink>
            <NavLink to="/facultad" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
              Facultades
            </NavLink>
          </>
        );
    
      
      default:
        return commonLinks;
    }
  };

  return (
    <header className={`header-container ${useImageBackground ? 'header-with-image subtle-waves' : 'header-original'}`}>
      <div className="header-top">
        <img src={departamento} alt="Logo general" className="header-logo" />
        {/* Botón para alternar entre fondos - solo visible para desarrollo */}
        <button 
          className="background-toggle"
          onClick={() => setUseImageBackground(!useImageBackground)}
          title={useImageBackground ? 'Cambiar a fondo original' : 'Cambiar a fondo con imagen'}
        >
          {useImageBackground ? '🎨' : '🖼️'}
        </button>
      </div>
      <div className="header-bottom">
        <nav className="header-nav">
          {renderNavLinks()}
          
          {isAuthenticated() && (
            <div className="user-menu" ref={userMenuRef}>
              <button 
                className="user-menu-toggle"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-name-navbar">{user?.name}</span>
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
      </div>
    </header>
  );
};

export default Header;