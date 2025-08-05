const API_URL = "http://127.0.0.1:8000/api";

// Obtener token del localStorage
const getAuthToken = () => localStorage.getItem('token');

// Headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Funciones de autenticación
export const authAPI = {
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  me: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }
};

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

// Facultades con conteo de carreras optimizado
export const getFacultadesConCarreras = async () => {
  try {
    const res = await fetch(`${API_URL}/facultades-con-carreras`);
    const response = await res.json();
    
    console.log('Respuesta completa del endpoint:', response);
    
    // Verificar si la respuesta es exitosa y extraer los datos
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener facultades con carreras:', error);
    return [];
  }
};

export const createFacultad = async (data) => {
  try {
    const res = await fetch(`${API_URL}/facultades`, {
      method: "POST",
      headers: getAuthHeaders(),
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

export const deleteFacultad = async (id) => {
  try {
    const res = await fetch(`${API_URL}/facultades/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.status === 200 || res.status === 204) {
      return true;
    } else if (res.status === 404) {
      throw new Error('Facultad no encontrada');
    } else {
      try {
        const response = await res.json();
        console.error('Error al eliminar facultad:', response.error || response.message || 'Error desconocido');
        throw new Error(response.error || response.message || 'Error al eliminar facultad');
      } catch (jsonError) {
        console.error('Error al eliminar facultad:', res.statusText);
        throw new Error(`Error al eliminar facultad: ${res.status} ${res.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error al eliminar facultad:', error);
    throw error;
  }
};
// Editar facultad
export const updateFacultad = async (id, facultadData) => {
  try {
    const response = await fetch(`${API_URL}/facultades/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(facultadData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Facultad no encontrada');
      }
      if (response.status === 422) {
        const errors = data.errors || {};
        const errorMessages = Object.values(errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error(`Error al actualizar facultad ${id}:`, error);
    throw error;
  }
};

// Obtener una facultad por id
export const getFacultadById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/facultades/${id}`);
    const response = await res.json();
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Facultad no encontrada');
      }
      throw new Error(response.error || `HTTP error! status: ${res.status}`);
    }
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al obtener la facultad');
    }
  } catch (error) {
    console.error('Error al obtener facultad por ID:', error);
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

export const getCarreraById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/carreras/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.exito && result.datos) {
      return result.datos;
    } else {
      throw new Error(result.error || 'Error al obtener la carrera');
    }
  } catch (error) {
    console.error('Error en getCarreraById:', error);
    throw error;
  }
};

export const createCarrera = async (data) => {
  try {
    const res = await fetch(`${API_URL}/carreras`, {
      method: "POST",
      headers: getAuthHeaders(),
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

export const updateCarrera = async (id, data) => {
  try {
    const dataToSend = {
      facultad_id: data.id_facultad,
      codigo_carrera: data.codigo_carrera,
      nombre_carrera: data.nombre_carrera,
      pagina_carrera: data.pagina_carrera,
    };

    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === undefined || dataToSend[key] === null) {
        delete dataToSend[key];
      }
    });

    const response = await fetch(`${API_URL}/carreras/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 422 && result.errors) {
        const validationErrors = Object.values(result.errors).flat();
        throw new Error(validationErrors.join(', '));
      }
      throw new Error(result.error || `Error ${response.status}: ${response.statusText}`);
    }

    if (result.exito && result.datos) {
      return result.datos;
    } else {
      throw new Error(result.error || 'Error al actualizar la carrera');
    }
  } catch (error) {
    console.error('Error en updateCarrera:', error);
    throw error;
  }
};


// Función para eliminar una carrera
export const deleteCarrera = async (carreraId) => {
  try {
    const response = await fetch(`${API_URL}/carreras/${carreraId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      let errorMessage = 'Error al eliminar la carrera';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Intentar parsear la respuesta JSON
    const data = await response.json();
    if (data.exito !== true) {
      throw new Error(data.error || 'Error al eliminar la carrera');
    }

    return data;
  } catch (error) {
    console.error('Error en deleteCarrera:', error);
    throw error; 
  }
};

// Obtener carreras por facultad
export const getCarrerasByFacultad = async (facultadId) => {
  try {
    const response = await fetch(`${API_URL}/facultades/${facultadId}/carreras`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.exito && result.estado === 200) {
      return result.datos;
    } else {
      throw new Error(result.error || 'Error al obtener las carreras');
    }
  } catch (error) {
    console.error('Error en getCarrerasByFacultad:', error);
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

export const getModalidadById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/modalidades/${id}`);
    const response = await res.json();
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Modalidad no encontrada');
      }
      throw new Error(response.error || `HTTP error! status: ${res.status}`);
    }
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al obtener la modalidad');
    }
  } catch (error) {
    console.error('Error al obtener modalidad por ID:', error);
    throw error;
  }
};

export const createModalidad = async (data) => {
  try {
    const res = await fetch(`${API_URL}/modalidades`, {
      method: "POST",
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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

export const showCarrera = async (id) => {
  try {
    const res = await fetch(`${API_URL}/carreras/${id}`);
    const response = await res.json();

    if (!res.ok || !response.exito) {
      throw new Error(response?.error || 'Error al mostrar la carrera');
    }

    return response.datos;
  } catch (err) {
    console.error(`showCarrera(${id}) error:`, err);
    throw err;
  }
};
