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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [facultadesData, carrerasData, modalidadesData] = await Promise.all([
          getFacultades(),
          getCarreras(),
          getModalidades()
        ]);
        
        setFacultades(facultadesData);
        setCarreras(carrerasData);
      
        const modalidadActual = modalidadesData.find(m => 
          m.codigo_modalidad?.toLowerCase() === modalidad.replace('-', '_')
        );
        setCurrentModalidad(modalidadActual);
        
        console.log('Datos cargados:', {
          facultades: facultadesData,
          carreras: carrerasData,
          modalidadesData,
          modalidadActual
        });
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [modalidad]);

  useEffect(() => {
    if (selectedFacultad && carreras.length > 0) {
      let filtered = carreras.filter(carrera => 
        carrera.facultad_id === parseInt(selectedFacultad)
      );
      
      //  relación modalidad-carrera
      if (currentModalidad) {
        // co,mo filtered = filtered.filter(carrera => carrera.modalidad_id === currentModalidad.id);
      }
      
      setFilteredCarreras(filtered);
      setSelectedCarrera(''); 
    } else {
      setFilteredCarreras([]);
      setSelectedCarrera('');
    }
  }, [selectedFacultad, carreras, currentModalidad]);

  const handleFacultadChange = (e) => {
    setSelectedFacultad(e.target.value);
  };

  const handleCarreraChange = (e) => {
    setSelectedCarrera(e.target.value);
  };

  if (loading) {
    return (
      <div className="modalidades-container">
        <div className="loading">Cargando...</div>
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
              <option value="">Seleccionar Facultad</option>
              {facultades.map((facultad) => (
                <option key={facultad.id} value={facultad.id}>
                  {facultad.nombre}
                </option>
              ))}
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
                    : 'Seleccionar Carrera'
                }
              </option>
              {filteredCarreras.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalidadesScreen;