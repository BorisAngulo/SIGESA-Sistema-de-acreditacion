import React, { useEffect, useState } from "react";
import { getFacultades } from "../services/api";
import mascota from "../assets/mascota.png";
import "./FacultadScreen.css";

export default function FacultadScreen() {
  const [facultades, setFacultades] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [opcionesVisibles, setOpcionesVisibles] = useState(null);

  useEffect(() => {
    getFacultades().then(setFacultades);
  }, []);

  const handleToggleOpciones = (id) => {
    setOpcionesVisibles(opcionesVisibles === id ? null : id);
  };

  const filteredFacultades = facultades.filter((f) =>
    f.nombre_facultad.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="facultades-view">
      {/* Buscador */}
      <section className="busqueda-section">
        <h2 className="search-title">Búsqueda por Facultades</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por facultad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </section>

      {/* Lista de facultades */}
      <section className="facultades-list">
        {filteredFacultades.map((f) => (
          <div key={f.id} className="faculty-card-horizontal">
            <img
              src={`/logos/${f.codigo_facultad}.png`}
              alt={f.nombre_facultad}
              className="faculty-logo"
            />
            <div className="faculty-info">
              <h3>{f.nombre_facultad}</h3>
              <ul>
                <li><strong>Carreras:</strong> {f.carreras || 0}</li>
                <li><strong>Acreditadas:</strong> {f.acreditadas || 0}</li>
                <li><strong>En proceso:</strong> {f.en_proceso || 0}</li>
                <li><strong>Renovación:</strong> {f.renovacion || 0}</li>
              </ul>
            </div>

            {/* Menú de acciones */}
            <div className="menu-toggle" onClick={() => handleToggleOpciones(f.id)}>
              <span style={{ fontSize: "1.5rem", cursor: "pointer" }}>⋮</span>
              {opcionesVisibles === f.id && (
                <div className="dropdown-menu">
                  <a href="#">Ver Carreras</a>
                  <a href="#">Añadir Carrera</a>
                  <a href="#">Generar reportes</a>
                  <a href="#" style={{ color: "#ffdddd" }}>Eliminar Facultad</a>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Imagen + botón estático */}
      <div className="mascota-boton-container">
        <img src={mascota} alt="mascota" className="mascota-img" />
        <button className="btn-estatico">＋ Añadir Facultad</button>
      </div>
    </div>
  );
}
