import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { showCarrera } from '../services/api';
import "../styles/InformacionCarrera.css";

export default function InformacionCarrera() {
  const { carreraId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [carrera, setCarrera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.carrera) {
      setCarrera(location.state.carrera);
      setLoading(false);
    } else {
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
    return <div className="loading">Cargando información de la carrera...</div>;
  }

  if (error || !carrera) {
    return (
      <div className="error-container">
        <h2>{error || "Carrera no encontrada"}</h2>
        <button onClick={handleVolver} className="btn-volver">Volver</button>
      </div>
    );
  }

  return (
    <div className="carrera-page">
      <h2 className="facultad-titulo">Facultad de {carrera.facultad}</h2>
      <h3 className="nombre-carrera">{carrera.nombre_carrera}</h3>

      <div className="botones-acreditacion">
        <button className="btn-arco active">ARCU-SUR</button>
        <button className="btn-ceub">CEUB</button>
      </div>

      <div className="acreditacion-box">
        <div className="columna-texto">
          <div className="info-acreditacion">
            <p><strong>Acreditada oficialmente</strong></p>
            <p>- Fecha de resolución: {carrera.fecha_resolucion || '15/03/2025'}</p>
            <p>- Entidad acreditadora: ARCU-SUR (MERCOSUR)</p>
            <br />
            <p><strong>Historial de acreditación:</strong></p>
            <ul>
              <li>Acreditación vigente: 20-12-2018 hasta 20-12-2022</li>
              <li>Acreditación pasada: 27-02-2012 hasta 27-02-2016</li>
              <li>Acreditación pasada: 24-07-2003 hasta 24-07-2007</li>
            </ul>
            <br />
            <p><strong>Información de la carrera:</strong></p>
            <p>
              Visita el sitio: <a href={carrera.pagina_carrera} target="_blank" rel="noopener noreferrer">{carrera.pagina_carrera}</a>
            </p>
            <br />
            <p><strong>¿Cómo obtener el certificado?</strong></p>
            <p>📩 Tu carrera está acreditada. Puedes seguir los pasos para solicitar el certificado de acreditación.</p>
            <p><a href="#">[ Ver guía de pasos ➤ ]</a></p>
          </div>
        </div>
        <div className="columna-imagen">
          <img src="/logoDUEA.jpg" alt="Imagen Facultad" className="imagen-facultad" />
        </div>
      </div>
    </div>
  );
}
