const API_URL = "http://127.0.0.1:8000/api";

// Facultades
export const getFacultades = async () => {
  try {
    const res = await fetch(`${API_URL}/facultades`);
    const response = await res.json();
    
    // Verificar si la respuesta es exitosa y extraer los datos
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener facultades:', error);
    return [];
  }
};

export const createFacultad = async (data) => {
  try {
    const res = await fetch(`${API_URL}/facultades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    
    // Verificar si la respuesta es exitosa y extraer los datos
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al crear facultad:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al crear facultad');
    }
  } catch (error) {
    console.error('Error al crear facultad:', error);
    throw error;
  }
};

// Carreras
export const getCarreras = async () => {
  try {
    const res = await fetch(`${API_URL}/carreras`);
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener carreras:', error);
    return [];
  }
};

export const createCarrera = async (data) => {
  try {
    const res = await fetch(`${API_URL}/carreras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al crear carrera:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al crear carrera');
    }
  } catch (error) {
    console.error('Error al crear carrera:', error);
    throw error;
  }
};

// Modalidades
export const getModalidades = async () => {
  try {
    const res = await fetch(`${API_URL}/modalidades`);
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener modalidades:', error);
    return [];
  }
};

export const createModalidad = async (data) => {
  try {
    const res = await fetch(`${API_URL}/modalidades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al crear modalidad:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al crear modalidad');
    }
  } catch (error) {
    console.error('Error al crear modalidad:', error);
    throw error;
  }
};

// Carrera Modalidades
export const getCarreraModalidades = async () => {
  try {
    const res = await fetch(`${API_URL}/acreditacion-carreras`);
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener carrera modalidades:', error);
    return [];
  }
};

export const createCarreraModalidad = async (data) => {
  try {
    const res = await fetch(`${API_URL}/acreditacion-carreras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al crear carrera modalidad:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al crear carrera modalidad');
    }
  } catch (error) {
    console.error('Error al crear carrera modalidad:', error);
    throw error;
  }
};

// Fases
export const getFases = async () => {
  try {
    const res = await fetch(`${API_URL}/fases`);
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener fases:', error);
    return [];
  }
};

export const createFase = async (data) => {
  try {
    const res = await fetch(`${API_URL}/fases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al crear fase:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al crear fase');
    }
  } catch (error) {
    console.error('Error al crear fase:', error);
    throw error;
  }
};

// Subfases
export const getSubfases = async () => {
  try {
    const res = await fetch(`${API_URL}/subfases`);
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener subfases:', error);
    return [];
  }
};

export const createSubfase = async (data) => {
  try {
    const res = await fetch(`${API_URL}/subfases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al crear subfase:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al crear subfase');
    }
  } catch (error) {
    console.error('Error al crear subfase:', error);
    throw error;
  }
};