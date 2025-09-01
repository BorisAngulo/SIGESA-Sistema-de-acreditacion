import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { showCarrera, getModalidades } from '../services/api';
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
        m.id === 1 || 
        (m.nombre && m.nombre.toLowerCase().includes('arcu')) ||
        (m.nombre && m.nombre.toLowerCase().includes('mercosur'))
      ) || modalidades[0];
      modalidadSlug = 'arco-sur';
    } else {
      modalidadData = modalidades.find(m => 
        m.id === 2 || 
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

  const contenidoARCUSUR = () => (
    <div className="info-acreditacion">
      <div className="acreditacion-header">
        <div className="header-content">
          <h3>Acreditación ARCU-SUR</h3>
          <p className="subtitle">Sistema de Acreditación Regional - MERCOSUR</p>
        </div>
        <div className="status-badge active">VIGENTE</div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h4>Fecha de Resolución</h4>
            <p>{carrera.fecha_resolucion || '15/03/2025'}</p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">🌎</div>
          <div className="card-content">
            <h4>Nivel de Acreditación</h4>
            <p>Regional - MERCOSUR</p>
          </div>
        </div>
      </div>

      <div className="historial-section">
        <h4 className="section-title">Historial de Acreditaciones</h4>
        <div className="timeline">
          <div className="timeline-item active">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <span className="timeline-date">2018 - 2022</span>
              <p>Acreditación vigente</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <span className="timeline-date">2012 - 2016</span>
              <p>Acreditación anterior</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <span className="timeline-date">2003 - 2007</span>
              <p>Primera acreditación</p>
            </div>
          </div>
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

  const contenidoCEUB = () => (
    <div className="info-acreditacion">
      <div className="acreditacion-header">
        <div className="header-content">
          <h3>Registro CEUB</h3>
          <p className="subtitle">Comité Ejecutivo de la Universidad Boliviana</p>
        </div>
        <div className="status-badge active">REGISTRADA</div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h4>Fecha de Resolución</h4>
            <p>{carrera.fecha_resolucion || '15/03/2025'}</p>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon">🏛️</div>
          <div className="card-content">
            <h4>Nivel de Registro</h4>
            <p>Nacional - Bolivia</p>
          </div>
        </div>
      </div>

      <div className="historial-section">
        <h4 className="section-title">Historial de Registros</h4>
        <div className="timeline">
          <div className="timeline-item active">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <span className="timeline-date">2018 - 2022</span>
              <p>Registro vigente</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <span className="timeline-date">2012 - 2016</span>
              <p>Registro anterior</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <span className="timeline-date">2003 - 2007</span>
              <p>Primer registro</p>
            </div>
          </div>
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