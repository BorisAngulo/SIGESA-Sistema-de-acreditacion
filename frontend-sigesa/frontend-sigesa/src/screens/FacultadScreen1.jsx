import React, { useEffect, useState } from "react";
import { getFacultades, createFacultad, getCarreras } from "../services/api";
import Carreras from "../components/Carreras";
import CarreraModalidad from "../components/CarreraModalidad";

export default function Home() {
  const [facultades, setFacultades] = useState([]);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [facultadSeleccionada, setFacultadSeleccionada] = useState(null);
  const [carreras, setCarreras] = useState([]);

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

  return (
    <div>
      <h2>Facultades</h2>
      <ul>
        {facultades.map((f) => (
          <li key={f.id}>
            {f.nombre_facultad} ({f.codigo_facultad})
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre Facultad"
        />
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Código Facultad"
        />
        <button type="submit">Crear</button>
      </form>

      <hr />

      <div>
        <label>Selecciona una facultad: </label>
        <select onChange={handleSelectFacultad} value={facultadSeleccionada?.id || ""}>
          <option value="">-- Selecciona --</option>
          {facultades.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nombre_facultad}
            </option>
          ))}
        </select>
      </div>

      <Carreras facultad={facultadSeleccionada} />
      <hr />
      <CarreraModalidad carreras={carreras} />
    </div>
  );
}