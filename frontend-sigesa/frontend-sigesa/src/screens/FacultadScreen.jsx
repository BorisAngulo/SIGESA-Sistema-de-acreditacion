import React, { useEffect, useState } from "react";
import { getFacultadesConCarreras, deleteFacultad } from "../services/api";
import { Search, Plus } from "lucide-react";
import { canManageFacultades } from "../services/permissions";
import { useNavigate } from "react-router-dom";
import mascota from "../assets/mascota.png";
import ModalConfirmacion from "../components/ModalConfirmacionEliminacion";
import ModalOpciones from "../components/ModalOpciones";
import ModalCrearFacultad from "../components/ModalCrearFacultad";
import ModalEditarFacultad from "../components/ModalEditarFacultad";
import "../styles/FacultadScreen.css";
import useToast from "../hooks/useToast";

const truncateUrl = (url, maxLength = 50) => {
  if (!url || url.length <= maxLength) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const protocol = urlObj.protocol;
    if (domain.length > maxLength - 10) {
      return url.substring(0, maxLength - 3) + '...';
    }
    
    const domainPart = `${protocol}//${domain}`;
    const remainingLength = maxLength - domainPart.length - 3; 
    
    if (remainingLength > 0) {
      const pathPart = url.substring(domainPart.length);
      if (pathPart.length > remainingLength) {
        return domainPart + pathPart.substring(0, remainingLength) + '...';
      }
    }
    
    return url.substring(0, maxLength - 3) + '...';
  } catch (error) {
    return url.substring(0, maxLength - 3) + '...';
  }
};

export default function FacultadScreen() {
  const [facultadesConCarreras, setFacultadesConCarreras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [opcionesVisibles, setOpcionesVisibles] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [facultadAEliminar, setFacultadAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [facultadAEditar, setFacultadAEditar] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  
  const cargarFacultades = async () => {
    try {
      setLoading(true);
      const facultadesData = await getFacultadesConCarreras();
      setFacultadesConCarreras(facultadesData);
    } catch (error) {
      console.error('Error al cargar facultades:', error);
      setFacultadesConCarreras([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    cargarFacultades();
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

  const handleEditarFacultad = (facultadId) => {
    setFacultadAEditar(facultadId);
    setModalEditarOpen(true);
  };

  const handleFacultadEditada = () => {
    // Recargar la lista de facultades
    cargarFacultades();
    setModalEditarOpen(false);
    setFacultadAEditar(null);
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
      
      // Solo actualizar una lista ya que ahora tenemos una sola
      setFacultadesConCarreras(facultadesConCarreras.filter(f => f.id !== facultadAEliminar.id));
      
      setModalOpen(false);
      setFacultadAEliminar(null);
      toast.success("Facultad eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar facultad:", err);
      toast.error("No se pudo eliminar la facultad. Por favor, inténtalo de nuevo.");
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
    setModalCrearOpen(true);
  };

  const handleFacultadCreada = (nuevaFacultad) => {
    // Recargar la lista de facultades
    cargarFacultades();
    setModalCrearOpen(false);
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

      {/* Header con mascota y botón - Solo para Admin y Técnico */}
      {canManageFacultades() && (
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
      )}

      {/* Lista de facultades */}
      <section className="facultades-list">
        {filteredFacultades.map((f, index) => {
          const truncatedUrl = f.pagina_facultad ? truncateUrl(f.pagina_facultad, 50) : null;
          const isUrlTruncated = truncatedUrl && truncatedUrl.includes('...');
          
          return (
            <div 
              key={f.id} 
              className={`faculty-card-horizontal ${opcionesVisibles === f.id ? 'menu-active' : ''}`}
              style={{ background: cardColors[index % cardColors.length] }}
            >
              <div className="faculty-info">
                <h3 
                  className="faculty-title-clickable"
                  onClick={() => handleVerCarreras(f.id)}
                  title="Haz clic para ver las carreras de esta facultad"
                >
                  {f.nombre_facultad}
                </h3>
                <ul>
                  <li>
                    <strong>Carreras:</strong> {f.numero_carreras}
                  </li>
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
                      title={isUrlTruncated ? f.pagina_facultad : undefined}
                    >
                      <span className={`faculty-web-link-text ${isUrlTruncated ? 'truncated' : ''}`}>
                        {truncatedUrl}
                      </span>
                    </a>
                  ) : (
                    <div className="faculty-web-link">
                      <span className="faculty-web-link-text">No disponible</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal de opciones - visible para todos los usuarios autenticados */}
              <ModalOpciones
                isVisible={opcionesVisibles === f.id}
                onToggle={() => handleToggleOpciones(f.id)}
                onVerCarreras={handleVerCarreras}
                onAgregarCarrera={handleAgregarCarrera}
                onEditarFacultad={handleEditarFacultad}
                onEliminarFacultad={handleEliminarFacultad}
                numeroCarreras={f.numero_carreras}
                facultadId={f.id}
                facultadNombre={f.nombre_facultad}
              />
            </div>
          );
        })}
        
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

      {/* Modal de crear facultad */}
      <ModalCrearFacultad
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSuccess={handleFacultadCreada}
      />

      {/* Modal de editar facultad */}
      <ModalEditarFacultad
        isOpen={modalEditarOpen}
        onClose={() => {
          setModalEditarOpen(false);
          setFacultadAEditar(null);
        }}
        onSuccess={handleFacultadEditada}
        facultadId={facultadAEditar}
      />
    </div>
  );
}