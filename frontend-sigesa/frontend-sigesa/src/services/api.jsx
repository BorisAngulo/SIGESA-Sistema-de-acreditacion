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

export const getCarreraModalidades = async () => {
  try {
    console.log('🔍 Obteniendo carrera-modalidades...');
    
   
    const possibleEndpoints = [
      `${API_URL}/carrera-modalidad`,
      `${API_URL}/carrera-modalidades`, 
      `${API_URL}/acreditacion-carreras` 
    ];
    
    let response = null;
    let workingEndpoint = null;
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🌐 Probando endpoint: ${endpoint}`);
        const res = await fetch(endpoint);
        
        if (res.ok) {
          const data = await res.json();
          console.log(`✅ Endpoint funcionando: ${endpoint}`, data);
          
          if (data.exito && data.datos) {
            return data.datos;
          } else if (Array.isArray(data)) {
            return data;
          } else if (data.data && Array.isArray(data.data)) {
            return data.data;
          }
        } else {
          console.log(`❌ Endpoint falló: ${endpoint} - Status: ${res.status}`);
        }
      } catch (endpointError) {
        console.log(`💥 Error en endpoint ${endpoint}:`, endpointError);
      }
    }
    
    console.warn('⚠️ Ningún endpoint de carrera-modalidades funciona');
    return [];
    
  } catch (error) {
    console.error('💥 Error general al obtener carrera modalidades:', error);
    return [];
  }
};

export const getCarreraModalidadEspecifica = async (carreraId, modalidadId) => {
  try {
    console.log(`🔍 Buscando carrera_modalidad específica: carrera_id=${carreraId}, modalidad_id=${modalidadId}`);
    
    const endpoints = [
      `${API_URL}/carrera-modalidad?carrera_id=${carreraId}&modalidad_id=${modalidadId}`,
      `${API_URL}/acreditacion-carreras?carrera_id=${carreraId}&modalidad_id=${modalidadId}`,
      `${API_URL}/carrera-modalidades?carrera_id=${carreraId}&modalidad_id=${modalidadId}`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          console.log(`✅ Respuesta de ${endpoint}:`, data);
          
          let items = [];
          if (data.exito && data.datos) {
            items = Array.isArray(data.datos) ? data.datos : [data.datos];
          } else if (Array.isArray(data)) {
            items = data;
          }
          
          const found = items.find(item => 
            parseInt(item.carrera_id) === parseInt(carreraId) && 
            parseInt(item.modalidad_id) === parseInt(modalidadId)
          );
          
          if (found) {
            console.log('✅ Carrera-modalidad encontrada:', found);
            return found;
          }
        }
      } catch (err) {
        console.log(`❌ Error en ${endpoint}:`, err);
      }
    }
    
    console.log('❌ No se encontró la carrera-modalidad específica');
    return null;
    
  } catch (error) {
    console.error('💥 Error al obtener carrera-modalidad específica:', error);
    return null;
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
export const createFase = async (faseData) => {
  try {
    const dataToSend = {
      carrera_modalidad_id: parseInt(faseData.carreraModalidadId),
      nombre_fase: faseData.nombre,
      descripcion_fase: faseData.descripcion,
      fecha_inicio_fase: faseData.fechaInicio,
      fecha_fin_fase: faseData.fechaFin,
      id_usuario_updated_fase: 1
    };

    console.log('Enviando datos de fase:', dataToSend);

    const res = await fetch(`${API_URL}/fases`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend),
    });
    
    const responseText = await res.text();
    console.log('Respuesta completa del servidor:', responseText);
    
    let response;
    try {
      response = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error al parsear respuesta JSON:', parseError);
      throw new Error('Respuesta del servidor no válida');
    }

    if (!res.ok) {
      console.error('Error HTTP:', res.status, res.statusText);
      console.error('Detalles del error:', response);
      
      if (res.status === 422 && response.errors) {
        const validationErrors = Object.entries(response.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        throw new Error(`Errores de validación:\n${validationErrors}`);
      }
      
      throw new Error(response.error || response.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
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


export const getFasesByCarreraModalidad = async (carreraModalidadId) => {
  try {
    console.log('🔍 Obteniendo fases para carrera_modalidad_id:', carreraModalidadId);
    
    if (!carreraModalidadId) {
      console.error('❌ carreraModalidadId es requerido');
      return [];
    }
    
    console.log('📡 Método 1: Usando query parameter...');
    try {
      const urlWithFilter = `${API_URL}/fases?carrera_modalidad_id=${carreraModalidadId}`;
      console.log('🌐 URL:', urlWithFilter);
      
      const res = await fetch(urlWithFilter);
      console.log('📊 Status:', res.status, res.statusText);
      
      if (res.ok) {
        const response = await res.json();
        console.log('✅ Respuesta del servidor:', response);
        
        let fases = [];
        if (response.exito && response.datos) {
          fases = response.datos;
        } else if (Array.isArray(response)) {
          fases = response;
        } else {
          console.log('⚠️ Método 1 - Estructura de respuesta inesperada');
        }
        
        if (fases.length > 0) {
          const fasesValidas = fases.filter(fase => {
            const faseCarreraModalidadId = parseInt(fase.carrera_modalidad_id);
            const targetId = parseInt(carreraModalidadId);
            
            const esValida = faseCarreraModalidadId === targetId;
            
            if (!esValida) {
              console.warn(`⚠️ FILTRO BACKEND FALLIDO: Fase ${fase.id} tiene carrera_modalidad_id ${faseCarreraModalidadId}, se esperaba ${targetId}`);
            }
            
            return esValida;
          });
          
          if (fasesValidas.length !== fases.length) {
            console.error('❌ EL BACKEND NO ESTÁ FILTRANDO CORRECTAMENTE. Se filtró en frontend.');
            console.log(`📊 Fases recibidas: ${fases.length}, Fases válidas: ${fasesValidas.length}`);
          }
          
          console.log('✅ Método 1 exitoso - Fases validadas:', fasesValidas.length);
          return fasesValidas;
        }
        
        console.log('✅ Método 1 exitoso - Sin fases:', fases.length);
        return fases;
      } else {
        console.log('❌ Método 1 falló - Status:', res.status);
      }
    } catch (error) {
      console.log('❌ Método 1 error:', error);
    }
    
    console.log('📡 Método 2: Filtrando en frontend con validación...');
    try {
      const res = await fetch(`${API_URL}/fases`);
      console.log('📊 Status método 2:', res.status, res.statusText);
      
      if (res.ok) {
        const response = await res.json();
        
        let todasLasFases = [];
        if (response.exito && response.datos) {
          todasLasFases = response.datos;
        } else if (Array.isArray(response)) {
          todasLasFases = response;
        } else {
          console.error('❌ Estructura de respuesta no reconocida:', response);
          return [];
        }
        
        console.log('📋 Total fases en BD:', todasLasFases.length);
        
        const targetId = parseInt(carreraModalidadId);
        
        const fasesFiltradas = todasLasFases.filter(fase => {
          const faseCarreraModalidadId = parseInt(fase.carrera_modalidad_id);
          const coincide = faseCarreraModalidadId === targetId;
        
          if (coincide) {
            console.log(`✅ Fase ${fase.id} COINCIDE: carrera_modalidad_id ${faseCarreraModalidadId} === ${targetId}`);
          }
          
          return coincide;
        });
        
        console.log('📊 RESUMEN DEL FILTRADO:');
        console.log(`  - Total fases en BD: ${todasLasFases.length}`);
        console.log(`  - Fases para carrera_modalidad_id ${carreraModalidadId}: ${fasesFiltradas.length}`);
        
        if (fasesFiltradas.length > 0) {
          console.log('📋 Fases encontradas:');
          fasesFiltradas.forEach(fase => {
            console.log(`  - Fase ${fase.id}: "${fase.nombre_fase}" (carrera_modalidad_id: ${fase.carrera_modalidad_id})`);
          });
        }
        
        const distribucion = todasLasFases.reduce((acc, fase) => {
          const id = fase.carrera_modalidad_id;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});
        
        console.log('📊 Distribución de fases por carrera_modalidad_id:', distribucion);
        
        return fasesFiltradas;
      } else {
        console.error('❌ Método 2 falló - Status:', res.status);
      }
    } catch (error) {
      console.error('❌ Método 2 error:', error);
    }
    
    console.log('📡 Método 3: Endpoint alternativo...');
    try {
      const alternativeUrl = `${API_URL}/carrera-modalidad/${carreraModalidadId}/fases`;
      console.log('🌐 URL alternativa:', alternativeUrl);
      
      const res = await fetch(alternativeUrl);
      console.log('📊 Status método 3:', res.status, res.statusText);
      
      if (res.ok) {
        const response = await res.json();
        console.log('✅ Método 3 respuesta:', response);
        
        let fases = [];
        if (response.exito && response.datos) {
          fases = response.datos;
        } else if (Array.isArray(response)) {
          fases = response;
        }
        
        if (fases.length > 0) {
          const fasesValidas = fases.filter(fase => {
            const faseCarreraModalidadId = parseInt(fase.carrera_modalidad_id);
            const targetId = parseInt(carreraModalidadId);
            return faseCarreraModalidadId === targetId;
          });
          
          if (fasesValidas.length !== fases.length) {
            console.warn('⚠️ Método 3: También requirió filtrado adicional');
          }
          
          console.log('✅ Método 3 exitoso - Fases validadas:', fasesValidas.length);
          return fasesValidas;
        }
        
        return fases;
      } else {
        console.log('❌ Método 3 falló - Status:', res.status);
      }
    } catch (error) {
      console.log('❌ Método 3 error:', error);
    }
    
    console.warn('⚠️ Ningún método funcionó para obtener fases específicas');
    console.log('💡 RECOMENDACIONES PARA EL BACKEND:');
    console.log('   1. Verificar que el endpoint /fases?carrera_modalidad_id={id} funcione correctamente');
    console.log('   2. Asegurar que el filtro SQL esté aplicando WHERE carrera_modalidad_id = ?');
    console.log('   3. Revisar que no haya problemas de conversión de tipos (string vs int)');
    console.log(`   4. Endpoint específico: ${API_URL}/carrera-modalidad/${carreraModalidadId}/fases`);
    
    return [];
    
  } catch (error) {
    console.error('💥 Error general al obtener fases por carrera modalidad:', error);
    return [];
  }
};

export const updateFase = async (faseId, faseData) => {
  try {
    const dataToSend = {
      carrera_modalidad_id: parseInt(faseData.carreraModalidadId),
      nombre_fase: faseData.nombre,
      descripcion_fase: faseData.descripcion,
      fecha_inicio_fase: faseData.fechaInicio,
      fecha_fin_fase: faseData.fechaFin,
      id_usuario_updated_fase: 1
    };

    console.log('Actualizando fase:', faseId, dataToSend);

    const res = await fetch(`${API_URL}/fases/${faseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend),
    });
    
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al actualizar fase:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al actualizar fase');
    }
  } catch (error) {
    console.error('Error al actualizar fase:', error);
    throw error;
  }
};

// Eliminar fase
export const deleteFase = async (faseId) => {
  try {
    const res = await fetch(`${API_URL}/fases/${faseId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    if (res.status === 200 || res.status === 204) {
      return true;
    } else if (res.status === 404) {
      throw new Error('Fase no encontrada');
    } else {
      try {
        const response = await res.json();
        console.error('Error al eliminar fase:', response.error || response.message || 'Error desconocido');
        throw new Error(response.error || response.message || 'Error al eliminar fase');
      } catch (jsonError) {
        console.error('Error al eliminar fase:', res.statusText);
        throw new Error(`Error al eliminar fase: ${res.status} ${res.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error al eliminar fase:', error);
    throw error;
  }
};