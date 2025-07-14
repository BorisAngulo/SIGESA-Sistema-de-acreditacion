import React, { useState } from "react";
import { createFacultad } from "../services/api";
import "./CrearFacultad.css";

export default function CrearFacultad({ onNuevaFacultad }) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !codigo) {
      setError("Debes completar todos los campos");
      setMensaje(null);
      return;
    }

    try {
      const nueva = await createFacultad({ nombre_facultad: nombre, codigo_facultad: codigo });
      setMensaje("Facultad añadida exitosamente");
      setError(null);
      setNombre("");
      setCodigo("");
      if (onNuevaFacultad) onNuevaFacultad(nueva);
    } catch {
      setError("❌ Ocurrió un error al añadir la facultad");
      setMensaje(null);
    }
  };

  return (
    <div className="crear-facultad">
      <h3>➕ Añadir Nueva Facultad</h3>
      {mensaje && <div className="mensaje-exito">{mensaje}</div>}
      {error && <div className="mensaje-error">{error}</div>}
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
    </div>
  );
}
