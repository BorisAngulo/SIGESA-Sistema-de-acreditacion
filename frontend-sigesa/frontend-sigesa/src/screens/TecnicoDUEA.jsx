import React, { useEffect, useState } from 'react';
import { getActualizaciones } from '../services/actualizaciones';
import ActualizacionContenido from '../components/ActualizacionContenido';
import './TecnicoDUEA.css';
import mascota from '../assets/mascota.png';

const TecnicoDUEA = () => {
  const [actualizaciones, setActualizaciones] = useState([]);

  useEffect(() => {
    getActualizaciones().then(data => setActualizaciones(data));
  }, []);

  return (
    <div className="tecnico-container">
      <h2>
        Sistema de Gestión y Seguimiento al Proceso de Acreditación<br />
        de las Carreras de la Universidad Mayor de San Simón
      </h2>
      <h3>SIGESA - UMSS</h3>
      <p className="bienvenido"><strong>Bienvenido:</strong> Boris (Técnico DUEA)</p>

      <h4 className="titulo-actualizaciones">Actualizaciones de contenido</h4>

      <div className="contenedor-actualizaciones">
        {actualizaciones.map((act, index) => (
          <ActualizacionContenido
            key={index}
            carrera={act.carrera}
            facultad={act.facultad}
            descripcion={act.descripcion}
            fecha={new Date(act.fecha).toLocaleDateString()}
          />
        ))}
      </div>

      <div className="mascota-container">
        <img src={mascota} alt="Mascota UMSS" />
        <div className="mensaje">Comencemos</div>
        <button className="manual-btn">Manual de Usuario</button>
      </div>
    </div>
  );
};

export default TecnicoDUEA;
