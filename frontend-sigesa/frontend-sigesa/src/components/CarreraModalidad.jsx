import React, { useEffect, useState } from "react";
import {
  getCarreraModalidades,
  createCarreraModalidad,
  getFases,
  createFase,
  getSubfases,
  createSubfase,
  getModalidades,
} from "../services/api";

const MODALIDADES_FIJAS = [
  { id: 1, nombre: "ARCOSUR" },
  { id: 2, nombre: "CEUB" },
];

export default function CarreraModalidad({ carreras }) {
  const [carreraId, setCarreraId] = useState("");
  const [modalidadId, setModalidadId] = useState("");
  const [carreraModalidades, setCarreraModalidades] = useState([]);
  const [fases, setFases] = useState([]);
  const [subfases, setSubfases] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [modalidades, setModalidades] = useState(MODALIDADES_FIJAS);

  // Formularios para agregar fase y subfase
  const [nuevaFase, setNuevaFase] = useState({
    nombre_fase: "",
    descripcion_fase: "",
    fecha_inicio_fase: "",
    fecha_fin_fase: "",
  });
  const [nuevaSubfase, setNuevaSubfase] = useState({});

  // Cargar carrera-modalidades y modalidades al montar y después de crear una nueva
  const cargarCarreraModalidades = async () => {
    try {
      const data = await getCarreraModalidades();
      // Verificar que data es un array
      setCarreraModalidades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar carrera modalidades:', error);
      setCarreraModalidades([]);
    }
  };

  useEffect(() => {
    cargarCarreraModalidades();
    // Si quieres obtener las modalidades desde la API, descomenta:
    // getModalidades().then(setModalidades);
  }, []);

  // Cargar fases y subfases cuando se selecciona una carrera-modalidad existente
  const cargarFasesYSubfases = async (carreraModalidadId) => {
    try {
      const todasFases = await getFases();
      const fasesFiltradas = Array.isArray(todasFases) ? 
        todasFases.filter((f) => Number(f.carrera_modalidad_id) === Number(carreraModalidadId)) : 
        [];
      setFases(fasesFiltradas);

      const todasSubfases = await getSubfases();
      setSubfases(Array.isArray(todasSubfases) ? todasSubfases : []);
    } catch (error) {
      console.error('Error al cargar fases y subfases:', error);
      setFases([]);
      setSubfases([]);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    setMensaje("");
    setFases([]);
    setSubfases([]);

    if (!carreraId || !modalidadId) {
      setMensaje("Selecciona carrera y modalidad.");
      return;
    }

    // Verifica si ya existe la combinación
    const existente = Array.isArray(carreraModalidades) ? 
      carreraModalidades.find(
        (cm) =>
          Number(cm.carrera_id) === Number(carreraId) &&
          Number(cm.modalidad_id) === Number(modalidadId)
      ) : null;

    if (existente) {
      setMensaje("Ya existe esta Carrera-Modalidad. Mostrando fases...");
      await cargarFasesYSubfases(existente.id);
      return;
    }

    // Aquí llamas al servicio para guardar en el backend
    await createCarreraModalidad({
      carrera_id: Number(carreraId),
      modalidad_id: Number(modalidadId),
      estado_modalidad: true,
    });

    setMensaje("¡Carrera-Modalidad creada exitosamente!");
    setFases([]);
    setSubfases([]);
    setCarreraId("");
    setModalidadId("");
    await cargarCarreraModalidades();
  };

  // Función para obtener el nombre de la carrera por id
  const getNombreCarrera = (id) => {
    const carrera = carreras.find((c) => Number(c.id) === Number(id));
    return carrera ? carrera.nombre_carrera : "Desconocida";
  };

  // Función para obtener el nombre de la modalidad por id
  const getNombreModalidad = (id) => {
    const modalidad = modalidades.find((m) => Number(m.id) === Number(id));
    return modalidad ? modalidad.nombre : "Desconocida";
  };

  // Agregar nueva fase
  const handleAgregarFase = async (e, carreraModalidadId) => {
    e.preventDefault();
    await createFase({
      ...nuevaFase,
      carrera_modalidad_id: carreraModalidadId,
      id_usuario_updated_user: 1, // Cambia según tu lógica de usuario
    });
    setNuevaFase({
      nombre_fase: "",
      descripcion_fase: "",
      fecha_inicio_fase: "",
      fecha_fin_fase: "",
    });
    await cargarFasesYSubfases(carreraModalidadId);
  };

  // Agregar nueva subfase
  const handleAgregarSubfase = async (e, faseId) => {
    e.preventDefault();
    await createSubfase({
      ...nuevaSubfase[faseId],
      fase_id: faseId,
    });
    setNuevaSubfase((prev) => ({ ...prev, [faseId]: {} }));
    // Recargar subfases
    const todasSubfases = await getSubfases();
    setSubfases(todasSubfases);
  };

  // Mostrar fases y subfases solo si hay una carrera-modalidad seleccionada
  const carreraModalidadSeleccionada = carreraModalidades.find(
    (cm) =>
      Number(cm.carrera_id) === Number(carreraId) &&
      Number(cm.modalidad_id) === Number(modalidadId)
  );

  return (
    <div>
      <h3>Agregar Carrera-Modalidad</h3>
      <form onSubmit={handleAgregar}>
        <select value={carreraId} onChange={(e) => setCarreraId(e.target.value)}>
          <option value="">Selecciona carrera</option>
          {carreras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre_carrera}
            </option>
          ))}
        </select>
        <select value={modalidadId} onChange={(e) => setModalidadId(e.target.value)}>
          <option value="">Selecciona modalidad</option>
          {modalidades.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
        <button type="submit">Agregar</button>
      </form>
      {mensaje && <div style={{ marginTop: 10 }}>{mensaje}</div>}

      {/* Fases y subfases */}
      {carreraModalidadSeleccionada && (
        <div>
          <h4>Fases asociadas:</h4>
          <ul>
            {fases.map((f) => (
              <li key={f.id}>
                <b>{f.nombre_fase}</b>: {f.descripcion_fase} <br />
                <small>
                  {f.fecha_inicio_fase} - {f.fecha_fin_fase}
                </small>
                {/* Subfases */}
                <ul>
                  {subfases
                    .filter((sf) => Number(sf.fase_id) === Number(f.id))
                    .map((sf) => (
                      <li key={sf.id}>
                        <b>{sf.nombre_subfase}</b>: {sf.descripcion_subfase}
                      </li>
                    ))}
                </ul>
                {/* Formulario para agregar subfase */}
                <form onSubmit={(e) => handleAgregarSubfase(e, f.id)}>
                  <input
                    value={nuevaSubfase[f.id]?.nombre_subfase || ""}
                    onChange={(e) =>
                      setNuevaSubfase((prev) => ({
                        ...prev,
                        [f.id]: {
                          ...prev[f.id],
                          nombre_subfase: e.target.value,
                        },
                      }))
                    }
                    placeholder="Nombre Subfase"
                    required
                  />
                  <input
                    value={nuevaSubfase[f.id]?.descripcion_subfase || ""}
                    onChange={(e) =>
                      setNuevaSubfase((prev) => ({
                        ...prev,
                        [f.id]: {
                          ...prev[f.id],
                          descripcion_subfase: e.target.value,
                        },
                      }))
                    }
                    placeholder="Descripción Subfase"
                    required
                  />
                  <button type="submit">Agregar Subfase</button>
                </form>
              </li>
            ))}
          </ul>
          {/* Formulario para agregar fase */}
          <form onSubmit={(e) => handleAgregarFase(e, carreraModalidadSeleccionada.id)}>
            <input
              value={nuevaFase.nombre_fase}
              onChange={(e) =>
                setNuevaFase((prev) => ({ ...prev, nombre_fase: e.target.value }))
              }
              placeholder="Nombre Fase"
              required
            />
            <input
              value={nuevaFase.descripcion_fase}
              onChange={(e) =>
                setNuevaFase((prev) => ({ ...prev, descripcion_fase: e.target.value }))
              }
              placeholder="Descripción Fase"
              required
            />
            <input
              type="date"
              value={nuevaFase.fecha_inicio_fase}
              onChange={(e) =>
                setNuevaFase((prev) => ({ ...prev, fecha_inicio_fase: e.target.value }))
              }
              required
            />
            <input
              type="date"
              value={nuevaFase.fecha_fin_fase}
              onChange={(e) =>
                setNuevaFase((prev) => ({ ...prev, fecha_fin_fase: e.target.value }))
              }
              required
            />
            <button type="submit">Agregar Fase</button>
          </form>
        </div>
      )}

      <hr />
      <h4>Carreras-Modalidades ya creadas</h4>
      <ul>
        {carreraModalidades.map((cm) => (
          <li key={cm.id}>
            <b>{getNombreCarrera(cm.carrera_id)}</b> - <b>{getNombreModalidad(cm.modalidad_id)}</b>
            {cm.estado_modalidad === false && <span style={{ color: "red" }}> (Inactiva)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}