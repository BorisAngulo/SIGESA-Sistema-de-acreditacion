const API_URL = "http://127.0.0.1:8000/api";

// Facultades
export const getFacultades = async () => {
  const res = await fetch(`${API_URL}/facultades`);
  return res.json();
};

export const createFacultad = async (data) => {
  const res = await fetch(`${API_URL}/facultades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Carreras
export const getCarreras = async () => {
  const res = await fetch(`${API_URL}/carreras`);
  return res.json();
};

export const createCarrera = async (data) => {
  const res = await fetch(`${API_URL}/carreras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Modalidades
export const getModalidades = async () => {
  const res = await fetch(`${API_URL}/modalidades`);
  return res.json();
};

export const createModalidad = async (data) => {
  const res = await fetch(`${API_URL}/modalidades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Carrera Modalidades
export const getCarreraModalidades = async () => {
  const res = await fetch(`${API_URL}/acreditacion-carreras`);
  return res.json();
};

export const createCarreraModalidad = async (data) => {
  const res = await fetch(`${API_URL}/acreditacion-carreras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Fases
export const getFases = async () => {
  const res = await fetch(`${API_URL}/fases`);
  return res.json();
};

export const createFase = async (data) => {
  const res = await fetch(`${API_URL}/fases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Subfases
export const getSubfases = async () => {
  const res = await fetch(`${API_URL}/subfases`);
  return res.json();
};

export const createSubfase = async (data) => {
  const res = await fetch(`${API_URL}/subfases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};