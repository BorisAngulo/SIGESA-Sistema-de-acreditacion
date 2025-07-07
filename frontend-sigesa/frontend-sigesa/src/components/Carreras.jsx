import React, { useState, useEffect } from "react";
import { getCarreras, createCarrera } from "../services/api";

export default function Carreras({ facultad }) {
  const [carreras, setCarreras] = useState([]);
  const [nombreCarrera, setNombreCarrera] = useState("");
  const [codigoCarrera, setCodigoCarrera] = useState("");
  const [paginaCarrera, setPaginaCarrera] = useState("");

  useEffect(() => {
    if (facultad) {
      getCarreras().then((data) => {
        // Verificar que data es un array antes de filtrar
        if (Array.isArray(data)) {
          // Filtra solo las carreras de la facultad seleccionada
          setCarreras(data.filter((c) => c.facultad_id === facultad.id));
        } else {
          console.error('Los datos de carreras no son un array:', data);
          setCarreras([]);
        }
      }).catch((error) => {
        console.error('Error al cargar carreras:', error);
        setCarreras([]);
      });
    }
  }, [facultad]);

  if (!facultad) return <div>Seleccione una facultad para ver/agregar carreras.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreCarrera.trim() || !codigoCarrera.trim()) return;

    try {
      const nuevaCarrera = {
        facultad_id: facultad.id,
        codigo_carrera: codigoCarrera,
        nombre_carrera: nombreCarrera,
        pagina_carrera: paginaCarrera || null,
      };

      const creada = await createCarrera(nuevaCarrera);
      setCarreras([...carreras, creada]);
      setNombreCarrera("");
      setCodigoCarrera("");
      setPaginaCarrera("");
    } catch (error) {
      console.error('Error al crear carrera:', error);
      alert('Error al crear la carrera. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div>
      <h3>Carreras de {facultad.nombre_facultad}</h3>
      <ul>
        {carreras.map((c) => (
          <li key={c.id}>
            <b>{c.nombre_carrera}</b> ({c.codigo_carrera}){" "}
            {c.pagina_carrera && (
              <a href={c.pagina_carrera} target="_blank" rel="noopener noreferrer">
                Página
              </a>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          value={nombreCarrera}
          onChange={(e) => setNombreCarrera(e.target.value)}
          placeholder="Nombre Carrera"
          required
        />
        <input
          value={codigoCarrera}
          onChange={(e) => setCodigoCarrera(e.target.value)}
          placeholder="Código Carrera"
          required
        />
        <input
          value={paginaCarrera}
          onChange={(e) => setPaginaCarrera(e.target.value)}
          placeholder="Página Carrera (opcional)"
        />
        <button type="submit">Añadir Carrera</button>
      </form>
    </div>
  );
}