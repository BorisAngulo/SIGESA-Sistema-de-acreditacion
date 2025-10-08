import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarrerasByFacultad, getFacultades, deleteCarrera } from '../services/api';
import { canManageCarreras } from '../services/permissions';
import { 
  ArrowLeft, 
  Plus, 
  Search
} from 'lucide-react';
import ModalOpciones from '../components/ModalOpciones';
import ModalConfirmacion from '../components/ModalConfirmacion';
import mascota from "../assets/mascota.png";
import "../styles/VisualizarCarreras.css";
import useToast from '../hooks/useToast';

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
  const toast = useToast();

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
    console.log('Redirigiendo a editar carrera con ID:', carreraId);
    navigate(`/carrera/editar/${carreraId}`);
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
      toast.success("Carrera eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar carrera:", err);
      toast.error("No se pudo eliminar la carrera. Por favor, inténtalo de nuevo.");
    } finally {
      setEliminando(false);
    }
  };

  const cancelarEliminacion = () => {
    setModalOpen(false);
    setCarreraAEliminar(null);
    setEliminando(false);
  };

  const filteredCarreras = carreras.filter((carrera) =>
    carrera.nombre_carrera?.toLowerCase().includes(busqueda.toLowerCase()) ||
    carrera.codigo_carrera?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const cardColors = [
    'linear-gradient(135deg, #A21426 0%, #7B1221 100%)',
    'linear-gradient(135deg, #041B2C 0%, #072543 100%)',
    'linear-gradient(135deg, #7B94AA 0%, #5A748A 100%)',
    'linear-gradient(135deg, #3C5468 0%, #2A3D4F 100%)',
    'linear-gradient(135deg, #072543 0%, #041B2C 100%)',
    'linear-gradient(135deg, #A21426 20%, #3C5468 100%)',
    'linear-gradient(135deg, #7B94AA 0%, #041B2C 100%)',
    'linear-gradient(135deg, #3C5468 0%, #A21426 100%)',
    'linear-gradient(135deg, #072543 0%, #7B94AA 100%)',
    'linear-gradient(135deg, #041B2C 0%, #A21426 100%)'
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Cargando carreras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carreras-view">
        <div className="error-container">
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
    <div className="carreras-view" onClick={handleOutsideClick}>
      {/* Sección de búsqueda */}
      <section className="busqueda-section">
        <div className="header-navigation">
          <button 
            onClick={handleVolver}
            className="back-btn"
          >
            <ArrowLeft size={20} />
            <span>Volver a Facultades</span>
          </button>
        </div>
        
        <h2 className="search-title">
          Carreras de {facultad?.nombre_facultad}
        </h2>
        
        {carreras.length > 0 && (
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o código de carrera..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Search className="search-icon" size={20} />
          </div>
        )}
      </section>

      {/* Header con mascota y botón - Solo para Admin y Técnico */}
      {canManageCarreras() ? (
        <div className="header-actions">
          <div className="mascota-container">
            <img src={mascota} alt="mascota" className="mascota-img" />
            <span className="mascota-message">¡Gestiona las carreras de la facultad!</span>
          </div>
          <button className="btn-agregar-facultad" onClick={handleAgregarCarrera}>
            <Plus size={20} />
            <span>Añadir Carrera</span>
          </button>
        </div>
      ) : (
        <div className="header-actions">
          <div className="mascota-container">
            <img src={mascota} alt="mascota" className="mascota-img" />
            <span className="mascota-message">¡Explora las carreras disponibles!</span>
          </div>
        </div>
      )}

      {/* Lista de carreras */}
      <section className="facultades-list" style={{ padding: '0 20px' }}>
        {filteredCarreras.length === 0 && carreras.length === 0 ? (
          <div className="no-results">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3>No hay carreras registradas</h3>
            <p>Esta facultad no tiene carreras registradas aún.</p>
            <button 
              onClick={handleAgregarCarrera}
              className="btn-agregar-facultad"
              style={{ marginTop: '20px' }}
            >
              <Plus size={20} />
              <span>Agregar Primera Carrera</span>
            </button>
          </div>
        ) : filteredCarreras.length === 0 ? (
          <div className="no-results">
            <Search size={48} className="no-results-icon" />
            <p>No se encontraron carreras que coincidan con su búsqueda.</p>
          </div>
        ) : (
          filteredCarreras.map((carrera, index) => (
            <div 
              key={carrera.id} 
              className={`faculty-card-horizontal ${opcionesVisibles === carrera.id ? 'menu-active' : ''}`}
              style={{ background: cardColors[index % cardColors.length] }}
            >
              
              <div className="faculty-info">
                <h3 
                  className="faculty-title-clickable"
                  onClick={() => handleVerInformacion(carrera.id)}
                  title="Haz clic para ver la información de esta carrera"
                >
                  {carrera.nombre_carrera}
                </h3>
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
          ))
        )}
      </section>

      {/* Modal de confirmación */}
      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        facultadNombre={carreraAEliminar?.nombre || ""}
        loading={eliminando}
        tipo="carrera"
      />
      <div style={{ height: '25px' }}></div>
    </div>
  );
}