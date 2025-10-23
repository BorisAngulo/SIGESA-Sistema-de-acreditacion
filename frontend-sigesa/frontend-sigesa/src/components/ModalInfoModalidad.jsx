import React from 'react';
import '../styles/ModalInfoModalidad.css';

const ModalInfoModalidad = ({ 
  isOpen, 
  onClose, 
  modalidad, 
  facultadNombre, 
  carreraNombre 
}) => {
  if (!isOpen) return null;

  const modalidadInfo = {
    'arco-sur': {
      title: 'SISTEMA ARCU SUR',
      subtitle: 'Acreditación Regional de Carreras Universitarias',
      description: 'El Sistema de Acreditación Regional de Carreras Universitarias para el MERCOSUR (ARCU-SUR) es un mecanismo de evaluación y acreditación de la calidad académica de carreras universitarias a nivel regional.',
      objectives: [
        'Promover la calidad de la educación superior en la región',
        'Facilitar la movilidad estudiantil y académica',
        'Fortalecer la integración regional educativa',
        'Establecer estándares comunes de calidad académica'
      ],
      benefits: [
        'Reconocimiento internacional de la carrera',
        'Mejora continua de la calidad académica',
        'Mayor competitividad en el mercado laboral',
        'Acceso a programas de intercambio regional'
      ],
      color: 'blue'
    },
    'ceub': {
      title: 'SISTEMA CEUB',
      subtitle: 'Comité Ejecutivo de la Universidad Boliviana',
      description: 'El CEUB es el organismo rector del Sistema de la Universidad Boliviana, encargado de coordinar y supervisar la calidad académica de las universidades públicas del país.',
      objectives: [
        'Coordinar el sistema universitario boliviano',
        'Garantizar la calidad educativa superior',
        'Promover la investigación científica',
        'Impulsar la extensión universitaria'
      ],
      benefits: [
        'Reconocimiento nacional de la carrera',
        'Coordinación interuniversitaria',
        'Desarrollo académico integral',
        'Fortalecimiento institucional'
      ],
      color: 'green'
    }
  };

  const info = modalidadInfo[modalidad] || modalidadInfo['arco-sur'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${info.color}`}>
          <div className="modal-header-content">
            <div className="title-group">
              <h2 className="modal-title">{info.title}</h2>
              <p className="modal-subtitle">{info.subtitle}</p>
            </div>
            <div className="header-decoration">
              <div className="decoration-circle"></div>
              <div className="decoration-circle small"></div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="selected-info">
            <div className="info-chip">
              <div className="chip-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21V5C19 4.45 18.55 4 18 4H6C5.45 4 5 4.45 5 5V21L12 18L19 21Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="chip-content">
                <span className="info-label">Facultad</span>
                <span className="info-value">{facultadNombre}</span>
              </div>
            </div>
            <div className="info-chip">
              <div className="chip-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 14L21 5L19 3L12 10L8.5 6.5L7 8L12 13L12 14Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="chip-content">
                <span className="info-label">Carrera</span>
                <span className="info-value">{carreraNombre}</span>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>
              <span className="section-icon">📋</span>
              Descripción
            </h3>
            <p>{info.description}</p>
          </div>

          <div className="content-grid">
            <div className="content-card objectives">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <h4>Objetivos Principales</h4>
              </div>
              <ul className="content-list">
                {info.objectives.map((objective, index) => (
                  <li key={index}>
                    <span className="list-bullet">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <div className="content-card benefits">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Beneficios Clave</h4>
              </div>
              <ul className="content-list">
                {info.benefits.map((benefit, index) => (
                  <li key={index}>
                    <span className="list-bullet">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="content-card status-card full-width">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <h4>Estado del Proceso</h4>
              </div>
              <div className="status-content">
                <div className="status-indicators">
                  <div className="status-indicator">
                    <div className="indicator-dot pending"></div>
                    <div className="indicator-info">
                      <span className="indicator-label">Estado Actual</span>
                      <span className="indicator-value">En Evaluación</span>
                    </div>
                  </div>
                  <div className="status-indicator">
                    <div className="indicator-dot active"></div>
                    <div className="indicator-info">
                      <span className="indicator-label">Fase</span>
                      <span className="indicator-value">Revisión de Documentos</span>
                    </div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '45%'}}></div>
                </div>
                <span className="progress-text">45% Completado</span>
              </div>
            </div>

            <div className="content-card history-card full-width">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Historial de Actividades</h4>
              </div>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot active"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h5>Solicitud Enviada</h5>
                      <span className="timeline-date">15 Mar 2024</span>
                    </div>
                    <p>Documentación inicial recibida y en revisión</p>
                    <span className="timeline-user">Admin Sistema</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot completed"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h5>Preparación de Documentos</h5>
                      <span className="timeline-date">28 Feb 2024</span>
                    </div>
                    <p>Recopilación de información académica</p>
                    <span className="timeline-user">Coordinador Facultad</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot completed"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h5>Proceso Iniciado</h5>
                      <span className="timeline-date">15 Feb 2024</span>
                    </div>
                    <p>Aprobación para iniciar acreditación</p>
                    <span className="timeline-user">Decano</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-actions">
            <button className="btn-secondary" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Cerrar
            </button>
            <button className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Descargar Documentos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoModalidad;