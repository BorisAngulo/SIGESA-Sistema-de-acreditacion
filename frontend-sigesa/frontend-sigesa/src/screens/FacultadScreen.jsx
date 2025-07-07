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
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFacultades().then(setFacultades);
    getCarreras().then(setCarreras);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !codigo) {
      setError("Debes completar todos los campos");
      setMensaje(null);
      return;
    }
    try {
      const nueva = await createFacultad({
        nombre_facultad: nombre,
        codigo_facultad: codigo,
      });
      setFacultades([...facultades, nueva]);
      setNombre("");
      setCodigo("");
      setMensaje("✅ Facultad añadida exitosamente");
      setError(null);
    } catch (err) {
      setError("❌ Ocurrió un error al añadir la facultad");
      setMensaje(null);
    }
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
      <section className="busqueda-section">
        <h2 className="search-title">🔎 Búsqueda por Facultades</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por facultad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </section>

      {mensaje && <div className="mensaje-exito">{mensaje}</div>}
      {error && <div className="mensaje-error">{error}</div>}

      <section className="formulario-section">
        <h3 className="form-title">➕ Añadir Nueva Facultad</h3>
        <form onSubmit={handleSubmit} className="formulario-crear">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la Facultad"
          />
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código de la Facultad"
          />
          <button type="submit" className="btn-submit">Registrar Facultad</button>
        </form>
      </section>

      <section className="facultades-list">
        {filteredFacultades.map((f) => (
          <div key={f.id} className="faculty-card">
            <img src={`/logos/${f.codigo_facultad}.png`} alt={f.nombre_facultad} />
            <div className="faculty-info">
              <h3>{f.nombre_facultad}</h3>
              <ul>
                <li><strong>Carreras:</strong> {f.carreras || 0}</li>
                <li><strong>Acreditadas:</strong> {f.acreditadas || 0}</li>
                <li><strong>En proceso:</strong> {f.en_proceso || 0}</li>
                <li><strong>Renovación:</strong> {f.renovacion || 0}</li>
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="select-container">
        <label className="select-label">🎓 Selecciona una facultad:</label>
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
      </section>

      {facultadSeleccionada && (
        <section>
          <Carreras facultad={facultadSeleccionada} />
          <hr className="divider" />
          <CarreraModalidad carreras={carreras} />
        </section>
      )}
    </div>
  );
}
