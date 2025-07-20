import React, { useEffect, useState } from 'react';
import { getActualizaciones } from '../services/actualizaciones';
import ActualizacionContenido from '../components/ActualizacionContenido';
import '../styles/TecnicoDUEA.css';
import mascota from '../assets/mascota.png';

const TecnicoDUEA = () => {
  const [actualizaciones, setActualizaciones] = useState([]);

  useEffect(() => {
    getActualizaciones().then(data => setActualizaciones(data));
  }, []);

  return (
    <div className="tecnico-container">
      <header className="header">
        <h2 className="titulo-principal">
          Sistema de Gestión y Seguimiento al Proceso de Acreditación<br />
          de las Carreras de la Universidad Mayor de San Simón
        </h2>
        <h3 className="subtitulo">SIGESA - UMSS</h3>
        <p className="bienvenido"><strong>Bienvenido:</strong> Boris (Técnico DUEA)</p>
      </header>

      <main className="tecnico-contenido">
        <section className="contenedor-actualizaciones">
          <h4 className="titulo-actualizaciones">Actualizaciones de contenido</h4>
          <div className="scroll-actualizaciones">
            {actualizaciones.length > 0 ? (
              actualizaciones.map((act, index) => (
                <ActualizacionContenido
                  key={index}
                  carrera={act.carrera}
                  facultad={act.facultad}
                  descripcion={act.descripcion}
                  fecha={new Date(act.fecha).toLocaleDateString()}
                />
              ))
            ) : (
              <p className="sin-actualizaciones">No hay actualizaciones disponibles.</p>
            )}
          </div>
        </section>

        <aside className="contenedor-mascota-boton">
          <img src={mascota} alt="Mascota UMSS" className="mascota-img" />
          <div className="mensaje">Comencemos</div>
          <button className="manual-btn">Manual de Usuario</button>
        </aside>
      </main>
    </div>
  );
};

export default TecnicoDUEA;
