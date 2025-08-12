import React, { useState, useEffect } from 'react';
import { X, Calendar, User, ExternalLink, FileText, Download } from 'lucide-react';
import { downloadDocumento } from '../services/api';
import '../styles/ModalDetallesFase.css';

const ModalDetallesFase = ({ isOpen, onClose, fase, subfase, tipo, documentosAsociados }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const data = tipo === 'fase' ? fase : subfase;
  const titulo = tipo === 'fase' ? 'Detalles de la Fase' : 'Detalles de la Subfase';

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (tipoMime) => {
    if (!tipoMime) return <FileText size={16} />;
    
    if (tipoMime.includes('pdf')) {
      return <FileText size={16} color="#dc2626" />;
    } else if (tipoMime.includes('word') || tipoMime.includes('document')) {
      return <FileText size={16} color="#2563eb" />;
    } else if (tipoMime.includes('image')) {
      return <FileText size={16} color="#059669" />;
    } else if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) {
      return <FileText size={16} color="#16a34a" />;
    } else {
      return <FileText size={16} color="#6b7280" />;
    }
  };

  const getTipoDocumentoText = (tipoDocumento) => {
    switch (tipoDocumento) {
      case '01':
        return 'Específico';
      case '02':
        return 'General';
      default:
        return 'Sin definir';
    }
  };

  const getTipoDocumentoBadge = (tipoDocumento) => {
    const texto = getTipoDocumentoText(tipoDocumento);
    const className = tipoDocumento === '01' ? 'tipo-especifico' : 'tipo-general';
    
    return <span className={`tipo-badge ${className}`}>{texto}</span>;
  };

  const handleDownloadDocument = async (documento) => {
    try {
      console.log('⬇️ Descargando documento:', documento.nombre_documento || documento.nombre);
      await downloadDocumento(documento.id);
    } catch (error) {
      console.error('❌ Error al descargar documento:', error);
      alert('Error al descargar el documento: ' + error.message);
    }
  };

  return (
    <div className="modal-detalles-overlay">
      <div className="modal-detalles-container">
        <div className="modal-detalles-header">
          <h2 className="modal-detalles-title">
            <FileText size={24} />
            {titulo}
          </h2>
          <button 
            className="modal-detalles-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-detalles-content">
          {/* Información básica */}
          <div className="detalles-section">
            <h3 className="section-title">Información General</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nombre:</label>
                <span className="info-value">{data?.nombre || 'Sin nombre'}</span>
              </div>
              
              <div className="info-item full-width">
                <label>Descripción:</label>
                <span className="info-value description">
                  {data?.descripcion || 'Sin descripción'}
                </span>
              </div>

              {data?.urlFase && (
                <div className="info-item full-width">
                  <label>URL:</label>
                  <a 
                    href={data.urlFase} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="url-link"
                  >
                    <ExternalLink size={16} />
                    {data.urlFase}
                  </a>
                </div>
              )}

              <div className="info-item">
                <label>Estado:</label>
                <span className={`estado-badge ${data?.estadoFase ? 'activo' : 'inactivo'}`}>
                  {data?.estadoFase ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="detalles-section">
            <h3 className="section-title">
              <Calendar size={20} />
              Fechas
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Fecha de Inicio:</label>
                <span className="info-value">{formatDate(data?.fechaInicio)}</span>
              </div>
              
              <div className="info-item">
                <label>Fecha de Fin:</label>
                <span className="info-value">{formatDate(data?.fechaFin)}</span>
              </div>
            </div>
          </div>

          {/* Metadatos */}
          <div className="detalles-section">
            <h3 className="section-title">
              <User size={20} />
              Metadatos
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>ID:</label>
                <span className="info-value">{data?.id}</span>
              </div>
              
              {tipo === 'fase' && (
                <div className="info-item">
                  <label>Carrera-Modalidad ID:</label>
                  <span className="info-value">{data?.carreraModalidadId}</span>
                </div>
              )}
              
              {tipo === 'subfase' && (
                <div className="info-item">
                  <label>Fase ID:</label>
                  <span className="info-value">{data?.faseId}</span>
                </div>
              )}
              
              <div className="info-item">
                <label>Creado:</label>
                <span className="info-value">{formatDate(data?.createdAt)}</span>
              </div>
              
              <div className="info-item">
                <label>Actualizado:</label>
                <span className="info-value">{formatDate(data?.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Documentos asociados */}
          <div className="detalles-section">
            <h3 className="section-title">
              <FileText size={20} />
              Documentos Asociados ({documentosAsociados?.length || 0})
            </h3>
            
            {documentosAsociados && documentosAsociados.length > 0 ? (
              <div className="documentos-list">
                {documentosAsociados.map((documento) => (
                  <div key={documento.id} className="documento-item">
                    <div className="documento-icon">
                      {getFileIcon(documento.tipo_mime)}
                    </div>
                    
                    <div className="documento-info">
                      <div className="documento-header">
                        <span className="documento-nombre">
                          {documento.nombre_documento || documento.nombre || 'Sin nombre'}
                        </span>
                        {getTipoDocumentoBadge(documento.tipo_documento)}
                      </div>
                      
                      {(documento.descripcion_documento || documento.descripcion) && (
                        <div className="documento-descripcion">
                          {documento.descripcion_documento || documento.descripcion}
                        </div>
                      )}
                      
                      <div className="documento-metadata">
                        <span className="documento-size">
                          {documento.tamano_archivo ? 
                            `${(documento.tamano_archivo / 1024).toFixed(2)} KB` : 
                            documento.tamano ? 
                            `${(documento.tamano / 1024).toFixed(2)} KB` : 
                            'Tamaño desconocido'
                          }
                        </span>
                        <span className="documento-date">
                          {formatDate(documento.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="documento-actions">
                      <button
                        className="documento-action-btn download"
                        onClick={() => handleDownloadDocument(documento)}
                        title="Descargar documento"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-documentos">
                <FileText size={48} color="#9ca3af" />
                <p>No hay documentos asociados a esta {tipo}</p>
              </div>
            )}
          </div>

          {/* Progreso (solo para fases) */}
          {tipo === 'fase' && (
            <div className="detalles-section">
              <h3 className="section-title">Progreso</h3>
              <div className="progress-info">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${data?.progreso || 0}%` }}
                  ></div>
                </div>
                <span className="progress-text">{data?.progreso || 0}%</span>
              </div>
              <div className="completion-status">
                <span className={`completion-badge ${data?.completada ? 'completed' : 'pending'}`}>
                  {data?.completada ? 'Completada' : 'En progreso'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-detalles-footer">
          <button 
            className="btn-close"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesFase;