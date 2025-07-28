import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import '../styles/FasesScreen.css';

const FasesScreen = () => {
  const location = useLocation();
  const params = useParams();
  const [fasesData, setFasesData] = useState(null);

  const [fases, setFases] = useState([
    {
      id: 1,
      nombre: 'Fase 1',
      progreso: 100,
      completada: true,
      expandida: false,
      actividades: []
    },
    {
      id: 2,
      nombre: 'Fase 2',
      progreso: 100,
      completada: true,
      expandida: false,
      actividades: []
    },
    {
      id: 3,
      nombre: 'Fase 3',
      progreso: 100,
      completada: true,
      expandida: false,
      actividades: []
    },
    {
      id: 4,
      nombre: 'IES: Elaboración y entrega de la IAE',
      progreso: 50,
      completada: false,
      expandida: true,
      fechaInicio: '21-04-2025',
      fechaFin: '21-10-2025',
      duracion: '6 meses',
      descripcion: 'Descripción',
      actividades: [
        {
          id: 1,
          nombre: 'Diseño del proceso de Autoevaluación.',
          fechaInicio: '20-04-25',
          fechaFin: '01-05-25',
          fechaEntrega: '30-04-25',
          completada: true
        },
        {
          id: 2,
          nombre: 'Diseño de proyectos IDH.',
          fechaInicio: '02-05-25',
          fechaFin: '10-05-25',
          fechaEntrega: '05-05-25',
          completada: true
        },
        {
          id: 3,
          nombre: 'Inauguración, información, concientización.',
          fechaInicio: '11-05-25',
          fechaFin: '30-05-25',
          fechaEntrega: null,
          completada: false
        },
        {
          id: 4,
          nombre: 'Capacitación y constitución de subcomisiones.',
          fechaInicio: '01-06-25',
          fechaFin: '05-06-25',
          fechaEntrega: null,
          completada: false
        }
      ]
    },
    {
      id: 5,
      nombre: 'Fase 5',
      progreso: 10,
      completada: false,
      expandida: false,
      actividades: []
    },
    {
      id: 6,
      nombre: 'Fase 6',
      progreso: 0,
      completada: false,
      expandida: false,
      actividades: []
    }
  ]);

  useEffect(() => {
    if (location.state) {
      const {
        modalidad,
        facultadId,
        carreraId,
        facultadNombre,
        carreraNombre,
        modalidadData
      } = location.state;
      
      console.log('Datos recibidos en FasesScreen:', {
        modalidad,
        facultadId,
        carreraId,
        facultadNombre,
        carreraNombre,
        modalidadData
      });
      
      setFasesData(location.state);
    }
    
    if (params.modalidad && params.carreraId) {
      console.log('Parámetros de URL:', params);
    }
  }, [location.state, params]);

  const toggleFase = (faseId) => {
    setFases(fases.map(fase => 
      fase.id === faseId 
        ? { ...fase, expandida: !fase.expandida }
        : fase
    ));
  };

  const handleAgregarFase = () => {
    console.log('Agregar nueva fase');
  };

  const handleFinalizarAcreditacion = () => {
    console.log('Finalizar acreditación');
  };

  const handleEditarActividad = (actividadId) => {
    console.log('Editar actividad:', actividadId);
  };

  const handleEliminarActividad = (actividadId) => {
    console.log('Eliminar actividad:', actividadId);
  };

  const handleAgregarActividad = (faseId) => {
    console.log('Agregar actividad a fase:', faseId);
  };

  const getStatusIcon = (completada, progreso) => {
    if (completada || progreso === 100) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="status-icon completed">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (progreso > 0) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="status-icon in-progress">
          <path d="M12 2V12L17 7M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="status-icon pending">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 7V13L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  const getActivityStatusIcon = (completada) => {
    if (completada) {
      return (
        <div className="activity-status completed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    } else {
      return (
        <div className="activity-status pending">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }
  };

  if (!fasesData) {
    return (
      <div className="fases-container">
        <div className="loading">Cargando datos de fases...</div>
      </div>
    );
  }

  return (
    <div className="fases-container">
      <div className="breadcrumb">
        <span>Técnico DUEA</span>
        <span className="separator">&gt;&gt;</span>
        <span>Modalidades</span>
        <span className="separator">&gt;&gt;</span>
        <span>{fasesData.modalidad.toUpperCase()}</span>
        <span className="separator">&gt;&gt;</span>
        <span className="current">{fasesData.carreraNombre}</span>
      </div>

      <div className="action-buttons-header">
        <button className="btn-agregar-fase" onClick={handleAgregarFase}>
          Agregar Fase
        </button>
        <button className="btn-finalizar" onClick={handleFinalizarAcreditacion}>
          Finalizar Acreditación
        </button>
      </div>

      <div className="fases-list">
        {fases.map((fase) => (
          <div key={fase.id} className="fase-item">
            <div 
              className="fase-header"
              onClick={() => toggleFase(fase.id)}
            >
              <div className="fase-info">
                <h3 className="fase-nombre">{fase.nombre}</h3>
                {fase.fechaInicio && fase.fechaFin && (
                  <div className="fase-fechas">
                    Inicio {fase.fechaInicio} Fin {fase.fechaFin} Duración {fase.duracion}
                  </div>
                )}
                {fase.descripcion && (
                  <div className="fase-descripcion">
                    <span className="descripcion-link">{fase.descripcion}</span>
                  </div>
                )}
              </div>
              
              <div className="fase-controls">
                {fase.nombre.includes('IES:') && (
                  <div className="fase-actions">
                    <button className="action-icon add" onClick={(e) => {
                      e.stopPropagation();
                      handleAgregarActividad(fase.id);
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="action-icon edit">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.50023C18.8978 2.1024 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1215 3.43762 22.1215 4.00023C22.1215 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="action-icon delete">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
                
                <div className="fase-progress">
                  <span className="progress-text">{fase.progreso}%</span>
                  {getStatusIcon(fase.completada, fase.progreso)}
                </div>
                
                <div className={`expand-icon ${fase.expandida ? 'expanded' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {fase.expandida && fase.actividades.length > 0 && (
              <div className="actividades-list">
                {fase.actividades.map((actividad, index) => (
                  <div key={actividad.id} className="actividad-item">
                    <div className="actividad-numero">{index + 1}.</div>
                    <div className="actividad-content">
                      <div className="actividad-info">
                        <span className="actividad-nombre">{actividad.nombre}</span>
                        <span className="actividad-fechas">
                          {actividad.fechaInicio} a {actividad.fechaFin}
                        </span>
                      </div>
                      
                      <div className="actividad-controls">
                        <button 
                          className="action-icon edit"
                          onClick={() => handleEditarActividad(actividad.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.50023C18.8978 2.1024 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1215 3.43762 22.1215 4.00023C22.1215 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          className="action-icon delete"
                          onClick={() => handleEliminarActividad(actividad.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        
                        {actividad.fechaEntrega && (
                          <div className="fecha-entrega">
                            {actividad.fechaEntrega}
                          </div>
                        )}
                        
                        {getActivityStatusIcon(actividad.completada)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FasesScreen;