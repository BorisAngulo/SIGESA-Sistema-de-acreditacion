import React from 'react';
import './ModalInfoModalidad.css';

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
      title: 'SISTEMA ARCO SUR',
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
      ]
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
      ]
    }
  };

  const info = modalidadInfo[modalidad] || modalidadInfo['arco-sur'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">{info.title}</h2>
            <p className="modal-subtitle">{info.subtitle}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="selected-info">
            <div className="info-chip">
              <span className="info-label">Facultad:</span>
              <span className="info-value">{facultadNombre}</span>
            </div>
            <div className="info-chip">
              <span className="info-label">Carrera:</span>
              <span className="info-value">{carreraNombre}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Descripción</h3>
            <p>{info.description}</p>
          </div>

          <div className="content-grid">
            <div className="content-card">
              <div className="card-header">
                <div className="card-icon objectives-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                </div>
                <h4>Objetivos</h4>
              </div>
              <ul className="content-list">
                {info.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            <div className="content-card">
              <div className="card-header">
                <div className="card-icon benefits-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Beneficios</h4>
              </div>
              <ul className="content-list">
                {info.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="content-card full-width">
              <div className="status-section">
                <div className="status-row">
                  <div className="status-item">
                    <span className="status-label">Estado:</span>
                    <span className="status-value empty">-</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Fase:</span>
                    <span className="status-value empty">-</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-card full-width">
              <div className="card-header">
                <div className="card-icon history-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Historial</h4>
              </div>
              <div className="history-container">
                <pre className="history-json">
{`{
  "historial": [
    {
      "fecha": "2024-03-15",
      "accion": "Solicitud de acreditación enviada",
      "estado": "En revisión",
      "usuario": "Admin Sistema",
      "observaciones": "Documentación inicial recibida"
    },
    {
      "fecha": "2024-02-28",
      "accion": "Preparación de documentos",
      "estado": "En proceso",
      "usuario": "Coordinador Facultad",
      "observaciones": "Recopilación de información académica"
    },
    {
      "fecha": "2024-02-15",
      "accion": "Inicio del proceso",
      "estado": "Iniciado",
      "usuario": "Decano",
      "observaciones": "Aprobación para iniciar acreditación"
    }
  ],
  "ultima_actualizacion": "2024-03-15T10:30:00Z",
  "responsable": "Sistema de Acreditación"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-primary">
            Descargar Documentos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoModalidad;