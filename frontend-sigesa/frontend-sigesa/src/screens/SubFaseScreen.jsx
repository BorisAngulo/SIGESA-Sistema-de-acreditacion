import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SubFaseScreen.css';

const SubFaseScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [descripcion, setDescripcion] = useState('');
  const [respuestaUrl, setRespuestaUrl] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const subfaseData = location.state || {
    faseId: 4,
    faseNombre: 'IES: Elaboración y entrega de la IAE',
    subfaseNombre: 'Inauguración, información, concientización',
    descripcion: 'La subfase cuenta con ciertos requisitos y se trata de hacer acciones para...'
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!respuestaUrl.trim()) {
      newErrors.respuestaUrl = 'La URL de respuesta es requerida';
    } else if (!isValidUrl(respuestaUrl)) {
      newErrors.respuestaUrl = 'Por favor ingrese una URL válida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Formulario enviado:', {
        descripcion,
        respuestaUrl,
        observaciones,
        subfaseData
      });
      
      alert('Respuesta enviada exitosamente');
      navigate(-1);
      
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Error al enviar la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLlenarPlame = () => {
    console.log('Abriendo PLAME...');
    window.open('https://plame.sunedu.gob.pe', '_blank');
  };

  const handleDownloadDoc = (docName) => {
    console.log('Descargando documento:', docName);
    const link = document.createElement('a');
    link.href = '#';
    link.download = docName;
    link.click();
  };

  return (
    <div className="subfase-container">
      <div className="breadcrumb">
        <span>Técnico DUEA</span>
        <span className="separator">&gt;&gt;</span>
        <span>Modalidades</span>
        <span className="separator">&gt;&gt;</span>
        <span>ACREDITACIÓN</span>
        <span className="separator">&gt;&gt;</span>
        <span>Ingeniería de Sistemas</span>
        <span className="separator">&gt;&gt;</span>
        <span className="current">{subfaseData.subfaseNombre}</span>
      </div>

      <div className="subfase-content">
        <div className="subfase-header">
          <div className="header-content">
            <h1 className="subfase-title">
              Subfase - {subfaseData.subfaseNombre}
            </h1>
            <p className="subfase-subtitle">
              Complete el formulario con la información requerida
            </p>
          </div>
          <button 
            className="close-button"
            onClick={() => navigate(-1)}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="subfase-form">
          <div className="form-section">
            <label className="form-label">
              <span className="label-text">Descripción</span>
              <span className="required">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa los requisitos y acciones necesarias para esta subfase..."
              className={`form-textarea ${errors.descripcion ? 'error' : ''}`}
              rows="4"
            />
            {errors.descripcion && (
              <span className="error-message">{errors.descripcion}</span>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">
              <span className="label-text">Matriz</span>
            </label>
            <div className="matriz-section">
              <p className="helper-text">
                Complete la matriz PLAME con la información correspondiente
              </p>
              <button 
                type="button"
                className="btn-plame"
                onClick={handleLlenarPlame}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Llenar PLAME
              </button>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              <span className="label-text">Formatos de Apoyo</span>
            </label>
            <div className="formatos-section">
              <p className="helper-text">
                Descargue los documentos de referencia necesarios
              </p>
              <div className="formatos-grid">
                <button 
                  type="button"
                  className="formato-btn"
                  onClick={() => handleDownloadDoc('Doc1.pdf')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Doc1.pdf
                </button>
                <button 
                  type="button"
                  className="formato-btn"
                  onClick={() => handleDownloadDoc('Doc2.pdf')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Doc2.pdf
                </button>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label" htmlFor="respuesta-url">
              <span className="label-text">URL de Respuesta</span>
              <span className="required">*</span>
            </label>
            <input
              id="respuesta-url"
              type="text"
              value={respuestaUrl}
              onChange={(e) => setRespuestaUrl(e.target.value)}
              placeholder="https://drive.google.com/carpetacompartida"
              className={`form-input ${errors.respuestaUrl ? 'error' : ''}`}
            />
            {errors.respuestaUrl && (
              <span className="error-message">{errors.respuestaUrl}</span>
            )}
            <p className="helper-text">
              Ingrese la URL donde se encuentra la documentación solicitada
            </p>
          </div>

          <div className="form-section">
            <label className="form-label" htmlFor="observaciones">
              <span className="label-text">Observaciones</span>
            </label>
            <div className="observaciones-info">
              <div className="observaciones-header">
                <span className="fecha-observacion">
                  Fecha de observación: 30-04-2024
                </span>
              </div>
              <div className="observaciones-content">
                <p className="observacion-existente">
                  El documento tiene que llenarse con la Matriz adjunta
                </p>
              </div>
            </div>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Agregue observaciones adicionales (opcional)..."
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar Respuesta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubFaseScreen;