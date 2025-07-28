import React, { useState, useEffect } from 'react';
import { getFacultades, getCarreras, getModalidades } from '../services/api';
import '../styles/ModalidadesScreen.css';

const ModalidadesScreen = ({ modalidad = 'arco-sur' }) => {
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [selectedFacultad, setSelectedFacultad] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [filteredCarreras, setFilteredCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentModalidad, setCurrentModalidad] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Iniciando carga de datos...');
        
        const [facultadesData, carrerasData, modalidadesData] = await Promise.all([
          getFacultades(),
          getCarreras(),
          getModalidades()
        ]);
        
        console.log('Datos recibidos:');
        console.log('Facultades:', facultadesData);
        console.log('Carreras:', carrerasData);
        console.log('Modalidades:', modalidadesData);
        
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
        
        if (Array.isArray(modalidadesData)) {
          const modalidadActual = modalidadesData.find(m => 
            m.codigo_modalidad?.toLowerCase() === modalidad.replace('-', '_')
          );
          setCurrentModalidad(modalidadActual);
          console.log('Modalidad encontrada:', modalidadActual);
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message);
        setFacultades([]);
        setCarreras([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [modalidad]);

  useEffect(() => {
    console.log('Actualizando carreras filtradas...');
    console.log('Facultad seleccionada:', selectedFacultad);
    console.log('Total carreras:', carreras.length);
    
    if (selectedFacultad && carreras.length > 0) {
      let filtered = carreras.filter(carrera => {
        const facultadId = parseInt(selectedFacultad);
        const carreraFacultadId = parseInt(carrera.facultad_id || carrera.id_facultad);
        
        console.log(`Comparando: ${carreraFacultadId} === ${facultadId}`, carreraFacultadId === facultadId);
        
        return carreraFacultadId === facultadId;
      });
      
      console.log('Carreras filtradas:', filtered);
      if (currentModalidad) {
        // filtered = filtered.filter(carrera => carrera.modalidad_id === currentModalidad.id);
      }
      
      setFilteredCarreras(filtered);
      setSelectedCarrera(''); 
    } else {
      setFilteredCarreras([]);
      setSelectedCarrera('');
    }
  }, [selectedFacultad, carreras, currentModalidad]);

  const handleFacultadChange = (e) => {
    const value = e.target.value;
    console.log('🎯 Facultad seleccionada:', value);
    setSelectedFacultad(value);
  };

  const handleCarreraChange = (e) => {
    const value = e.target.value;
    console.log('🎯 Carrera seleccionada:', value);
    setSelectedCarrera(value);
  };

  if (loading) {
    return (
      <div className="modalidades-container">
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modalidades-container">
        <div className="loading" style={{ color: 'red' }}>
          Error al cargar datos: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="modalidades-container">
      <div className="breadcrumb">
        <span>Técnico DUEA</span>
        <span className="separator">&gt;&gt;</span>
        <span>Modalidades</span>
        <span className="separator">&gt;&gt;</span>
        <span className="current">{modalidad === 'arco-sur' ? 'ARCO SUR' : 'CEUB'}</span>
      </div>

      <div className="modalidades-content">
        <div className="content-section">
          <h1 className="main-title">
            {modalidad === 'arco-sur' ? 'SISTEMA ARCO SUR' : 'SISTEMA CEUB'}
          </h1>
          
          <div className="description">
            {modalidad === 'arco-sur' ? (
              <p>
                El Sistema de Acreditación Regional de Carreras Universitarias para el MERCOSUR, 
                ARCU-SUR es la continuación de un proceso de similares características, denominado 
                Mecanismo Experimental de Acreditación (MEXA), que se aplicó en un número 
                limitado de carreras de Agronomía, Ingeniería y Medicina. Estas tres titulaciones 
                fueron determinadas por la Reunión de Ministros de Educación, para dar inicio el 
                proceso experimental. Los países participantes fueron Argentina, Brasil, Paraguay, 
                Uruguay, Bolivia y Chile1 , con un total de 62 carreras acreditadas: 19 de Agronomía, 
                29 de Ingeniería y 14 de Medicina. La evaluación del MEXA demostró que fue 
                adecuada la prospección realizada por el Sector Educativo del MERCOSUR, SEM, y 
                que por ello resultaba conveniente la instalación de un sistema de acreditación 
                permanente de la calidad de la formación de nivel universitario en la región.
              </p>
            ) : (
              <p>
                El Comité Ejecutivo de la Universidad Boliviana (CEUB) es el organismo rector 
                del Sistema de la Universidad Boliviana, encargado de la coordinación, planificación 
                y ejecución de políticas, planes y programas del sistema universitario estatal. 
                El CEUB tiene la responsabilidad de velar por la calidad académica, la investigación 
                científica y la extensión universitaria en todas las universidades públicas del país, 
                promoviendo la excelencia educativa y el desarrollo integral de la educación superior 
                en Bolivia.
              </p>
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
        </div>
      </div>
    </div>
  );
};

export default ModalidadesScreen;