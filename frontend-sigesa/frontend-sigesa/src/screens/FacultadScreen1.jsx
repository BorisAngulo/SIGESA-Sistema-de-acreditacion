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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [facultadesData, carrerasData] = await Promise.all([
          getFacultades(),
          getCarreras()
        ]);
        
        // Verificar que los datos sean arrays
        setFacultades(Array.isArray(facultadesData) ? facultadesData : []);
        setCarreras(Array.isArray(carrerasData) ? carrerasData : []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        setFacultades([]);
        setCarreras([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const nueva = await createFacultad({
        nombre_facultad: nombre,
        codigo_facultad: codigo,
      });
      
      // Actualizar la lista de facultades con la nueva facultad
      setFacultades(prevFacultades => [...prevFacultades, nueva]);
      setNombre("");
      setCodigo("");
      setError(null);
    } catch (err) {
      console.error('Error al crear facultad:', err);
      setError('Error al crear la facultad. Por favor, intenta de nuevo.');
    }
  };

  const handleSelectFacultad = (e) => {
    const id = Number(e.target.value);
    const facultad = facultades.find((f) => f.id === id);
    setFacultadSeleccionada(facultad);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h2>Facultades</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '10px' 
        }}>
          {error}
        </div>
      )}
      
      <ul>
        {facultades.length > 0 ? (
          facultades.map((f) => (
            <li key={f.id}>
              {f.nombre_facultad} ({f.codigo_facultad})
            </li>
          ))
        ) : (
          <li>No hay facultades registradas</li>
        )}
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
          {facultades.length > 0 ? (
            facultades.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre_facultad}
              </option>
            ))
          ) : (
            <option disabled>No hay facultades disponibles</option>
          )}
        </select>
      </div>

      <Carreras facultad={facultadSeleccionada} />
      <hr />
      <CarreraModalidad carreras={carreras} />
    </div>
  );
}