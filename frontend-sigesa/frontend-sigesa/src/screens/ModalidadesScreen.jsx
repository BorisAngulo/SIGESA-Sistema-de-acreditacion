import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFacultades, getCarreras, getModalidades } from '../services/api';
import ModalInfoModalidad from '../components/ModalInfoModalidad';
import '../styles/ModalidadesScreen.css';

const ModalidadesScreen = ({ modalidad = 'arco-sur' }) => {
  const navigate = useNavigate();
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [selectedFacultad, setSelectedFacultad] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [filteredCarreras, setFilteredCarreras] = useState([]);

  const [currentModalidad, setCurrentModalidad] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFacultadNombre, setSelectedFacultadNombre] = useState('');
  const [selectedCarreraNombre, setSelectedCarreraNombre] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        
        const [facultadesData, carrerasData, modalidadesData] = await Promise.all([
          getFacultades(),
          getCarreras(),
          getModalidades()
        ]);
        
        if (!Array.isArray(facultadesData)) {
          console.error('Facultades no es un array:', facultadesData);
          setFacultades([]);
        } else {
          setFacultades(facultadesData);
        }
        
        if (!Array.isArray(carrerasData)) {
          console.error('Carreras no es un array:', carrerasData);
          setCarreras([]);
        } else {
          setCarreras(carrerasData);
        }
        
        if (Array.isArray(modalidadesData) && modalidadesData.length > 0) {
          console.log('🔍 Buscando modalidad para:', modalidad);
          console.log('📋 Modalidades disponibles:', modalidadesData);
          
          let modalidadActual;
          
          if (modalidad === 'arco-sur') {
            modalidadActual = modalidadesData.find(m => m.id === 2) || modalidadesData[1] || modalidadesData[0];
          } else {
            modalidadActual = modalidadesData.find(m => m.id === 1) || modalidadesData[0];
          }
          
          console.log('✅ Modalidad asignada:', modalidadActual);
          setCurrentModalidad(modalidadActual);
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setFacultades([]);
        setCarreras([]);
      } finally {
      }
    };

    loadData();
  }, [modalidad]);

  useEffect(() => {
    
    if (selectedFacultad && carreras.length > 0) {
      let filtered = carreras.filter(carrera => {
        const facultadId = parseInt(selectedFacultad);
        const carreraFacultadId = parseInt(carrera.facultad_id || carrera.id_facultad);
        
        return carreraFacultadId === facultadId;
      });
      
      setFilteredCarreras(filtered);
      setSelectedCarrera(''); 
      setSelectedCarreraNombre('');
    } else {
      setFilteredCarreras([]);
      setSelectedCarrera('');
      setSelectedCarreraNombre('');
    }
  }, [selectedFacultad, carreras, currentModalidad]);

  const handleFacultadChange = (e) => {
    const value = e.target.value;
    console.log('Facultad seleccionada:', value);
    setSelectedFacultad(value);
    
    const facultad = facultades.find(f => (f.id || f.facultad_id).toString() === value);
    if (facultad) {
      setSelectedFacultadNombre(facultad.nombre || facultad.nombre_facultad || facultad.name);
    }
  };

  const handleCarreraChange = (e) => {
    const value = e.target.value;
    console.log('Carrera seleccionada:', value);
    setSelectedCarrera(value);
    
    const carrera = filteredCarreras.find(c => (c.id || c.carrera_id).toString() === value);
    if (carrera) {
      setSelectedCarreraNombre(carrera.nombre || carrera.nombre_carrera || carrera.name);
    }
  };

  const handleMasInformacion = () => {
    setShowModal(true);
  };

  const handleVerDocumentos = () => {
    if (!selectedCarrera || !currentModalidad?.id) {
      console.error('❌ Datos incompletos para navegar:', {
        selectedCarrera,
        currentModalidad: currentModalidad?.id
      });
      alert('Error: Selecciona una carrera y modalidad válidas');
      return;
    }
    
    navigate(`/fases/${selectedCarrera}/${currentModalidad?.id}`, {
      state: {
        modalidad: modalidad,
        modalidadId: currentModalidad?.id,
        facultadId: selectedFacultad,
        carreraId: selectedCarrera,
        facultadNombre: selectedFacultadNombre,
        carreraNombre: selectedCarreraNombre,
        modalidadData: currentModalidad
      }
    });
    
    console.log('✅ Navegando a fases con datos:', {
      modalidadId: currentModalidad?.id,
      carreraId: selectedCarrera,
      facultadNombre: selectedFacultadNombre,
      carreraNombre: selectedCarreraNombre
    });
  };

  return (
    <div className="modalidades-container">
      <div className="breadcrumb">
        <span>Técnico DUEA</span>
        <span className="separator">&gt;&gt;</span>
        <span>Modalidades</span>
        <span className="separator">&gt;&gt;</span>
        <span className="current">{modalidad === 'arco-sur' ? 'ARCU SUR' : 'CEUB'}</span>
      </div>

      <div className="modalidades-content">
        <div className="content-section">
          <h1 className="main-title">
            {modalidad === 'arco-sur' ? 'SISTEMA ARCU SUR' : 'SISTEMA CEUB'}
          </h1>
          
<div className="description">
              {modalidad === 'arco-sur' ? (
                  <div>
                      <p>
                          El Sistema de Acreditación Regional de Carreras Universitarias para el MERCOSUR (ARCU-SUR) 
                          es un mecanismo permanente de evaluación y garantía de calidad para carreras de grado en la región. 
                          Surge como evolución del Mecanismo Experimental de Acreditación (MEXA) que evaluó carreras de 
                          Agronomía, Ingeniería y Medicina entre 1998 y 2004.
                      </p>
                      <p>
                          <strong>Adhesión al MERCOSUR:</strong> La incorporación de carreras al sistema ARCU-SUR se 
                          realiza mediante convocatorias oficiales emitidas por el Sistema Nacional de Acreditación de 
                          Carreras Universitarias (SENACU). Estas convocatorias establecen los requisitos, plazos y 
                          procedimientos que las instituciones de educación superior deben seguir para postular sus 
                          carreras al proceso de acreditación regional.
                      </p>
                      <p>
                          <strong>Duración de la acreditación:</strong> La acreditación ARCU-SUR tiene una validez de 
                          6 años para las carreras que logran la certificación.
                      </p>
                      <p>
                          <strong>Proceso de reacreditación:</strong> Las carreras deben iniciar el proceso de 
                          reacreditación durante el último año de vigencia de su acreditación actual. El proceso 
                          de reevaluación sigue los mismos estándares de calidad que la acreditación inicial.
                      </p>
                      <p>
                          Actualmente participan Argentina, Brasil, Paraguay, Uruguay, Bolivia y Chile, evaluando 
                          carreras en áreas prioritarias para el desarrollo regional. El sistema promueve la movilidad 
                          académica y el reconocimiento mutuo de titulaciones en los países miembros del MERCOSUR.
                      </p>
                      <p className="info-adicional">
                          <strong>Para saber más sobre las convocatorias vigentes, requisitos y proceso de adhesión, 
                          visite el sitio oficial:</strong>{' '}
                          <a 
                            href="https://www.arcusur.org/?page_id=298" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="enlace-arcusur"
                          >
                            www.arcusur.org - Convocatorias
                          </a>
                      </p>
                  </div>
              ) : (
                  <div>
                      <p>
                          El Comité Ejecutivo de la Universidad Boliviana (CEUB) es el organismo rector del Sistema 
                          de la Universidad Boliviana, responsable de garantizar la calidad académica en las universidades 
                          públicas del país. Su sistema de acreditación evalúa el cumplimiento de estándares nacionales 
                          de calidad en formación profesional, investigación y vinculación con la sociedad.
                      </p>
                      <p>
                          <strong>Duración de la acreditación:</strong> Las carreras acreditadas por el CEUB mantienen 
                          su certificación por un período de 5 años.
                      </p>
                      <p>
                          <strong>Proceso de reacreditación:</strong> Debe iniciarse 12 meses antes del vencimiento 
                          de la acreditación vigente. Incluye una autoevaluación actualizada y una evaluación externa 
                          por pares académicos.
                      </p>
                      <p>
                          El CEUB promueve la mejora continua mediante procesos periódicos de evaluación, asegurando 
                          que las carreras mantengan altos estándares de enseñanza, infraestructura adecuada y pertinencia 
                          social de sus programas académicos.
                      </p>
                        <p className="info-adicional">
                          <strong>Para saber más sobre las convocatorias vigentes, requisitos y proceso de adhesión, 
                          visite el sitio oficial:</strong>{' '}
                          <a 
                            href="https://ceub.edu.bo/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="enlace-arcusur"
                          >
                            www.ceub.edu.bo
                          </a>
                      </p>
                  </div>
              )}
          </div>

          <div className="documents-section">
            <button className="documents-btn">
              Documentos
            </button>
          </div>
        </div>

        <div className="selectors-section">
          <div className="selector-container">
            <select 
              className="selector"
              value={selectedFacultad}
              onChange={handleFacultadChange}
            >
              <option value="">Seleccionar Facultad ({facultades.length})</option>
              {facultades.map((facultad) => {
                const id = facultad.id || facultad.facultad_id;
                const nombre = facultad.nombre || facultad.nombre_facultad || facultad.name;
                
                if (!id || !nombre) {
                  console.warn('Facultad con estructura incorrecta:', facultad);
                  return null;
                }
                
                return (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="selector-container">
            <select 
              className="selector"
              value={selectedCarrera}
              onChange={handleCarreraChange}
              disabled={!selectedFacultad || filteredCarreras.length === 0}
            >
              <option value="">
                {!selectedFacultad 
                  ? 'Seleccionar Carrera' 
                  : filteredCarreras.length === 0 
                    ? 'No hay carreras disponibles'
                    : `Seleccionar Carrera (${filteredCarreras.length})`
                }
              </option>
              {filteredCarreras.map((carrera) => {
                const id = carrera.id || carrera.carrera_id;
                const nombre = carrera.nombre || carrera.nombre_carrera || carrera.name;
                
                if (!id || !nombre) {
                  console.warn('Carrera con estructura incorrecta:', carrera);
                  return null;
                }
                
                return (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedCarrera && (
            <div className="action-buttons">
              <button 
                className="action-btn primary-btn"
                onClick={handleMasInformacion}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Más información
              </button>
              
              <button 
                className="action-btn secondary-btn"
                onClick={handleVerDocumentos}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17ZM17 21V10L12 5H7V19H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ver fases
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalInfoModalidad
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        modalidad={modalidad}
        facultadNombre={selectedFacultadNombre}
        carreraNombre={selectedCarreraNombre}
      />
    </div>
  );
};

export default ModalidadesScreen;