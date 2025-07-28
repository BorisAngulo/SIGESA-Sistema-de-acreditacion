import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const FasesScreen = () => {
  const location = useLocation();
  const params = useParams();
  const [fasesData, setFasesData] = useState(null);

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

  if (!fasesData) {
    return <div>Cargando datos de fases...</div>;
  }

  return (
    <div className="fases-container">
      <div className="breadcrumb">
        <span>Técnico DUEA</span>
        <span className="separator">&gt;&gt;</span>
        <span>Modalidades</span>
        <span className="separator">&gt;&gt;</span>
        <span>{fasesData.modalidad}</span>
        <span className="separator">&gt;&gt;</span>
        <span className="current">Fases</span>
      </div>
      
      <h1>Fases para {fasesData.carreraNombre}</h1>
      <p>Facultad: {fasesData.facultadNombre}</p>
      <p>Modalidad: {fasesData.modalidad}</p>
    </div>
  );
};

export default FasesScreen;