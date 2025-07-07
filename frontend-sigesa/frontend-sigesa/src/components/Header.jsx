import React from 'react';
import { NavLink } from 'react-router-dom'; 
import departamento from '../assets/departamento.png';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <div className="header-left">
        <img src={departamento} alt="Logo general" className="header-logo" />
      </div>

      <nav className="header-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
          Inicio
        </NavLink>
        <NavLink to="/facultad" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
          Facultades
        </NavLink>
        <NavLink to="/login" className={({ isActive }) => isActive ? 'header-link active' : 'header-link'}>
          Iniciar Sesión
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
