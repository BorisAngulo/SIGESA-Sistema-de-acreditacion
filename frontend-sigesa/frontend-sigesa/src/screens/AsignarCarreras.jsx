import React, { useState, useEffect } from "react";
import { getFacultades, getCarreras } from "../services/api";
import Carreras from "../components/Carreras";
import CarreraModalidad from "../components/CarreraModalidad";
import "./AsignarCarreras.css";

export default function AsignarCarreras() {
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState(null);

  useEffect(() => {
    getFacultades().then(setFacultades);
    getCarreras().then(setCarreras);
  }, []);

  const handleSelect = (e) => {
    const id = Number(e.target.value);
    const f = facultades.find(f => f.id === id);
    setFacultadSeleccionada(f);
  };

  return (
    <div className="asignar-carreras">
      <h3>🎓 Selecciona una facultad:</h3>
      <select onChange={handleSelect} value={facultadSeleccionada?.id || ""}>
        <option value="">-- Selecciona --</option>
        {facultades.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nombre_facultad}
          </option>
        ))}
      </select>

      {facultadSeleccionada && (
        <>
          <Carreras facultad={facultadSeleccionada} />
          <hr className="divider" />
          <CarreraModalidad carreras={carreras} />
        </>
      )}
    </div>
  );
}
