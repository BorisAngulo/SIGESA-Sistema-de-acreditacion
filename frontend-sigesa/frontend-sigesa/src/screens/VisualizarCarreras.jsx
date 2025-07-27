import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarrerasByFacultad, getFacultades, deleteCarrera } from '../services/api';
import { 
  ArrowLeft, 
  Plus, 
  Search
} from 'lucide-react';
import ModalOpciones from '../components/ModalOpciones';
import ModalConfirmacion from '../components/ModalConfirmacion';
import mascota from "../assets/mascota.png";
import "../styles/VisualizarCarreras.css";

export default function VisualizarCarreras() {
  const { facultadId } = useParams();
  const navigate = useNavigate();
  const [carreras, setCarreras] = useState([]);
  const [facultad, setFacultad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [opcionesVisibles, setOpcionesVisibles] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [carreraAEliminar, setCarreraAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

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

  const handleToggleOpciones = (id) => {
    setOpcionesVisibles(opcionesVisibles === id ? null : id);
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.menu-toggle-container')) {
      setOpcionesVisibles(null);
    }
  };

  const handleVolver = () => {
    navigate('/facultad');
  };

  const handleAgregarCarrera = () => {
    navigate(`/carrera/crear/${facultadId}`);
  };

  const handleVerInformacion = (carreraId) => {
    const carrera = carreras.find(c => c.id === carreraId);
    console.log('Ver información de:', carrera);
    navigate(`/informacion-carrera/${carreraId}`, { 
      state: { carrera } 
    });
  };

  const handleGestionarModalidades = (carreraId) => {
    const carrera = carreras.find(c => c.id === carreraId);
    console.log('Gestionar modalidades de:', carrera);
    // navigate(`/carrera/${carreraId}/modalidades`);
  };

  const handleEditarCarrera = (carreraId) => {
    const carrera = carreras.find(c => c.id === carreraId);
    console.log('Editar carrera:', carrera);
    // navigate(`/carrera/${carreraId}/editar`);
  };

  const handleEliminarCarrera = (carreraId, carreraNombre) => {
    setCarreraAEliminar({ id: carreraId, nombre: carreraNombre });
    setModalOpen(true);
    setOpcionesVisibles(null); 
  };

  const confirmarEliminacion = async () => {
    if (!carreraAEliminar) return;
    
    setEliminando(true);
    try {
      await deleteCarrera(carreraAEliminar.id);
  
      setCarreras(carreras.filter(c => c.id !== carreraAEliminar.id));
      
      setModalOpen(false);
      setCarreraAEliminar(null);
      alert("Carrera eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar carrera:", err);
      alert("No se pudo eliminar la carrera. Por favor, inténtalo de nuevo.");
    } finally {
      setEliminando(false);
    }
  };

  const cancelarEliminacion = () => {
    setModalOpen(false);
    setCarreraAEliminar(null);
    setEliminando(false);
  };

  const getCardColor = (index) => {
    const colors = [
      '#A21426', '#041B2C', '#7B94AA', '#3C5468', '#072543',
      '#A21426', '#7B94AA', '#3C5468', '#072543', '#041B2C'
    ];
    return colors[index % colors.length];
  };

  const getCardColorDark = (index) => {
    const darkColors = [
      '#7B1221', '#072543', '#5A748A', '#2A3D4F', '#041B2C',
      '#3C5468', '#041B2C', '#A21426', '#7B94AA', '#A21426'
    ];
    return darkColors[index % darkColors.length];
  };

  const filteredCarreras = carreras.filter((carrera) =>
    carrera.nombre_carrera?.toLowerCase().includes(busqueda.toLowerCase()) ||
    carrera.codigo_carrera?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container loading">
        <p className="loading-text">Cargando carreras...</p>
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
    <div className="container" onClick={handleOutsideClick}>
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

      {/* Header con mascota */}
      <div className="header-actions">
        <div className="mascota-container">
          <img src={mascota} alt="mascota" className="mascota-img" />
          <span className="mascota-message">¡Explora las carreras disponibles!</span>
        </div>
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
        <div className="carreras-list">
          {filteredCarreras.map((carrera, index) => (
            <div 
              key={carrera.id} 
              className={`carrera-card-horizontal ${opcionesVisibles === carrera.id ? 'menu-active' : ''}`}
              style={{ 
                background: `linear-gradient(135deg, ${getCardColor(index)} 0%, ${getCardColorDark(index)} 100%)` 
              }}
            >
              <div className="carrera-icon">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              
              <div className="carrera-info">
                <h3>{carrera.nombre_carrera}</h3>
                <ul>
                  <li><strong>Código:</strong> {carrera.codigo_carrera}</li>
                  {carrera.pagina_carrera && (
                    <li>
                      <strong>Web:</strong> 
                      <a 
                        href={carrera.pagina_carrera} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="web-link"
                      >
                        Ver sitio
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Modal de opciones */}
              <ModalOpciones
                isVisible={opcionesVisibles === carrera.id}
                onToggle={() => handleToggleOpciones(carrera.id)}
                onVerInformacion={handleVerInformacion}
                onGestionarModalidades={handleGestionarModalidades}
                onEditarCarrera={handleEditarCarrera}
                onEliminarCarrera={handleEliminarCarrera}
                carreraId={carrera.id}
                carreraNombre={carrera.nombre_carrera}
                tipo="carrera"
              />
            </div>
          ))}
        </div>
      )}

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        facultadNombre={carreraAEliminar?.nombre || ""}
        loading={eliminando}
        tipo="carrera"
      />
    </div>
  );
}