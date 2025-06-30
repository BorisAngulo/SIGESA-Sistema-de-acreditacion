import React from 'react';
import departamento from '../assets/departamento.png';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <img src={departamento} alt="Logo general" className="header-logo" />
      <nav className="header-nav">
        <a href="/" className="header-link">Inicio</a>
        <a href="/facultades" className="header-link">Facultades</a>
        <a href="/login" className="header-link">Iniciar Sesión</a>
      </nav>
    </header>
  );
};

export default Header;
