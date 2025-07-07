import React from 'react';

const ActualizacionContenido = ({ carrera, facultad, descripcion, fecha }) => {
  return (
    <div className="actualizacion-item">
      <h4 className="carrera">
        {carrera} - <span className="facultad">{facultad}</span>
      </h4>
      <p className="descripcion">{descripcion}</p>
      <span className="fecha">{fecha}</span>
    </div>
  );
};

export default ActualizacionContenido;
