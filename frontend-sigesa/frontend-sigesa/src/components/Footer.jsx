import React from 'react';
import { Facebook, MessageCircle, Linkedin } from 'lucide-react';
import logoduea from '../assets/logoDUEA.png';
import './Footer.css';

const Footer = () => {
  const handleSocialClick = (platform) => {
    const urls = {
      facebook: 'https://www.facebook.com/duea.umss.cbba/?locale=es_LA',
      whatsapp: 'https://api.whatsapp.com/send/?text=https%3A%2F%2Fwww.umss.edu.bo%2Fdireccion-universitaria-de-evaluacion-y-acreditacion%2F&type=custom_url&app_absent=0',
      linkedin: 'https://www.linkedin.com/school/umssboloficial/posts/?feedView=all',
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="footer-container">
      {/* Logo inferior izquierda */}
      <div className="footer-logo-section">
        <img src={logoduea} alt="Logo DUEA" className="footer-logo-image" />
        <div className="footer-logo-text">
          Universidad Mayor de San Simón<br />
          Dirección Universitaria de<br />
          Evaluación y Acreditación
        </div>
      </div>

      {/* Contenido principal */}
      <div className="footer-main-content">
        <div className="footer-contact-info">
          <div className="footer-bold-text">Teléfono: (591)-(4)2315864</div>
          <div className="footer-bold-text">Correo: duea@umss.edu.bo</div>
        </div>

        <div className="footer-address">
          Ubicación: Cuarto piso edificio Vicerrectorado Campus Universitario Las Cuadras Final Jordán
        </div>

        <div className="footer-links-row">
          Otros sitios de interés:
          <a href="#" className="footer-link">UMSS</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-link">WebSISS</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-link">DUEA</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-link">Políticas de Privacidad</a>
          <span className="footer-separator">|</span>
          <a href="#" className="footer-link">Términos y Refutación</a>
        </div>

        <div className="footer-copyright">
          Cochabamba - Bolivia | UNIVERSIDAD MAYOR DE SAN SIMÓN ©2025
        </div>
      </div>

      <div className="footer-social-icons">
        <button
          className="footer-social-icon"
          onClick={() => handleSocialClick('facebook')}
          title="Facebook"
        >
          <Facebook size={16} />
        </button>
        <button
          className="footer-social-icon"
          onClick={() => handleSocialClick('whatsapp')}
          title="WhatsApp"
        >
          <MessageCircle size={16} />
        </button>
        <button
          className="footer-social-icon"
          onClick={() => handleSocialClick('linkedin')}
          title="LinkedIn"
        >
          <Linkedin size={16} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
