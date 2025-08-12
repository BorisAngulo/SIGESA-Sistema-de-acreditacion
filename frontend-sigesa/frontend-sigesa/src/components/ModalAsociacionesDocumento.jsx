import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, FileText, AlertTriangle, Check } from 'lucide-react';
import { getAsociacionesDocumento } from '../services/api';
import '../styles/ModalAsociacionesDocumento.css';

const ModalAsociacionesDocumento = ({ isOpen, onClose, documento }) => {
  const [loading, setLoading] = useState(true);
  const [asociaciones, setAsociaciones] = useState({
    fases: [],
    subfases: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documento) {
      cargarAsociaciones();
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, documento]);

  const cargarAsociaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAsociacionesDocumento(documento.id);
      setAsociaciones(response || { fases: [], subfases: [] });
    } catch (err) {
      console.error('Error al cargar asociaciones:', err);
      setError('Error al cargar las asociaciones del documento');
    } finally {
      setLoading(false);
    }
  };

  const getTipoDocumentoText = (tipoDocumento) => {
    switch (tipoDocumento) {
      case '01':
        return 'Específico';
      case '02':
        return 'General';
      default:
        return 'Desconocido';
    }
  };

  const getTipoDocumentoBadge = (tipoDocumento) => {
    const texto = getTipoDocumentoText(tipoDocumento);
    const className = tipoDocumento === '01' ? 'badge-especifico' : 'badge-general';
    return <span className={`tipo-documento-badge ${className}`}>{texto}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalAsociaciones = asociaciones.fases.length + asociaciones.subfases.length;

  if (!isOpen) return null;

  return (
    <div className="modal-asociaciones-overlay">
      <div className="modal-asociaciones-container">
        <div className="modal-asociaciones-header">
          <div className="modal-title-section">
            <h2>Asociaciones del Documento</h2>
            <p>Visualiza todas las fases y subfases asociadas a este documento</p>
          </div>
          <button 
            onClick={onClose} 
            className="modal-close-button"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-asociaciones-content">
          {/* Información del documento */}
          <div className="documento-info-section">
            <div className="documento-header">
              <div className="documento-title">
                <FileText size={24} />
                <div>
                  <h3>{documento.nombre_documento}</h3>
                  {getTipoDocumentoBadge(documento.tipo_documento)}
                </div>
              </div>
            </div>

            {documento.descripcion_documento && (
              <p className="documento-description">
                {documento.descripcion_documento}
              </p>
            )}

            <div className="documento-details">
              <div className="detail-item">
                <span className="detail-label">Archivo:</span>
                <span>{documento.nombre_archivo_original || 'Sin archivo'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tipo MIME:</span>
                <span className="mime-type">{documento.tipo_mime || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ID:</span>
                <span>#{documento.id}</span>
              </div>
            </div>
          </div>

          {/* Estadísticas de asociaciones */}
          <div className="asociaciones-stats">
            <div className="stat-item">
              <span className="stat-number">{totalAsociaciones}</span>
              <span className="stat-label">Total Asociaciones</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{asociaciones.fases.length}</span>
              <span className="stat-label">Fases</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{asociaciones.subfases.length}</span>
              <span className="stat-label">Subfases</span>
            </div>
          </div>

          {/* Contenido de asociaciones */}
          <div className="asociaciones-content">
            {loading ? (
              <div className="loading-state">
                <p>Cargando asociaciones...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <AlertTriangle size={48} color="#ef4444" />
                <h3>Error al cargar asociaciones</h3>
                <p>{error}</p>
                <button onClick={cargarAsociaciones} className="retry-button">
                  Reintentar
                </button>
              </div>
            ) : totalAsociaciones === 0 ? (
              <div className="no-asociaciones">
                <Users size={48} color="#9ca3af" />
                <h3>Sin asociaciones</h3>
                <p>Este documento no está asociado a ninguna fase o subfase</p>
              </div>
            ) : (
              <div className="asociaciones-sections">
                {/* Fases asociadas */}
                {asociaciones.fases.length > 0 && (
                  <div className="asociacion-section">
                    <h4 className="section-title">
                      <Calendar size={20} />
                      Fases Asociadas ({asociaciones.fases.length})
                    </h4>
                    <div className="asociacion-list">
                      {asociaciones.fases.map((fase) => (
                        <div key={fase.id} className="asociacion-item fase-item">
                          <div className="item-header">
                            <h5>{fase.nombre_fase}</h5>
                            <span className="item-type">Fase</span>
                          </div>
                          
                          {fase.descripcion_fase && (
                            <p className="item-description">{fase.descripcion_fase}</p>
                          )}
                          
                          <div className="item-metadata">
                            <div className="metadata-row">
                              <span className="metadata-label">Periodo:</span>
                              <span>
                                {formatDate(fase.fecha_inicio_fase)} - {formatDate(fase.fecha_fin_fase)}
                              </span>
                            </div>
                            {fase.carrera_modalidad && (
                              <div className="metadata-row">
                                <span className="metadata-label">Carrera-Modalidad:</span>
                                <span>ID: {fase.carrera_modalidad_id}</span>
                              </div>
                            )}
                            <div className="metadata-row">
                              <span className="metadata-label">Estado:</span>
                              <span className={`estado-badge estado-${fase.estado_fase ? 'completado' : 'proceso'}`}>
                                <Check size={12} />
                                {fase.estado_fase ? 'Completado' : 'En Proceso'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subfases asociadas */}
                {asociaciones.subfases.length > 0 && (
                  <div className="asociacion-section">
                    <h4 className="section-title">
                      <Calendar size={20} />
                      Subfases Asociadas ({asociaciones.subfases.length})
                    </h4>
                    <div className="asociacion-list">
                      {asociaciones.subfases.map((subfase) => (
                        <div key={subfase.id} className="asociacion-item subfase-item">
                          <div className="item-header">
                            <h5>{subfase.nombre_subfase}</h5>
                            <span className="item-type">Subfase</span>
                          </div>
                          
                          {subfase.descripcion_subfase && (
                            <p className="item-description">{subfase.descripcion_subfase}</p>
                          )}
                          
                          <div className="item-metadata">
                            <div className="metadata-row">
                              <span className="metadata-label">Periodo:</span>
                              <span>
                                {formatDate(subfase.fecha_inicio_subfase)} - {formatDate(subfase.fecha_fin_subfase)}
                              </span>
                            </div>
                            {subfase.fase && (
                              <div className="metadata-row">
                                <span className="metadata-label">Fase padre:</span>
                                <span>{subfase.fase.nombre_fase}</span>
                              </div>
                            )}
                            <div className="metadata-row">
                              <span className="metadata-label">Estado:</span>
                              <span className={`estado-badge estado-${subfase.estado_subfase ? 'completado' : 'proceso'}`}>
                                <Check size={12} />
                                {subfase.estado_subfase ? 'Completado' : 'En Proceso'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-asociaciones-footer">
          <div className="summary-info">
            <span>
              Mostrando {totalAsociaciones} asociación{totalAsociaciones !== 1 ? 'es' : ''} 
              para el documento "{documento.nombre_documento}"
            </span>
          </div>
          <button onClick={onClose} className="btn-close">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAsociacionesDocumento;
