import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { showCarrera } from '../services/api';
import { 
  ArrowLeft, 
  ExternalLink, 
  MapPin, 
  Users,
  BookOpen,
  Clock,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
//import "../styles/InformacionCarrera.css";

export default function InformacionCarrera() {
  const { carreraId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [carrera, setCarrera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.carrera) {
      // Si viene con datos desde navigate(state)
      setCarrera(location.state.carrera);
      setLoading(false);
    } else {
      // Obtener datos desde la API
      const fetchCarrera = async () => {
        try {
          setLoading(true);
          const data = await showCarrera(carreraId);
          setCarrera(data);
        } catch (err) {
          setError(err.message || 'Error al cargar la carrera');
        } finally {
          setLoading(false);
        }
      };
      fetchCarrera();
    }
  }, [carreraId, location.state]);

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información de la carrera...</p>
      </div>
    );
  }

  if (error || !carrera) {
    return (
      <div className="error-container">
        <h2>{error || "Carrera no encontrada"}</h2>
        <button onClick={handleVolver} className="btn-volver">
          <ArrowLeft size={20} /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="informacion-carrera-container">
      {/* Header */}
      <div className="header-section">
        <button onClick={handleVolver} className="btn-volver">
          <ArrowLeft size={20} /> Volver
        </button>
        
        <div className="carrera-header">
          <div className="carrera-title-section">
            <h1 className="carrera-titulo">{carrera.nombre_carrera}</h1>
            <span className="carrera-codigo">{carrera.codigo_carrera}</span>
          </div>
          
          {carrera.pagina_carrera && (
            <a 
              href={carrera.pagina_carrera} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-pagina-web"
            >
              <ExternalLink size={18} /> Visitar página web
            </a>
          )}
        </div>
      </div>

      {/* Información básica */}
      <div className="contenido-principal">
        <div className="grid-informacion">
          <div className="info-card">
            <div className="card-header">
              <BookOpen size={24} />
              <h3>Información Básica</h3>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{carrera.nombre_carrera}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Código:</span>
                <span className="info-value">{carrera.codigo_carrera}</span>
              </div>
              {carrera.duracion && (
                <div className="info-item">
                  <Clock size={16} />
                  <span className="info-label">Duración:</span>
                  <span className="info-value">{carrera.duracion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="info-card">
            <div className="card-header">
              <Mail size={24} />
              <h3>Información de Contacto</h3>
            </div>
            <div className="card-content">
              {carrera.email && (
                <div className="info-item">
                  <Mail size={16} />
                  <span className="info-label">Email:</span>
                  <a href={`mailto:${carrera.email}`} className="info-link">
                    {carrera.email}
                  </a>
                </div>
              )}
              {carrera.telefono && (
                <div className="info-item">
                  <Phone size={16} />
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{carrera.telefono}</span>
                </div>
              )}
              {carrera.direccion && (
                <div className="info-item">
                  <MapPin size={16} />
                  <span className="info-label">Dirección:</span>
                  <span className="info-value">{carrera.direccion}</span>
                </div>
              )}
              {carrera.pagina_carrera && (
                <div className="info-item">
                  <Globe size={16} />
                  <span className="info-label">Sitio web:</span>
                  <a 
                    href={carrera.pagina_carrera} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="info-link"
                  >
                    {carrera.pagina_carrera}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
