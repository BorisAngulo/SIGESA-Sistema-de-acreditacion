import React, { useState, useEffect } from 'react';
import { X, Calendar, User, ExternalLink, FileText, Download, Edit3, Save, MessageSquare, Trash2, CheckCircle } from 'lucide-react';
import { downloadDocumento, updateObservacionFase, updateObservacionSubfase, updateUrlFaseRespuesta, updateUrlSubfaseRespuesta, eliminarDocumentoDeFase, eliminarDocumentoDeSubfase, updateFase, updateSubfase, getAvanceFase } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ModalDetallesFase.css';
import useToast from '../hooks/useToast';

const ModalDetallesFase = ({ isOpen, onClose, fase, subfase, tipo, documentosAsociados }) => {
  const [editandoObservacion, setEditandoObservacion] = useState(false);
  const [observacionTemp, setObservacionTemp] = useState('');
  const [guardandoObservacion, setGuardandoObservacion] = useState(false);
  const [editandoUrlRespuesta, setEditandoUrlRespuesta] = useState(false);
  const [urlRespuestaTemp, setUrlRespuestaTemp] = useState('');
  const [guardandoUrlRespuesta, setGuardandoUrlRespuesta] = useState(false);
  const [eliminandoDocumentos, setEliminandoDocumentos] = useState(new Set());
  const [aprobando, setAprobando] = useState(false);
  const [avanceFase, setAvanceFase] = useState(null);
  const [cargandoAvance, setCargandoAvance] = useState(false);
  const toast = useToast();
  
  const { user } = useAuth();

  // Definir data antes de usarla en los useEffect
  const data = tipo === 'fase' ? fase : subfase;

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

  // Cargar el avance de la fase cuando se abre el modal
  useEffect(() => {
    const cargarAvanceFase = async () => {
      if (isOpen && tipo === 'fase' && data?.id) {
        setCargandoAvance(true);
        try {
          const avance = await getAvanceFase(data.id);
          setAvanceFase(avance);
        } catch (error) {
          console.error('Error al cargar avance de fase:', error);
        } finally {
          setCargandoAvance(false);
        }
      }
    };

    cargarAvanceFase();
  }, [isOpen, tipo, data?.id]);

  if (!isOpen) return null;
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

  // Función para verificar si el usuario puede editar observaciones
  const puedeEditarObservaciones = () => {
    const userRole = user?.roles?.[0]?.name;
    return userRole === 'Admin' || userRole === 'Tecnico';
  };

  // Función para iniciar edición de observación
  const iniciarEdicionObservacion = () => {
    const observacionActual = tipo === 'fase' ? data?.observacionFase : data?.observacionSubfase;
    setObservacionTemp(observacionActual || '');
    setEditandoObservacion(true);
  };

  // Función para cancelar edición
  const cancelarEdicionObservacion = () => {
    setEditandoObservacion(false);
    setObservacionTemp('');
  };

  // Función para guardar observación
  const guardarObservacion = async () => {
    setGuardandoObservacion(true);
    try {
      if (tipo === 'fase') {
        await updateObservacionFase(data.id, observacionTemp);
        // Actualizar el dato local
        fase.observacionFase = observacionTemp;
      } else {
        await updateObservacionSubfase(data.id, observacionTemp);
        // Actualizar el dato local
        subfase.observacionSubfase = observacionTemp;
      }
      
      setEditandoObservacion(false);
      setObservacionTemp('');
      
    } catch (error) {
      console.error('Error al guardar observación:', error);
      alert('Error al guardar la observación: ' + error.message);
    } finally {
      setGuardandoObservacion(false);
    }
  };

  // Funciones para manejar URL de respuesta
  const puedeEditarUrlRespuesta = () => {
    return user && user.roles && user.roles[0] && user.roles[0].name === 'Coordinador';
  };

  // Función para verificar si puede ver metadatos
  const puedeVerMetadatos = () => {
    return user && user.roles && user.roles[0] && 
           (user.roles[0].name === 'Admin' || user.roles[0].name === 'Tecnico');
  };

  const iniciarEdicionUrlRespuesta = () => {
    // Probar ambas nomenclaturas para compatibilidad
    const urlActual = tipo === 'fase' 
      ? (data?.urlFaseRespuesta || data?.url_fase_respuesta)
      : (data?.urlSubfaseRespuesta || data?.url_subfase_respuesta);
    setUrlRespuestaTemp(urlActual || '');
    setEditandoUrlRespuesta(true);
  };

  const cancelarEdicionUrlRespuesta = () => {
    setEditandoUrlRespuesta(false);
    setUrlRespuestaTemp('');
  };

  const guardarUrlRespuesta = async () => {
    setGuardandoUrlRespuesta(true);
    try {
      if (tipo === 'fase') {
        await updateUrlFaseRespuesta(data.id, urlRespuestaTemp);
        // Actualizar ambas nomenclaturas para compatibilidad
        fase.urlFaseRespuesta = urlRespuestaTemp;
        fase.url_fase_respuesta = urlRespuestaTemp;
      } else {
        await updateUrlSubfaseRespuesta(data.id, urlRespuestaTemp);
        // Actualizar ambas nomenclaturas para compatibilidad
        subfase.urlSubfaseRespuesta = urlRespuestaTemp;
        subfase.url_subfase_respuesta = urlRespuestaTemp;
      }
      
      setEditandoUrlRespuesta(false);
      setUrlRespuestaTemp('');
      
    } catch (error) {
      console.error('Error al guardar URL de respuesta:', error);
      alert('Error al guardar la URL de respuesta: ' + error.message);
    } finally {
      setGuardandoUrlRespuesta(false);
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

  const handleEliminarDocumento = async (documento) => {
    const nombreDocumento = documento.nombre_documento || documento.nombre || 'Sin nombre';
    const tipoElemento = tipo === 'fase' ? 'fase' : 'subfase';
    
    // Confirmar eliminación
    const confirmacion = window.confirm(
      `¿Está seguro de que desea eliminar la asociación del documento "${nombreDocumento}" con esta ${tipoElemento}?\n\n` +
      `Esta acción eliminará únicamente la asociación, el documento permanecerá en el sistema.`
    );
    
    if (!confirmacion) return;

    try {
      // Agregar documento al set de eliminando
      setEliminandoDocumentos(prev => new Set([...prev, documento.id]));
      
      const data = tipo === 'fase' ? fase : subfase;
      
      if (tipo === 'fase') {
        await eliminarDocumentoDeFase(data.id, documento.id);
      } else {
        await eliminarDocumentoDeSubfase(data.id, documento.id);
      }
      
      toast.success(`La asociación del documento "${nombreDocumento}" ha sido eliminada exitosamente.`);
      
      // Notificar al componente padre para recargar datos si es necesario
      if (onClose) {
        onClose(true); // Pasar true para indicar que hubo cambios
      }
      
    } catch (error) {
      console.error('❌ Error al eliminar asociación de documento:', error);
      toast.error('Error al eliminar la asociación del documento: ' + (error.message || 'Error desconocido'));
    } finally {
      // Remover documento del set de eliminando
      setEliminandoDocumentos(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(documento.id);
        return newSet;
      });
    }
  };

  // Función para verificar si el usuario puede aprobar
  const puedeAprobar = () => {
    const userRole = user?.roles?.[0]?.name;
    return userRole === 'Admin' || userRole === 'Tecnico' || userRole === 'Coordinador';
  };

  // Función para aprobar fase/subfase
  const aprobarElemento = async () => {
    const confirmacion = window.confirm(
      `¿Está seguro de que desea aprobar esta ${tipo}?\n\nEsta acción cambiará el estado a "Completo".`
    );
    
    if (!confirmacion) return;

    setAprobando(true);
    try {
      const data = tipo === 'fase' ? fase : subfase;
      
      if (tipo === 'fase') {
        await updateFase(data.id, { estado_fase: true });
        // Actualizar el dato local
        fase.estado_fase = true;
        fase.estadoFase = true; // Mantener ambos para compatibilidad
      } else {
        await updateSubfase(data.id, { estado_subfase: true });
        // Actualizar el dato local
        subfase.estado_subfase = true;
        subfase.estadoSubfase = true; // Mantener ambos para compatibilidad
      }

      toast.success(`La ${tipo} ha sido aprobada exitosamente.`);

      // Si es una subfase, recargar el avance de la fase padre
      if (tipo === 'subfase' && data?.faseId) {
        try {
          await getAvanceFase(data.faseId);
        } catch (error) {
          console.error('Error al recargar avance de fase padre:', error);
        }
      }

      // Notificar al componente padre para recargar datos si es necesario
      if (onClose) {
        onClose(true); // Pasar true para indicar que hubo cambios
      }
      
    } catch (error) {
      console.error(`❌ Error al aprobar ${tipo}:`, error);
      toast.error(`Error al aprobar la ${tipo}: ` + (error.message || 'Error desconocido'));
    } finally {
      setAprobando(false);
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
                <div className="info-value-fase-container">
                  <span className="info-value-fase">{data?.nombre || 'Sin nombre'}</span>
                  {tipo === 'subfase' && (
                    <div className="subfase-badges-modal">
                      {data?.tiene_foda && (
                        <span className="analysis-badge foda-badge" title="Análisis FODA habilitado">
                          FODA
                        </span>
                      )}
                      {data?.tiene_plame && (
                        <span className="analysis-badge plame-badge" title="Matriz PLAME habilitada">
                          PLAME
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="info-item full-width">
                <label>Descripción:</label>
                <span className="info-value-fase description-fase">
                  {data?.descripcion || 'Sin descripción'}
                </span>
              </div>

              {/* Mostrar URL dependiendo del tipo */}
              <div className="info-item full-width">
                <label>URL de Google Drive:</label>
                {((tipo === 'fase' && data?.urlFase) || (tipo === 'subfase' && (data?.url_subfase || data?.urlDrive))) ? (
                  <a 
                    href={tipo === 'fase' ? data.urlFase : (data.url_subfase || data.urlDrive)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="url-link"
                  >
                    <ExternalLink size={16} />
                    {tipo === 'fase' ? data.urlFase : (data.url_subfase || data.urlDrive)}
                  </a>
                ) : (
                  <span className="info-value-fase">No hay URL configurada</span>
                )}
              </div>

              <div className="info-item">
                <label>Estado:</label>
                <span className={`estado-badge ${
                  tipo === 'fase' 
                    ? ((data?.estadoFase || data?.estado_fase) ? 'completo' : 'en-proceso') 
                    : ((data?.estadoSubfase || data?.estado_subfase) ? 'completo' : 'en-proceso')
                }`}>
                  {tipo === 'fase' 
                    ? ((data?.estadoFase || data?.estado_fase) ? 'Completo' : 'En proceso') 
                    : ((data?.estadoSubfase || data?.estado_subfase) ? 'Completo' : 'En proceso')
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="detalles-section fechas-section">
            <h3 className="section-title fechas-title">
              <Calendar size={20} />
              Fechas
            </h3>
            <div className="info-grid fechas-grid">
              <div className="info-item">
                <label>Fecha de Inicio:</label>
                <span className="info-value-fecha">{formatDate(data?.fechaInicio)}</span>
              </div>
              
              <div className="info-item">
                <label>Fecha de Fin:</label>
                <span className="info-value-fecha">{formatDate(data?.fechaFin)}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="detalles-section">
            <h3 className="section-title">
              <MessageSquare size={20} />
              Observaciones
              {puedeEditarObservaciones() && !editandoObservacion && (
                <button 
                  onClick={iniciarEdicionObservacion}
                  className="edit-observacion-btn"
                  title="Editar observación"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </h3>
            
            <div className="observacion-container">
              {editandoObservacion ? (
                <div className="observacion-edit">
                  <textarea
                    value={observacionTemp}
                    onChange={(e) => setObservacionTemp(e.target.value)}
                    placeholder="Escriba sus observaciones aquí..."
                    className="observacion-textarea"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="observacion-actions">
                    <button 
                      onClick={guardarObservacion}
                      disabled={guardandoObservacion}
                      className="btn-guardar"
                    >
                      <Save size={16} />
                      {guardandoObservacion ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button 
                      onClick={cancelarEdicionObservacion}
                      className="btn-cancelar"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="observacion-display">
                  <p className="observacion-text">
                    {(tipo === 'fase' ? data?.observacionFase : data?.observacionSubfase) || 
                     'No hay observaciones registradas'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* URL de Respuesta */}
          <div className="detalles-section">
            <h3 className="section-title">
              <ExternalLink size={20} />
              URL de Respuesta
              {puedeEditarUrlRespuesta() && !editandoUrlRespuesta && (
                <button 
                  onClick={iniciarEdicionUrlRespuesta}
                  className="edit-observacion-btn"
                  title="Editar URL de respuesta"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </h3>
            
            <div className="observacion-container">
              {editandoUrlRespuesta ? (
                <div className="observacion-edit">
                  <input
                    type="url"
                    value={urlRespuestaTemp}
                    onChange={(e) => setUrlRespuestaTemp(e.target.value)}
                    placeholder="https://ejemplo.com/respuesta"
                    className="url-input"
                  />
                  <div className="observacion-actions">
                    <button 
                      onClick={guardarUrlRespuesta}
                      disabled={guardandoUrlRespuesta}
                      className="btn-guardar"
                    >
                      <Save size={16} />
                      {guardandoUrlRespuesta ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button 
                      onClick={cancelarEdicionUrlRespuesta}
                      className="btn-cancelar"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="observacion-display">
                  {/* Probar ambas nomenclaturas para compatibilidad */}
                  {(tipo === 'fase' ? (data?.urlFaseRespuesta || data?.url_fase_respuesta) : (data?.urlSubfaseRespuesta || data?.url_subfase_respuesta)) ? (
                    <a 
                      href={tipo === 'fase' ? (data?.urlFaseRespuesta || data?.url_fase_respuesta) : (data?.urlSubfaseRespuesta || data?.url_subfase_respuesta)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="url-link"
                    >
                      <ExternalLink size={16} />
                      {tipo === 'fase' ? (data?.urlFaseRespuesta || data?.url_fase_respuesta) : (data?.urlSubfaseRespuesta || data?.url_subfase_respuesta)}
                    </a>
                  ) : (
                    <p className="observacion-text">No hay URL de respuesta configurada</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Metadatos - Solo visible para Admin y Técnico */}
          {puedeVerMetadatos() && (
            <div className="detalles-section metadatos-section">
              <h3 className="section-title metadatos-title">
                <User size={20} />
                Metadatos
              </h3>
              <div className="info-grid metadatos-grid">
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
          )}

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
                      
                      <button
                        className="documento-action-btn delete"
                        onClick={() => handleEliminarDocumento(documento)}
                        title={`Eliminar asociación con ${tipo}`}
                        disabled={eliminandoDocumentos.has(documento.id)}
                      >
                        {eliminandoDocumentos.has(documento.id) ? (
                          <div className="spinner-small" />
                        ) : (
                          <Trash2 size={16} />
                        )}
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
              <h3 className="section-title">Progreso de Subfases</h3>
              {cargandoAvance ? (
                <div className="progress-loading">
                  <span>Cargando avance...</span>
                </div>
              ) : avanceFase ? (
                <div className="progress-info">
                  <div className="progress-details">
                    <span className="progress-label">
                      Subfases completadas: {avanceFase.subfases_completadas} de {avanceFase.total_subfases}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${avanceFase.porcentaje_avance}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{avanceFase.porcentaje_avance}%</span>
                </div>
              ) : (
                <div className="progress-info">
                  <div className="progress-details">
                    <span className="progress-label">
                      No se pudo cargar el avance de la fase
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <span className="progress-text">0%</span>
                </div>
              )}
              <div className="completion-status">
                <span className={`completion-badge ${(data?.estadoFase || data?.estado_fase) ? 'completed' : 'pending'}`}>
                  {(data?.estadoFase || data?.estado_fase) ? 'Fase Aprobada' : 'En progreso'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-detalles-footer">
          {/* Botón de aprobar - Solo visible si el usuario tiene permisos y la fase/subfase no está aprobada */}
          {puedeAprobar() && !((tipo === 'fase' && (data?.estadoFase || data?.estado_fase)) || (tipo === 'subfase' && (data?.estadoSubfase || data?.estado_subfase))) && (
            <button 
              className="btn-aprobar"
              onClick={aprobarElemento}
              disabled={aprobando}
            >
              <CheckCircle size={16} />
              {aprobando ? 'Aprobando...' : 'Aprobar'}
            </button>
          )}
          
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