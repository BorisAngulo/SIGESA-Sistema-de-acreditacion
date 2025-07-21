import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarrerasByFacultad, getFacultades } from '../services/api';
import { 
  ArrowLeft, 
  Plus, 
  ExternalLink, 
  Search, 
  MoreVertical,
  Eye,
  Settings,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import "../styles/VisualizarCarreras.css";

// Componente Modal de Opciones
const ModalOpciones = ({ 
  isOpen, 
  onClose, 
  carrera, 
  onVerInformacion,
  onGestionarModalidades,
  onEditar,
  onEliminar 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-opciones">
        <div className="modal-header">
          <h3 className="modal-title">{carrera?.nombre_carrera}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="carrera-info">
            <span className="carrera-codigo">{carrera?.codigo_carrera}</span>
            {carrera?.pagina_carrera && (
              <a 
                href={carrera.pagina_carrera} 
                target="_blank" 
                rel="noopener noreferrer"
                className="carrera-link"
              >
                <ExternalLink size={14} />
                Página web
              </a>
            )}
          </div>
          
          <div className="opciones-lista">
            <button 
              className="opcion-btn info"
              onClick={() => onVerInformacion(carrera)}
            >
              <Eye size={18} />
              <span>Ver información</span>
            </button>
            
            <button 
              className="opcion-btn modalidades"
              onClick={() => onGestionarModalidades(carrera)}
            >
              <Settings size={18} />
              <span>Gestionar modalidades</span>
            </button>
            
            <button 
              className="opcion-btn editar"
              onClick={() => onEditar(carrera)}
            >
              <Edit2 size={18} />
              <span>Editar</span>
            </button>
            
            <button 
              className="opcion-btn eliminar"
              onClick={() => onEliminar(carrera)}
            >
              <Trash2 size={18} />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }

        .modal-opciones {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 400px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f8fafc;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          max-width: 80%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .modal-close {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .modal-body {
          padding: 24px;
        }

        .carrera-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px;
          background-color: #f1f5f9;
          border-radius: 8px;
        }

        .carrera-codigo {
          background-color: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .carrera-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #3b82f6;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .carrera-link:hover {
          color: #2563eb;
        }

        .opciones-lista {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .opcion-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          background-color: white;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
        }

        .opcion-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .opcion-btn.info {
          color: #3b82f6;
          border-color: #bfdbfe;
        }

        .opcion-btn.info:hover {
          background-color: #eff6ff;
          border-color: #93c5fd;
        }

        .opcion-btn.modalidades {
          color: #059669;
          border-color: #a7f3d0;
        }

        .opcion-btn.modalidades:hover {
          background-color: #ecfdf5;
          border-color: #6ee7b7;
        }

        .opcion-btn.editar {
          color: #d97706;
          border-color: #fed7aa;
        }

        .opcion-btn.editar:hover {
          background-color: #fffbeb;
          border-color: #fdba74;
        }

        .opcion-btn.eliminar {
          color: #dc2626;
          border-color: #fecaca;
        }

        .opcion-btn.eliminar:hover {
          background-color: #fef2f2;
          border-color: #fca5a5;
        }

        @media (max-width: 640px) {
          .modal-opciones {
            width: 95%;
            margin: 20px;
          }
          
          .modal-header {
            padding: 16px 20px;
          }
          
          .modal-body {
            padding: 20px;
          }
          
          .carrera-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default function VisualizarCarreras() {
  const { facultadId } = useParams();
  const navigate = useNavigate();
  const [carreras, setCarreras] = useState([]);
  const [facultad, setFacultad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);

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

  const handleAbrirOpciones = (carrera) => {
    setCarreraSeleccionada(carrera);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setCarreraSeleccionada(null);
  };

  const handleVerInformacion = (carrera) => {
    console.log('Ver información de:', carrera);
    // Aquí puedes navegar a una página de detalle
    // navigate(`/carrera/${carrera.id}/informacion`);
    handleCerrarModal();
  };

  const handleGestionarModalidades = (carrera) => {
    console.log('Gestionar modalidades de:', carrera);
    // Aquí puedes navegar a la página de modalidades
    // navigate(`/carrera/${carrera.id}/modalidades`);
    handleCerrarModal();
  };

  const handleEditar = (carrera) => {
    console.log('Editar carrera:', carrera);
    // Aquí puedes navegar a la página de edición
    // navigate(`/carrera/${carrera.id}/editar`);
    handleCerrarModal();
  };

  const handleEliminar = (carrera) => {
    console.log('Eliminar carrera:', carrera);
    // Aquí puedes mostrar un modal de confirmación de eliminación
    handleCerrarModal();
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
              <div className="card-header">
                <h3 className="card-title">{carrera.nombre_carrera}</h3>
                <button 
                  className="options-btn"
                  onClick={() => handleAbrirOpciones(carrera)}
                  title="Opciones"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
              
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

      {/* Modal de opciones */}
      <ModalOpciones
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        carrera={carreraSeleccionada}
        onVerInformacion={handleVerInformacion}
        onGestionarModalidades={handleGestionarModalidades}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
    </div>
  );
}