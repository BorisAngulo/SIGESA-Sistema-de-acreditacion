import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  GraduationCap, 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Search,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Award,
  Trash2,
} from 'lucide-react';
import { 
  getCarrerasModalidadesConPlame,
  subirCertificadoCarreraModalidad, 
  descargarCertificadoCarreraModalidad,
  eliminarCarreraModalidad,
  getUrlDescargaPlame
} from '../services/api';
import ModalSubirCertificado from '../components/ModalSubirCertificado';
import ModalSubirPlame from '../components/ModalSubirPlame';
import '../styles/CarrerasModalidadesAdmin.css';
import '../styles/ModalGeneral.css';
import '../styles/ModalSubirPlame.css';

const CarrerasModalidadesAdmin = () => {
  const navigate = useNavigate();
  const [carrerasModalidades, setCarrerasModalidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacultad, setSelectedFacultad] = useState('');
  const [selectedModalidad, setSelectedModalidad] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  
  // Estados para modal de certificado
  const [showCertificadoModal, setShowCertificadoModal] = useState(false);
  const [selectedCarreraModalidad, setSelectedCarreraModalidad] = useState(null);
  const [downloadingCertificados, setDownloadingCertificados] = useState(new Set());

  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [carreraModalidadToDelete, setCarreraModalidadToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para modal PLAME
  const [showPlameModal, setShowPlameModal] = useState(false);
  const [selectedCarreraModalidadPlame, setSelectedCarreraModalidadPlame] = useState(null);
  
  // Estados para gestión de documentos PLAME
  const [plameDocuments, setPlameDocuments] = useState({}); // { carreraModalidadId: plameData }
  const [loadingPlame, setLoadingPlame] = useState({}); // { carreraModalidadId: boolean }

  useEffect(() => {
    cargarCarrerasModalidades();
  }, []);

  const cargarCarrerasModalidades = async () => {
    try {
      setLoading(true);
      console.log('🚀 Cargando carreras-modalidades con información de PLAME optimizada...');
      
      // Usar la nueva función optimizada que obtiene todo en una sola petición
      const data = await getCarrerasModalidadesConPlame();
      
      if (data && data.length > 0) {
        console.log('📊 Carreras-modalidades cargadas:', data.length);
        console.log('📄 Con PLAME:', data.filter(cm => cm.tiene_plame).length);
        
        // Mapear los datos para el estado local
        const plameDocuments = {};
        data.forEach(cm => {
          if (cm.tiene_plame && cm.info_plame) {
            plameDocuments[cm.id] = cm.info_plame;
          }
        });
        
        setPlameDocuments(plameDocuments);
        console.log('✅ Documentos PLAME cargados en estado:', Object.keys(plameDocuments).length);
      }
      
      setCarrerasModalidades(data);
    } catch (err) {
      setError('Error al cargar las carreras-modalidades');
      console.error('💥 Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleCarreraModalidadClick = (carreraModalidad) => {
    console.log('Navegando a fases con carrera-modalidad:', carreraModalidad);
    // Navegar a la pantalla de fases con los datos de la carrera-modalidad seleccionada
    navigate('/fases', { 
      state: { 
        carreraModalidad: carreraModalidad,
        carreraId: carreraModalidad.carrera_id,
        modalidadId: carreraModalidad.modalidad_id,
        carreraModalidadId: carreraModalidad.id, // Pasar el ID de la carrera-modalidad existente
        carreraNombre: carreraModalidad.carrera?.nombre,
        facultadNombre: carreraModalidad.carrera?.facultad?.nombre,
        modalidadNombre: carreraModalidad.modalidad?.nombre,
        fromCarrerasModalidadesAdmin: true // Flag para indicar el origen
      } 
    });
  };

  // Funciones para manejo de certificados
  const handleSubirCertificado = (carreraModalidad) => {
    setSelectedCarreraModalidad(carreraModalidad);
    setShowCertificadoModal(true);
  };

  const handleDescargarCertificado = async (carreraModalidad) => {
    try {
      console.log('Descargando certificado para:', carreraModalidad);
      
      setDownloadingCertificados(prev => new Set(prev).add(carreraModalidad.id));
      
      descargarCertificadoCarreraModalidad(
        carreraModalidad.id, 
        carreraModalidad.carrera.nombre, 
        carreraModalidad.modalidad.nombre
      );
    } catch (error) {
      console.error('Error al descargar certificado:', error);
      alert('Error al descargar el certificado: ' + (error.message || 'Error desconocido'));
    } finally {
      setDownloadingCertificados(prev => {
        const newSet = new Set(prev);
        newSet.delete(carreraModalidad.id);
        return newSet;
      });
    }
  };

  const handleUploadCertificado = async (certificadoFile) => {
    try {
      console.log('Subiendo certificado para:', selectedCarreraModalidad);
      
      await subirCertificadoCarreraModalidad(selectedCarreraModalidad.id, certificadoFile);
      
      alert('Certificado subido exitosamente');
      
      // Recargar datos para mostrar el nuevo certificado
      await cargarCarrerasModalidades();
      
    } catch (error) {
      console.error('Error al subir certificado:', error);
      throw error; // Re-lanzar para que el modal lo maneje
    }
  };

  const handleCloseCertificadoModal = () => {
    setShowCertificadoModal(false);
    setSelectedCarreraModalidad(null);
  };

  // Funciones para manejo de eliminación
  const handleShowDeleteModal = (carreraModalidad) => {
    setCarreraModalidadToDelete(carreraModalidad);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCarreraModalidadToDelete(null);
    setDeleteConfirmText('');
  };

  const handleDeleteCarreraModalidad = async () => {
    if (deleteConfirmText !== 'CONFIRMAR' || !carreraModalidadToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await eliminarCarreraModalidad(carreraModalidadToDelete.id);
      
      alert(`Carrera-modalidad eliminada exitosamente: ${carreraModalidadToDelete.carrera?.nombre} - ${carreraModalidadToDelete.modalidad?.nombre}`);
      
      // Recargar los datos
      await cargarCarrerasModalidades();
      
      // Cerrar modal
      handleCloseDeleteModal();
      
    } catch (error) {
      console.error('Error al eliminar carrera-modalidad:', error);
      alert('Error al eliminar la carrera-modalidad: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Funciones para manejar el modal PLAME
  const handleAbrirPlame = (carreraModalidad) => {
    const tieneDocumento = plameDocuments[carreraModalidad.id];
    
    if (tieneDocumento) {
      // Si existe documento, descargar directamente
      handleDescargarPlame(carreraModalidad.id);
    } else {
      // Si no existe, abrir modal para subir
      setSelectedCarreraModalidadPlame(carreraModalidad);
      setShowPlameModal(true);
    }
  };

  const handleCerrarPlame = () => {
    setShowPlameModal(false);
    setSelectedCarreraModalidadPlame(null);
  };

  const handleDescargarPlame = (carreraModalidadId) => {
    const plameDoc = plameDocuments[carreraModalidadId];
    if (plameDoc) {
      const url = getUrlDescargaPlame(plameDoc.id);
      // Abrir en nueva ventana para descargar
      window.open(url, '_blank');
    }
  };

  const handlePlameSubido = (carreraModalidadId, nuevoPlame) => {
    // Actualizar el estado local con el nuevo documento
    setPlameDocuments(prev => ({
      ...prev,
      [carreraModalidadId]: nuevoPlame
    }));
    
    // Cerrar modal
    handleCerrarPlame();
  };

  // Validar que carrerasModalidades sea un array (memoizado)
  const carrerasModalidadesArray = useMemo(() => {
    return Array.isArray(carrerasModalidades) ? carrerasModalidades : [];
  }, [carrerasModalidades]);

  const getEstadoProceso = (carreraModalidad) => {
    const ahora = new Date();
    const fechaInicio = carreraModalidad.fecha_ini_proceso ? new Date(carreraModalidad.fecha_ini_proceso) : null;
    const fechaFin = carreraModalidad.fecha_fin_proceso ? new Date(carreraModalidad.fecha_fin_proceso) : null;
    const estado = carreraModalidad.estado_modalidad;
    if (estado === true) {
      return {
        texto: 'Aprobado',
        clase: 'aprobado',
        icono: <CheckCircle size={12} />
      };
    }

    if (fechaInicio && fechaFin) {
      const enProceso = ahora >= fechaInicio && ahora <= fechaFin;
      
      if (enProceso) {
        return {
          texto: 'En Proceso',
          clase: 'en-proceso',
          icono: <Clock size={12} />
        };
      }
      
      // Si está fuera del proceso y el estado es false, está rechazado
      if (estado === false && ahora > fechaFin) {
        return {
          texto: 'Rechazado',
          clase: 'rechazado',
          icono: <AlertCircle size={12} />
        };
      }
    }

    // Estado por defecto para otros casos
    if (estado === false) {
      return {
        texto: 'Inactivo',
        clase: 'inactivo',
        icono: <AlertCircle size={12} />
      };
    }

    return {
      texto: 'Pendiente',
      clase: 'pendiente',
      icono: <Clock size={12} />
    };
  };

  // Memoizar los estados calculados para evitar recálculos constantes
  const estadosCalculados = useMemo(() => {
    const estados = {};
    carrerasModalidadesArray.forEach(cm => {
      estados[cm.id] = getEstadoProceso(cm);
    });
    return estados;
  }, [carrerasModalidadesArray]);

  const getEstadoBadge = (estado, carreraModalidad = null) => {
    // Si se proporciona la carrera-modalidad, usar la lógica avanzada
    if (carreraModalidad) {
      const estadoProceso = estadosCalculados[carreraModalidad.id] || getEstadoProceso(carreraModalidad);
      return (
        <span className={`estado-badge ${estadoProceso.clase}`}>
          {estadoProceso.icono}
          {estadoProceso.texto}
        </span>
      );
    }

    // Lógica para fases y subfases
    if (estado === true) {
      return (
        <span className="estado-badge completado">
          <CheckCircle size={12} />
          Completado
        </span>
      );
    } else if (estado === false) {
      return (
        <span className="estado-badge en-proceso">
          <Clock size={12} />
          En Proceso
        </span>
      );
    } else {
      return (
        <span className="estado-badge pendiente">
          <Clock size={12} />
          Pendiente
        </span>
      );
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener listas únicas para filtros con optimización
  const facultadesUnicas = useMemo(() => {
    return [...new Set(carrerasModalidadesArray
      .filter(cm => cm.carrera?.facultad?.nombre)
      .map(cm => cm.carrera.facultad.nombre))];
  }, [carrerasModalidadesArray]);

  const modalidadesUnicas = useMemo(() => {
    return [...new Set(carrerasModalidadesArray
      .filter(cm => cm.modalidad?.nombre)
      .map(cm => cm.modalidad.nombre))];
  }, [carrerasModalidadesArray]);

  // Filtrar y ordenar datos con optimización
  const carrerasModalidadesFiltradas = useMemo(() => {
    return carrerasModalidadesArray
      .filter(cm => {
        const matchesSearch = 
          (cm.carrera?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cm.carrera?.facultad?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cm.modalidad?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFacultad = !selectedFacultad || cm.carrera?.facultad?.nombre === selectedFacultad;
        const matchesModalidad = !selectedModalidad || cm.modalidad?.nombre === selectedModalidad;

        return matchesSearch && matchesFacultad && matchesModalidad;
      })
      .sort((a, b) => {
        // Ordenar por fecha de actualización (updated_at) de más reciente a más antiguo
        const fechaA = new Date(a.updated_at || a.created_at || 0);
        const fechaB = new Date(b.updated_at || b.created_at || 0);
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });
  }, [carrerasModalidadesArray, searchTerm, selectedFacultad, selectedModalidad]);

  if (loading) {
    return (
      <div className="carreras-modalidades-admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando carreras-modalidades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carreras-modalidades-admin">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Error al cargar datos</h3>
          <p>{error}</p>
          <button onClick={cargarCarrerasModalidades} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="carreras-modalidades-admin">
      <div className="header-section">
        <h1>
          <GraduationCap size={28} />
          Gestión de Carreras-Modalidades
        </h1>
        <p>Administración completa de todas las carreras-modalidades del sistema</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por carrera, facultad o modalidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <select
              value={selectedFacultad}
              onChange={(e) => setSelectedFacultad(e.target.value)}
            >
              <option value="">Todas las facultades</option>
              {facultadesUnicas.map(facultad => (
                <option key={facultad} value={facultad}>{facultad}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={selectedModalidad}
              onChange={(e) => setSelectedModalidad(e.target.value)}
            >
              <option value="">Todas las modalidades</option>
              {modalidadesUnicas.map(modalidad => (
                <option key={modalidad} value={modalidad}>{modalidad}</option>
              ))}
            </select>
          </div>

          <div className="results-count">
            {carrerasModalidadesFiltradas.length} de {carrerasModalidades.length} resultados
          </div>
        </div>
      </div>

      {/* Lista de carreras-modalidades */}
      <div className="carreras-modalidades-list">
        {carrerasModalidadesFiltradas.map(cm => (
          <div key={cm.id} className="carrera-modalidad-card">
            <div className="card-header">
              <div className="card-main-info" onClick={() => handleCarreraModalidadClick(cm)}>
                <div className="card-title">
                  <Building2 size={20} />
                  <span className="facultad-name">{cm.carrera?.facultad?.nombre || 'Sin facultad'}</span>
                  <span className="separator">→</span>
                  <span className="carrera-name">{cm.carrera?.nombre || 'Sin carrera'}</span>
                </div>
                <div className="card-subtitle">
                  <span className="modalidad-name">{cm.modalidad?.nombre || 'Sin modalidad'}</span>
                  {getEstadoBadge(cm.estado_modalidad, cm)}
                </div>
              </div>

              <div className="card-stats">
                <div className="stat-item">
                  <FileText size={16} />
                  <span>{cm.fases?.length || 0} fases</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{cm.fases?.reduce((total, fase) => total + (fase.subfases?.length || 0), 0) || 0} subfases</span>
                </div>
                
                {/* Botones de certificado */}
                <div className="certificado-actions">
                  {cm.certificado ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDescargarCertificado(cm);
                      }}
                      className="btn-descargar-certificado"
                      title="Descargar certificado"
                      disabled={downloadingCertificados.has(cm.id)}
                    >
                      <Award size={16} />
                      {downloadingCertificados.has(cm.id) ? 'Descargando...' : 'Certificado'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubirCertificado(cm);
                      }}
                      className="btn-subir-certificado"
                      title="Subir certificado"
                    >
                      <Upload size={16} />
                      Subir Certificado
                    </button>
                  )}
                  
                  {/* Botón PLAME */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAbrirPlame(cm);
                    }}
                    className={`btn-plame ${plameDocuments[cm.id] ? 'has-document' : 'no-document'}`}
                    title={plameDocuments[cm.id] ? 'Descargar documento PLAME' : 'Subir documento PLAME'}
                    disabled={loadingPlame[cm.id]}
                  >
                    {loadingPlame[cm.id] ? (
                      <>
                        <Clock size={16} className="animate-spin" />
                        Cargando...
                      </>
                    ) : plameDocuments[cm.id] ? (
                      <>
                        <FileText size={16} />
                        Descargar PLAME
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Subir PLAME
                      </>
                    )}
                  </button>
                  
                  {/* Botón de eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDeleteModal(cm);
                    }}
                    className="btn-eliminar-carrera-modalidad"
                    title="Eliminar carrera-modalidad"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
                
                <div className="expand-icon" onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(cm.id);
                }}>
                  {expandedItems.has(cm.id) ? 
                    <ChevronDown size={20} /> : 
                    <ChevronRight size={20} />
                  }
                </div>
              </div>
            </div>

            {expandedItems.has(cm.id) && (
              <div className="card-details">
                {/* Información general */}
                <div className="details-section">
                  <h4>Información General</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>ID:</label>
                      <span>{cm.id}</span>
                    </div>
                    <div className="info-item">
                      <label>Facultad:</label>
                      <span>{cm.carrera?.facultad?.nombre} ({cm.carrera?.facultad?.codigo_facultad})</span>
                    </div>
                    <div className="info-item">
                      <label>Carrera:</label>
                      <span>{cm.carrera?.nombre} ({cm.carrera?.codigo_carrera})</span>
                    </div>
                    <div className="info-item">
                      <label>Modalidad:</label>
                      <span>{cm.modalidad.nombre}</span>
                    </div>
                  </div>
                </div>

                {/* Fechas del proceso */}
                <div className="details-section">
                  <h4>
                    <Calendar size={16} />
                    Fechas del Proceso
                  </h4>
                  <div className="fechas-grid">
                    <div className="fecha-item">
                      <label>Inicio del Proceso:</label>
                      <span>{formatFecha(cm.fecha_ini_proceso)}</span>
                    </div>
                    <div className="fecha-item">
                      <label>Fin del Proceso:</label>
                      <span>{formatFecha(cm.fecha_fin_proceso)}</span>
                    </div>
                    <div className="fecha-item">
                      <label>Inicio Aprobación:</label>
                      <span>{formatFecha(cm.fecha_ini_aprobacion)}</span>
                    </div>
                    <div className="fecha-item">
                      <label>Fin Aprobación:</label>
                      <span>{formatFecha(cm.fecha_fin_aprobacion)}</span>
                    </div>
                  </div>
                </div>

                {/* Fases y subfases */}
                {cm.fases && cm.fases.length > 0 && (
                  <div className="details-section">
                    <h4>Fases y Subfases</h4>
                    <div className="fases-list">
                      {cm.fases.map(fase => (
                        <div key={fase.id} className="fase-item">
                          <div className="fase-header">
                            <span className="fase-name">{fase.nombre}</span>
                            <span className="subfases-count">
                              {fase.subfases?.length || 0} subfases
                            </span>
                            {getEstadoBadge(fase.estado_fase)}
                          </div>
                          {fase.descripcion_fase && (
                            <p className="fase-descripcion">{fase.descripcion_fase}</p>
                          )}
                          <div className="fase-fechas">
                            <span>{formatFecha(fase.fecha_inicio_fase)} - {formatFecha(fase.fecha_fin_fase)}</span>
                          </div>
                          
                          {fase.subfases && fase.subfases.length > 0 && (
                            <div className="subfases-list">
                              {fase.subfases.map(subfase => (
                                <div key={subfase.id} className="subfase-item">
                                  <div className="subfase-header">
                                    <span className="subfase-name">{subfase.nombre}</span>
                                    {getEstadoBadge(subfase.estado_subfase)}
                                  </div>
                                  {subfase.descripcion_subfase && (
                                    <p className="subfase-descripcion">{subfase.descripcion_subfase}</p>
                                  )}
                                  <div className="subfase-fechas">
                                    <span>{formatFecha(subfase.fecha_inicio_subfase)} - {formatFecha(subfase.fecha_fin_subfase)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensajes de estado */}
      {carrerasModalidadesArray.length === 0 && (
        <div className="empty-state">
          <GraduationCap size={48} />
          <h3>No hay carreras-modalidades registradas</h3>
          <p>No se encontraron datos en el sistema. Contacte al administrador.</p>
        </div>
      )}

      {carrerasModalidadesArray.length > 0 && carrerasModalidadesFiltradas.length === 0 && (
        <div className="empty-state">
          <Search size={48} />
          <h3>No se encontraron resultados</h3>
          <p>Intenta ajustar los filtros o términos de búsqueda</p>
        </div>
      )}

      {/* Modal para subir certificado */}
      <ModalSubirCertificado
        isOpen={showCertificadoModal}
        onClose={handleCloseCertificadoModal}
        onUpload={handleUploadCertificado}
        carreraModalidad={selectedCarreraModalidad}
      />

      {/* Modal para confirmar eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
              <button className="close-button" onClick={handleCloseDeleteModal}>×</button>
            </div>          
            <div className="modal-body">
              <div className="warning-icon">
                <AlertCircle size={48} color="#ef4444" />
              </div>
              
              <p className="warning-text">
                <strong>¿Estás seguro de que deseas eliminar esta carrera-modalidad?</strong>
              </p>
              
              {carreraModalidadToDelete && (
                <div className="delete-details">
                  <p><strong>Carrera:</strong> {carreraModalidadToDelete.carrera?.nombre}</p>
                  <p><strong>Modalidad:</strong> {carreraModalidadToDelete.modalidad?.nombre}</p>
                  <p><strong>Facultad:</strong> {carreraModalidadToDelete.facultad?.nombre_facultad}</p>
                </div>
              )}
              
              <p className="confirmation-instruction">
                Esta acción no se puede deshacer. Para confirmar, escriba <strong>"CONFIRMAR"</strong> en mayúsculas:
              </p>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Escriba CONFIRMAR"
                className="confirm-input"
                disabled={isDeleting}
              />
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete" 
                onClick={handleDeleteCarreraModalidad}
                disabled={deleteConfirmText !== 'CONFIRMAR' || isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal PLAME */}
      {showPlameModal && selectedCarreraModalidadPlame && (
        <ModalSubirPlame
          isOpen={showPlameModal}
          onClose={handleCerrarPlame}
          onUpload={handlePlameSubido}
          carreraModalidad={selectedCarreraModalidadPlame}
        />
      )}
    </div>
  );
};

export default CarrerasModalidadesAdmin;
