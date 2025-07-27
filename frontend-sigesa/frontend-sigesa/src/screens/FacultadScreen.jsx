import React, { useEffect, useState } from "react";
import { getFacultades, deleteFacultad, getCarrerasByFacultad } from "../services/api";
import { Search, Plus } from "lucide-react";
import mascota from "../assets/mascota.png";
import { useNavigate } from "react-router-dom";
import ModalConfirmacion from "../components/ModalConfirmacion";
import ModalOpciones from "../components/ModalOpciones";
import "../styles/FacultadScreen.css";

export default function FacultadScreen() {
  const [facultades, setFacultades] = useState([]);
  const [facultadesConCarreras, setFacultadesConCarreras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [opcionesVisibles, setOpcionesVisibles] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [facultadAEliminar, setFacultadAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        const facultadesData = await getFacultades();
        setFacultades(facultadesData);
        
        const facultadesConConteo = await Promise.all(
          facultadesData.map(async (facultad) => {
            try {
              const carreras = await getCarrerasByFacultad(facultad.id);
              return {
                ...facultad,
                numeroCarreras: carreras.length,
                carreras: carreras
              };
            } catch (error) {
              console.error(`Error al obtener carreras para facultad ${facultad.id}:`, error);
              return {
                ...facultad,
                numeroCarreras: 0,
                carreras: []
              };
            }
          })
        );
        
        setFacultadesConCarreras(facultadesConConteo);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setFacultadesConCarreras([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleToggleOpciones = (id) => {
    setOpcionesVisibles(opcionesVisibles === id ? null : id);
  };
  
  const handleOutsideClick = (e) => {
    if (!e.target.closest('.menu-toggle-container')) {
      setOpcionesVisibles(null);
    }
  };

  const handleVerCarreras = (facultadId) => {
    navigate(`/visualizar-carreras/${facultadId}`);
  };

  const handleAgregarCarrera = (facultadId) => {
    navigate(`/carrera/crear/${facultadId}`);
  };

  const handleEliminarFacultad = (id, nombre) => {
    setFacultadAEliminar({ id, nombre });
    setModalOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!facultadAEliminar) return;
    
    setEliminando(true);
    try {
      await deleteFacultad(facultadAEliminar.id);
      
      setFacultades(facultades.filter(f => f.id !== facultadAEliminar.id));
      setFacultadesConCarreras(facultadesConCarreras.filter(f => f.id !== facultadAEliminar.id));
      
      setModalOpen(false);
      setFacultadAEliminar(null);
      alert("Facultad eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar facultad:", err);
      alert("No se pudo eliminar la facultad. Por favor, inténtalo de nuevo.");
    } finally {
      setEliminando(false);
    }
  };

  const cancelarEliminacion = () => {
    setModalOpen(false);
    setFacultadAEliminar(null);
    setEliminando(false);
  };

  const handleAgregarFacultad = () => {
    navigate("/facultad/crear"); 
  };

  const filteredFacultades = facultadesConCarreras.filter((f) =>
    f.nombre_facultad.toLowerCase().includes(busqueda.toLowerCase())
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
         <p className="loading-text">Cargando facultades...</p>
      </div>
    );
  }

  return (
    <div className="facultades-view" onClick={handleOutsideClick}>
      <section className="busqueda-section">
        <h2 className="search-title">Búsqueda por Facultades</h2>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por facultad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
      </section>

      {/* Header con mascota y botón */}
      <div className="header-actions">
        <div className="mascota-container">
          <img src={mascota} alt="mascota" className="mascota-img" />
          <span className="mascota-message">¡Gestiona tus facultades!</span>
        </div>
        <button className="btn-agregar-facultad" onClick={handleAgregarFacultad}>
          <Plus size={20} />
          <span>Añadir Facultad</span>
        </button>
      </div>

      {/* Lista de facultades */}
      <section className="facultades-list">
        {filteredFacultades.map((f, index) => (
          <div 
            key={f.id} 
            className={`faculty-card-horizontal ${opcionesVisibles === f.id ? 'menu-active' : ''}`}
            style={{ background: cardColors[index % cardColors.length] }}
          >
            <img
              src={`/logos/${f.codigo_facultad}.png`}
              alt={f.nombre_facultad}
              className="faculty-logo"
              onError={(e) => {
                e.target.src = "/logos/default.png";
              }}
            />
           <div className="faculty-info">
            <h3>{f.nombre_facultad}</h3>
            <ul>
              <li><strong>Carreras:</strong> {f.numeroCarreras}</li>
              <li><strong>Código:</strong> {f.codigo_facultad}</li>
            </ul>
            <div className={`faculty-web-section ${!f.pagina_facultad ? 'no-link' : ''}`}>
              <span className="web-label">Sitio Web</span>
              {f.pagina_facultad ? (
                <a 
                  href={f.pagina_facultad} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="faculty-web-link"
                >
                  <span className="faculty-web-link-text">{f.pagina_facultad}</span>
                </a>
              ) : (
                <div className="faculty-web-link">
                  <span className="faculty-web-link-text">No disponible</span>
                </div>
              )}
            </div>
          </div>

            {/* Modal de opciones */}
            <ModalOpciones
              isVisible={opcionesVisibles === f.id}
              onToggle={() => handleToggleOpciones(f.id)}
              onVerCarreras={handleVerCarreras}
              onAgregarCarrera={handleAgregarCarrera}
              onEliminarFacultad={handleEliminarFacultad}
              numeroCarreras={f.numeroCarreras}
              facultadId={f.id}
              facultadNombre={f.nombre_facultad}
            />
          </div>
        ))}
        
        {filteredFacultades.length === 0 && !loading && (
          <div className="no-results">
            <Search size={48} className="no-results-icon" />
            <p>No se encontraron facultades que coincidan con su búsqueda.</p>
          </div>
        )}
      </section>

      {/* Modal de confirmación */}
      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        facultadNombre={facultadAEliminar?.nombre || ""}
        loading={eliminando}
      />
    </div>
  );
}