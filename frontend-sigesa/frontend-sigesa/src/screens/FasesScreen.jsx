import React, { useState } from 'react';
import '../styles/Fases.css';
import { ChevronDown, ChevronUp, CheckCircle, MinusCircle } from 'lucide-react';

const fases = [
  { nombre: "Fase 1", progreso: 100, subfases: [] },
  { nombre: "Fase 2", progreso: 100, subfases: [] },
  { nombre: "Fase 3", progreso: 100, subfases: [] },
  {
    nombre: "IES: Elaboración y entrega de la IAE",
    progreso: 50,
    fecha: { inicio: '21-04-2025', fin: '21-10-2025', duracion: '6 meses' },
    subfases: [
      {
        nombre: "Diseño del proceso de Autoevaluación",
        rango: "20-04-25 a 01-05-25",
        fecha: "30-04-25",
        estado: "completo"
      },
      {
        nombre: "Diseño de proyectos IDH",
        rango: "02-05-25 a 10-05-25",
        fecha: "05-05-25",
        estado: "completo"
      },
      {
        nombre: "Inauguración, información, concientización",
        rango: "11-05-25 a 30-05-25",
        estado: "pendiente"
      },
      {
        nombre: "Capacitación y constitución de subcomisiones",
        rango: "01-06-25 a 05-06-25",
        estado: "pendiente"
      }
    ]
  },
  { nombre: "Fase 5", progreso: 10, subfases: [] },
  { nombre: "Fase 6", progreso: 0, subfases: [] }
];

export default function Fases() {
  const [abierta, setAbierta] = useState(null);

  const toggleFase = (index) => {
    setAbierta(abierta === index ? null : index);
  };

  return (
    <div className="fases-container">
      <h2 className="titulo-fases">Fases Acreditación ARCU-SUR</h2>

      {fases.map((fase, index) => (
        <div key={index} className="fase">
          <div className="fase-header" onClick={() => toggleFase(index)}>
            <span>{fase.nombre}</span>
            <span>{fase.progreso}%</span>
            {abierta === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {abierta === index && fase.subfases.length > 0 && (
            <div className="fase-detalle">
              <p className="fase-info">
                Inicio {fase.fecha.inicio} Fin {fase.fecha.fin} Duración {fase.fecha.duracion}
              </p>
              <a href="#" className="descripcion-link">Descripción</a>
              <ul className="subfases-lista">
                {fase.subfases.map((sub, i) => (
                  <li key={i} className="subfase-item">
                    <span>{i + 1}. {sub.nombre}. {sub.rango}</span>
                    <span className="estado-fecha">
                      {sub.fecha && <span>{sub.fecha}</span>}
                      {sub.estado === 'completo' ? (
                        <CheckCircle size={18} color="green" />
                      ) : (
                        <MinusCircle size={18} color="gold" />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
