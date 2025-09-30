import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { showCarrera, getModalidades, getHistorialAcreditacionesPorModalidad } from '../services/api';
import "../styles/InformacionCarrera.css";

export default function InformacionCarrera() {
  const { carreraId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [carrera, setCarrera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('ARCU-SUR');
  const [modalidades, setModalidades] = useState([]);
  const [historialARCUSUR, setHistorialARCUSUR] = useState(null);
  const [historialCEUB, setHistorialCEUB] = useState(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const modalidadesData = await getModalidades();
        setModalidades(modalidadesData || []);

        if (location.state?.carrera) {
          setCarrera(location.state.carrera);
          setLoading(false);
        } else {
          setLoading(true);
          const data = await showCarrera(carreraId);
          setCarrera(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar la carrera');
        setLoading(false);
      }
    };

    loadData();
  }, [carreraId, location.state]);

  // Efecto separado para cargar historial de acreditaciones
  useEffect(() => {
    const loadHistorial = async () => {
      if (!carreraId) return;

      try {
        setLoadingHistorial(true);
        console.log('🔄 Cargando historial de acreditaciones para carrera:', carreraId);

        // Cargar historial de ARCUSUR (modalidad 1) y CEUB (modalidad 2) en paralelo
        const [historialARCUSURData, historialCEUBData] = await Promise.allSettled([
          getHistorialAcreditacionesPorModalidad(carreraId, 2), // ARCUSUR
          getHistorialAcreditacionesPorModalidad(carreraId, 1)  // CEUB
        ]);

        // Procesar resultado de ARCUSUR
        if (historialARCUSURData.status === 'fulfilled') {
          setHistorialARCUSUR(historialARCUSURData.value);
          console.log('✅ Historial ARCUSUR cargado:', historialARCUSURData.value);
        } else {
          console.log('⚠️ Error al cargar historial ARCUSUR:', historialARCUSURData.reason);
          setHistorialARCUSUR(null);
        }

        // Procesar resultado de CEUB
        if (historialCEUBData.status === 'fulfilled') {
          setHistorialCEUB(historialCEUBData.value);
          console.log('✅ Historial CEUB cargado:', historialCEUBData.value);
        } else {
          console.log('⚠️ Error al cargar historial CEUB:', historialCEUBData.reason);
          setHistorialCEUB(null);
        }

      } catch (err) {
        console.error('❌ Error general al cargar historial:', err);
      } finally {
        setLoadingHistorial(false);
      }
    };

    loadHistorial();
  }, [carreraId]);

  // Función para obtener el estado badge apropiado
  const getEstadoBadge = (estadoActual) => {
    const estilos = {
      'Acreditada': { class: 'active', text: 'VIGENTE' },
      'En proceso y Acreditada': { class: 'active', text: 'VIGENTE' },
      'En proceso': { class: 'in-progress', text: 'EN PROCESO' },
      'En proceso de Reacreditación': { class: 'reaccreditation', text: 'REACREDITACIÓN' },
      'Sin Acreditación': { class: 'inactive', text: 'SIN ACREDITACIÓN' }
    };
    
    return estilos[estadoActual] || { class: 'inactive', text: 'SIN INFORMACIÓN' };
  };

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No definida';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  // Función para obtener la acreditación más reciente
  const getAcreditacionReciente = (historial) => {
    if (!historial || !historial.historial_acreditaciones || historial.historial_acreditaciones.length === 0) {
      return null;
    }
    return historial.historial_acreditaciones[0]; // Ya está ordenado por fecha DESC
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const cambiarVista = (vista) => {
    setVistaActiva(vista);
  };

  const handleVerFases = () => {
    if (!carrera || !carreraId) {
      console.error('❌ Datos incompletos para navegar:', {
        carrera,
        carreraId
      });
      alert('Error: No se pudo cargar la información de la carrera');
      return;
    }

    let modalidadData = null;
    let modalidadSlug = '';
    
    if (vistaActiva === 'ARCU-SUR') {
      modalidadData = modalidades.find(m => 
        m.id === 2 || 
        (m.nombre && m.nombre.toLowerCase().includes('arcu')) ||
        (m.nombre && m.nombre.toLowerCase().includes('mercosur'))
      ) || modalidades[0];
      modalidadSlug = 'arco-sur';
    } else {
      modalidadData = modalidades.find(m => 
        m.id === 1 || 
        (m.nombre && m.nombre.toLowerCase().includes('ceub')) ||
        (m.nombre && m.nombre.toLowerCase().includes('bolivia'))
      ) || modalidades[1] || modalidades[0];
      modalidadSlug = 'ceub';
    }

    if (!modalidadData) {
      console.error('❌ No se encontró información de modalidad para:', vistaActiva);
      console.error('❌ Modalidades disponibles:', modalidades);
      alert('Error: No se pudo cargar la información de modalidad');
      return;
    }

    console.log('🔍 Modalidad seleccionada:', {
      vistaActiva,
      modalidadData,
      modalidadSlug
    });

    const carreraIdNumerico = parseInt(carreraId);
    const modalidadIdNumerico = parseInt(modalidadData.id);

    navigate(`/fases/${carreraIdNumerico}/${modalidadIdNumerico}`, {
      state: {
        modalidad: modalidadSlug,
        modalidadId: modalidadIdNumerico,
        facultadId: parseInt(carrera.facultad_id || carrera.id_facultad || 0),
        carreraId: carreraIdNumerico,
        facultadNombre: carrera.facultad_nombre || carrera.nombre_facultad || 'Facultad',
        carreraNombre: carrera.nombre_carrera || carrera.nombre || carrera.name,
        modalidadData: modalidadData,
        vistaActiva: vistaActiva,
        carrera: carrera,
        origen: 'InformacionCarrera'
      }
    });

    console.log('✅ Navegando a fases con datos completos:', {
      modalidad: modalidadSlug,
      modalidadId: modalidadIdNumerico,
      carreraId: carreraIdNumerico,
      facultadNombre: carrera.facultad_nombre || carrera.nombre_facultad,
      carreraNombre: carrera.nombre_carrera || carrera.nombre,
      vistaActiva: vistaActiva,
      ruta: `/fases/${carreraIdNumerico}/${modalidadIdNumerico}`
    });
  };

  const contenidoARCUSUR = () => {
    const badge = getEstadoBadge(historialARCUSUR?.estado_actual);
    const acreditacionReciente = getAcreditacionReciente(historialARCUSUR);
    
    return (
      <div className="info-acreditacion">
        <div className="acreditacion-header">
          <div className="header-content">
            <h3>Acreditación ARCU-SUR</h3>
            <p className="subtitle">Sistema de Acreditación Regional - MERCOSUR</p>
          </div>
          <div className={`status-badge ${badge.class}`}>
            {loadingHistorial ? 'CARGANDO...' : badge.text}
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h4>Última Resolución</h4>
              <p>{acreditacionReciente?.fecha_ini_aprobacion ? 
                formatearFecha(acreditacionReciente.fecha_ini_aprobacion) : 
                'No disponible'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">🌎</div>
            <div className="card-content">
              <h4>Nivel de Acreditación</h4>
              <p>Regional - MERCOSUR</p>
            </div>
          </div>

          {acreditacionReciente?.puntaje_acreditacion && (
            <div className="info-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h4>Puntaje</h4>
                <p>{acreditacionReciente.puntaje_acreditacion} puntos</p>
              </div>
            </div>
          )}
        </div>

        <div className="historial-section">
          <h4 className="section-title">Historial de Acreditaciones</h4>
          <div className="timeline">
            {loadingHistorial ? (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-date">Cargando...</span>
                  <p>Obteniendo historial...</p>
                </div>
              </div>
            ) : historialARCUSUR && historialARCUSUR.historial_acreditaciones.length > 0 ? (
              historialARCUSUR.historial_acreditaciones.map((item, index) => (
                <div key={item.id} className={`timeline-item ${index === 0 ? 'active' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <span className="timeline-date">
                      {item.fecha_ini_aprobacion && item.fecha_fin_aprobacion ? 
                        `Aprobación: ${formatearFecha(item.fecha_ini_aprobacion)} - ${formatearFecha(item.fecha_fin_aprobacion)}` :
                        item.fecha_ini_proceso && item.fecha_fin_proceso ?
                        `Proceso: ${formatearFecha(item.fecha_ini_proceso)} - ${formatearFecha(item.fecha_fin_proceso)}` :
                        'Fechas no definidas'
                      }
                    </span>
                    <p>{item.fecha_ini_aprobacion && item.fecha_fin_aprobacion ? 'Acreditación aprobada' : 'En proceso'}</p>
                    {item.puntaje_acreditacion && (
                      <span className="timeline-score">{item.puntaje_acreditacion} pts</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-date">Sin registros</span>
                  <p>No hay historial de acreditaciones ARCU-SUR</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="link-section">
          <div className="link-card">
            <div className="link-content">
              <h4>Información de la Carrera</h4>
              <a 
                href={carrera.pagina_carrera} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-url"
              >
                Visitar sitio oficial →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const contenidoCEUB = () => {
    const badge = getEstadoBadge(historialCEUB?.estado_actual);
    const acreditacionReciente = getAcreditacionReciente(historialCEUB);
    
    return (
      <div className="info-acreditacion">
        <div className="acreditacion-header">
          <div className="header-content">
            <h3>Acreditación CEUB</h3>
            <p className="subtitle">Comité Ejecutivo de la Universidad Boliviana</p>
          </div>
          <div className={`status-badge ${badge.class}`}>
            {loadingHistorial ? 'CARGANDO...' : badge.text}
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h4>Última Resolución</h4>
              <p>{acreditacionReciente?.fecha_ini_aprobacion ? 
                formatearFecha(acreditacionReciente.fecha_ini_aprobacion) : 
                'No disponible'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">🏛️</div>
            <div className="card-content">
              <h4>Nivel de Acreditación</h4>
              <p>Nacional - Bolivia</p>
            </div>
          </div>

          {acreditacionReciente?.puntaje_acreditacion && (
            <div className="info-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h4>Puntaje</h4>
                <p>{acreditacionReciente.puntaje_acreditacion} puntos</p>
              </div>
            </div>
          )}
        </div>

        <div className="historial-section">
          <h4 className="section-title">Historial de Acreditaciones</h4>
          <div className="timeline">
            {loadingHistorial ? (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-date">Cargando...</span>
                  <p>Obteniendo historial...</p>
                </div>
              </div>
            ) : historialCEUB && historialCEUB.historial_acreditaciones.length > 0 ? (
              historialCEUB.historial_acreditaciones.map((item, index) => (
                <div key={item.id} className={`timeline-item ${index === 0 ? 'active' : ''}`}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <span className="timeline-date">
                      {item.fecha_ini_aprobacion && item.fecha_fin_aprobacion ? 
                        `Aprobación: ${formatearFecha(item.fecha_ini_aprobacion)} - ${formatearFecha(item.fecha_fin_aprobacion)}` :
                        item.fecha_ini_proceso && item.fecha_fin_proceso ?
                        `Proceso: ${formatearFecha(item.fecha_ini_proceso)} - ${formatearFecha(item.fecha_fin_proceso)}` :
                        'Fechas no definidas'
                      }
                    </span>
                    <p>{item.fecha_ini_aprobacion && item.fecha_fin_aprobacion ? 'Acreditación aprobada' : 'En proceso'}</p>
                    {item.puntaje_acreditacion && (
                      <span className="timeline-score">{item.puntaje_acreditacion} pts</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <span className="timeline-date">Sin registros</span>
                  <p>No hay historial de acreditaciones CEUB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="link-section">
          <div className="link-card">
            <div className="link-content">
              <h4>Información de la Carrera</h4>
              <a 
                href={carrera.pagina_carrera} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-url"
              >
                Visitar sitio oficial →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
          <p>Cargando información de la carrera...</p>
      </div>
    );
  }

  if (error || !carrera) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>{error || "Carrera no encontrada"}</h2>
          <button onClick={handleVolver} className="btn-volver">
            <span>←</span> Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="carrera-page">
      <div className="page-header">
        <div className="header-background"></div>
        <div className="header-content">
          <h3 className="nombre-carrera">{carrera.nombre_carrera}</h3>
        </div>
      </div>

      <div className="main-content">
        <div className="botones-acreditacion">
          <button 
            className={`btn-acreditacion btn-arco ${vistaActiva === 'ARCU-SUR' ? 'active' : ''}`}
            onClick={() => cambiarVista('ARCU-SUR')}
          >
            <span className="btn-text">ARCU-SUR</span>
            <span className="btn-subtitle">MERCOSUR</span>
          </button>
          <button 
            className={`btn-acreditacion btn-ceub ${vistaActiva === 'CEUB' ? 'active' : ''}`}
            onClick={() => cambiarVista('CEUB')}
          >
            <span className="btn-text">CEUB</span>
            <span className="btn-subtitle">BOLIVIA</span>
          </button>
        </div>

        <div className="acreditacion-container">
          <div className="acreditacion-box">
            {vistaActiva === 'ARCU-SUR' ? contenidoARCUSUR() : contenidoCEUB()}
          </div>
        </div>

        <div className="fases-section">
          <div className="fases-card">
            <div className="fases-header">
              <div className="fases-icon">📋</div>
              <div className="fases-content">
                <h4>Proceso de {vistaActiva === 'ARCU-SUR' ? 'Acreditación' : 'Registro'}</h4>
                <p>Conoce las etapas del proceso de {vistaActiva === 'ARCU-SUR' ? 'acreditación regional' : 'registro nacional'}</p>
              </div>
            </div>
            <button 
              className="btn-ver-fases"
              onClick={handleVerFases}
            >
              <span>Ver Fases</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}