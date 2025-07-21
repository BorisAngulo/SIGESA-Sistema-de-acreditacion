import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarrerasByFacultad, getFacultades } from '../services/api';
import { ArrowLeft, Plus, ExternalLink, Search } from 'lucide-react';
import "../styles/VisualizarCarreras.css";

export default function VisualizarCarreras() {
  const { facultadId } = useParams();
  const navigate = useNavigate();
  const [carreras, setCarreras] = useState([]);
  const [facultad, setFacultad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando datos para facultad ID:', facultadId);
        
        const facultadesData = await getFacultades();
        const facultadEncontrada = facultadesData.find(f => f.id === parseInt(facultadId));
        
        if (!facultadEncontrada) {
          throw new Error('Facultad no encontrada');
        }
        
        setFacultad(facultadEncontrada);
        
        const carrerasData = await getCarrerasByFacultad(facultadId);
        console.log('Carreras cargadas:', carrerasData);
        
        setCarreras(Array.isArray(carrerasData) ? carrerasData : []);
      } catch (error) {
        console.error('Error completo al cargar datos:', error);
        setError(error.message || 'Error al cargar las carreras');
      } finally {
        setLoading(false);
      }
    };

    if (facultadId) {
      cargarDatos();
    }
  }, [facultadId]);

  const handleVolver = () => {
    navigate('/facultad');
  };

  const handleAgregarCarrera = () => {
    navigate(`/carrera/crear/${facultadId}`);
  };

  const filteredCarreras = carreras.filter((carrera) =>
    carrera.nombre_carrera?.toLowerCase().includes(busqueda.toLowerCase()) ||
    carrera.codigo_carrera?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container loading">
        <div className="spinner"></div>
        <p>Cargando carreras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <div>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{marginRight: '10px'}}
            >
              Intentar nuevamente
            </button>
            <button 
              onClick={handleVolver}
              className="btn-secondary"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-top">
          <button 
            onClick={handleVolver}
            className="back-btn"
          >
            <ArrowLeft size={20} />
            <span>Volver a Facultades</span>
          </button>
          
          <button 
            onClick={handleAgregarCarrera}
            className="add-btn"
          >
            <Plus size={20} />
            <span>Agregar Carrera</span>
          </button>
        </div>
        
        <h1 className="title">
          Carreras de {facultad?.nombre_facultad}
        </h1>
        <p className="subtitle">
          {carreras.length} {carreras.length === 1 ? 'carrera encontrada' : 'carreras encontradas'}
        </p>
      </div>

      {carreras.length > 0 && (
        <div className="search-box">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o código de carrera..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      )}

      {filteredCarreras.length === 0 && carreras.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="empty-title">No hay carreras registradas</h3>
          <p className="empty-message">Esta facultad no tiene carreras registradas aún.</p>
          <button 
            onClick={handleAgregarCarrera}
            className="btn-primary"
          >
            Agregar Primera Carrera
          </button>
        </div>
      ) : filteredCarreras.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={64} />
          </div>
          <h3 className="empty-title">No se encontraron resultados</h3>
          <p className="empty-message">No hay carreras que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid">
          {filteredCarreras.map(carrera => (
            <div key={carrera.id} className="card">
              <h3 className="card-title">{carrera.nombre_carrera}</h3>
              <p className="card-code">{carrera.codigo_carrera}</p>
              
              {carrera.pagina_carrera && (
                <a 
                  href={carrera.pagina_carrera} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="card-link"
                >
                  <ExternalLink size={16} />
                  Ver página web
                </a>
              )}
              
              <div className="card-footer">
                <span>ID: {carrera.id}</span>
                <span>Facultad ID: {carrera.facultad_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}