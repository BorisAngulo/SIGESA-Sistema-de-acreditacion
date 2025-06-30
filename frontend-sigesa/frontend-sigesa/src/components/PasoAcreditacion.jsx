import React from 'react';
import './PasoAcreditacion.css';

const PasosAcreditacion = ({ mascota }) => {
  return (
    <div className="pa-container">
      <div className="pa-mascota">
        <img src={mascota} alt="Mascota SIGESA" className="pa-img" />
      </div>

      <div className="pa-botones">
        <button className="pa-btn rojo">Certificado de Acreditación de Carrera</button>
        <button className="pa-btn azul">Certificado de Homologación de Carrera</button>
        <button className="pa-btn gris">Certificado de Participación en Acreditación</button>
      </div>

      <h3 className="pa-titulo">
        Pasos para Obtener tu Certificado de Acreditación de Carrera
      </h3>

      <div className="pa-paso">
        <h4>1. Paso 1: Descarga el Formulario</h4>
        <p>Desde la sección de documentos oficiales.</p>
      </div>

      <div className="pa-paso">
        <h4>2. Paso 2: Llena y Firma</h4>
        <p>Asegúrate de completar tus datos correctamente.</p>
      </div>
    </div>
  );
};

export default PasosAcreditacion;
