import React, { useEffect, useState } from "react";
import { getFacultades, createFacultad, getCarreras } from "../services/api";
import Carreras from "../components/Carreras";
import CarreraModalidad from "../components/CarreraModalidad";
import "./FacultadScreen.css";

export default function FacultadScreen() {
  const [facultades, setFacultades] = useState([]);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [facultadSeleccionada, setFacultadSeleccionada] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    getFacultades().then(setFacultades);
    getCarreras().then(setCarreras);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nueva = await createFacultad({
      nombre_facultad: nombre,
      codigo_facultad: codigo,
    });
    setFacultades([...facultades, nueva]);
    setNombre("");
    setCodigo("");
  };

  const handleSelectFacultad = (e) => {
    const id = Number(e.target.value);
    const facultad = facultades.find((f) => f.id === id);
    setFacultadSeleccionada(facultad);
  };

  const filteredFacultades = facultades.filter((f) =>
    f.nombre_facultad.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="facultades-view">
      <h2 className="search-title">Búsqueda por Facultades</h2>
      <input
        type="text"
        className="search-input"
        placeholder="Buscar por facultad..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="facultades-list">
        {filteredFacultades.map((f) => (
          <div key={f.id} className="faculty-card">
            <img src={`/logos/${f.codigo_facultad}.png`} alt={f.nombre_facultad} />
            <div>
              <h3>{f.nombre_facultad}</h3>
              <ul>
                <li>Carreras: {f.carreras || 0}</li>
                <li>Acreditadas: {f.acreditadas || 0}</li>
                <li>En proceso: {f.en_proceso || 0}</li>
                <li>Renovación: {f.renovacion || 0}</li>
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="buttons-container">
        <button onClick={handleSubmit} className="btn-add">
          <span>+</span> Añadir Facultad
        </button>
        <button className="btn-delete">
          <span>-</span> Eliminar Facultad
        </button>
      </div>

      <div className="select-container">
        <label className="select-label">Selecciona una facultad:</label>
        <select
          onChange={handleSelectFacultad}
          value={facultadSeleccionada?.id || ""}
          className="select-input"
        >
          <option value="">-- Selecciona --</option>
          {facultades.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre_facultad}
            </option>
          ))}
        </select>
      </div>

      <Carreras facultad={facultadSeleccionada} />
      <hr className="divider" />
      <CarreraModalidad carreras={carreras} />
    </div>
  );
}
