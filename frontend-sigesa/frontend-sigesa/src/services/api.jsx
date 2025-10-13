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
  },

  permissions: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/permissions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
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

export const getCarreraModalidadActiva = async (carreraId, modalidadId) => {
  try {
    console.log(`🔍 Buscando carrera-modalidad activa: carrera_id=${carreraId}, modalidad_id=${modalidadId}`);
    
    const res = await fetch(`${API_URL}/carrera-modalidad/buscar-activa/${carreraId}/${modalidadId}`);
    const data = await res.json();
    
    console.log(`📊 Respuesta de buscar-activa:`, data);
    
    if (data.exito && data.datos) {
      console.log('✅ Carrera-modalidad activa encontrada:', data.datos);
      return data.datos;
    } else {
      console.log('ℹ️ No se encontró carrera-modalidad activa para las fechas actuales');
      return null;
    }
    
  } catch (error) {
    console.error('💥 Error al buscar carrera-modalidad activa:', error);
    return null;
  }
};

// Nueva función para obtener carrera-modalidad por ID específico
export const getCarreraModalidadPorId = async (carreraModalidadId) => {
  try {
    console.log(`🔍 Buscando carrera-modalidad por ID específico: ${carreraModalidadId}`);
    
    // Usar el endpoint específico para obtener una acreditación por ID
    const res = await fetch(`${API_URL}/acreditacion-carreras/${carreraModalidadId}`, {
      headers: getAuthHeaders(),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Respuesta de acreditacion-carreras/${carreraModalidadId}:`, data);
      
      let carreraModalidad = null;
      if (data.exito && data.datos) {
        carreraModalidad = data.datos;
      } else if (data.data) {
        carreraModalidad = data.data;
      } else if (data.id) {
        carreraModalidad = data;
      }
      
      if (carreraModalidad && parseInt(carreraModalidad.id) === parseInt(carreraModalidadId)) {
        console.log('✅ Carrera-modalidad específica encontrada:', carreraModalidad);
        return carreraModalidad;
      }
    }
    
    console.log('❌ No se encontró carrera-modalidad con ID:', carreraModalidadId);
    return null;
    
  } catch (error) {
    console.error('💥 Error al obtener carrera-modalidad por ID:', error);
    return null;
  }
};

// Función consolidada para obtener proceso completo: carrera-modalidad, fases y subfases en una sola llamada
export const getProcesoCompleto = async (carreraModalidadId) => {
  try {
    console.log(`🚀 OBTENIENDO PROCESO COMPLETO para carrera-modalidad: ${carreraModalidadId}`);
    
    const res = await fetch(`${API_URL}/acreditacion-carreras/${carreraModalidadId}/proceso-completo`, {
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log(`✅ Proceso completo obtenido exitosamente:`, data);
    
    // Verificar estructura de respuesta del backend SIGESA
    if (data.exito && data.datos) {
      const procesoCompleto = data.datos;
      
      console.log(`📊 Estadísticas del proceso completo:`, {
        carrera_modalidad_id: procesoCompleto.carrera_modalidad.id,
        total_fases: procesoCompleto.total_fases,
        total_subfases: procesoCompleto.total_subfases,
        carrera_nombre: procesoCompleto.carrera_modalidad.carrera.nombre_carrera,
        modalidad_nombre: procesoCompleto.carrera_modalidad.modalidad.nombre_modalidad
      });
      
      return procesoCompleto;
    } else if (data.data) {
      console.log('✅ Usando estructura data alternativa');
      return data.data;
    } else {
      console.warn('⚠️ Estructura de respuesta inesperada:', data);
      return data;
    }
    
  } catch (error) {
    console.error('💥 Error al obtener proceso completo:', error);
    throw error;
  }
};

// Función consolidada para obtener o crear proceso activo con validaciones inteligentes
// Incluye soporte para procesos futuros y lógica completa de gestión de procesos
export const obtenerOCrearProcesoActivo = async (carreraId, modalidadId, fechaInicioProceso = null, fechaFinProceso = null) => {
  try {
    console.log('🚀 INICIANDO OBTENER O CREAR PROCESO ACTIVO:', {
      carrera_id: carreraId,
      modalidad_id: modalidadId,
      fecha_ini_proceso: fechaInicioProceso,
      fecha_fin_proceso: fechaFinProceso
    });

    const requestBody = {
      carrera_id: carreraId,
      modalidad_id: modalidadId
    };

    // Solo incluir fechas si están definidas
    if (fechaInicioProceso) {
      requestBody.fecha_ini_proceso = fechaInicioProceso;
    }
    
    if (fechaFinProceso) {
      requestBody.fecha_fin_proceso = fechaFinProceso;
    }

    const res = await fetch(`${API_URL}/acreditacion-carreras/obtener-crear-proceso-activo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      
      if (res.status === 409) {
        // Conflicto de fechas
        throw new Error(errorData?.error || 'Ya existe un proceso con fechas que se superponen');
      }
      
      if (res.status === 422) {
        // Errores de validación
        const validationErrors = errorData?.error || 'Datos de entrada inválidos';
        throw new Error(`Errores de validación: ${validationErrors}`);
      }
      
      throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('✅ Respuesta del endpoint consolidado:', data);

    // Verificar estructura de respuesta del backend SIGESA
    if (data.exito && data.datos) {
      const resultado = data.datos;
      
      console.log(`🎯 Resultado de la operación:`, {
        accion: resultado.accion,
        tipo: resultado.tipo,
        mensaje: resultado.mensaje,
        carrera_modalidad_id: resultado.carrera_modalidad.id,
        fecha_ini_proceso: resultado.carrera_modalidad.fecha_ini_proceso,
        fecha_fin_proceso: resultado.carrera_modalidad.fecha_fin_proceso
      });
      
      return {
        carrera_modalidad: resultado.carrera_modalidad,
        accion: resultado.accion,
        tipo: resultado.tipo,
        mensaje: resultado.mensaje,
        // Información adicional para el frontend
        es_proceso_nuevo: resultado.accion.includes('creado'),
        es_proceso_futuro: resultado.tipo === 'proceso_futuro'
      };
    } else {
      console.warn('⚠️ Estructura de respuesta inesperada:', data);
      return data;
    }

  } catch (error) {
    console.error('💥 Error en obtenerOCrearProcesoActivo:', error);
    throw error;
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

// Función para finalizar acreditación (actualizar carrera-modalidad con fechas de aprobación y certificado)
export const finalizarAcreditacion = async (carreraModalidadId, formData) => {
  try {
    console.log(`🔄 Finalizando acreditación para carrera-modalidad ID: ${carreraModalidadId}`);
    
    const token = getAuthToken();
    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` })
      // No incluir Content-Type para FormData, el navegador lo establecerá automáticamente
    };
    
    const res = await fetch(`${API_URL}/acreditacion-carreras/${carreraModalidadId}`, {
      method: "POST", // Cambiado a POST para manejar FormData con _method
      headers: headers,
      body: formData,
    });
    
    const response = await res.json();
    
    if (res.ok && (response.exito || response.success)) {
      console.log('✅ Acreditación finalizada exitosamente:', response);
      return response.datos || response.data;
    } else {
      console.error('❌ Error al finalizar acreditación:', response);
      throw new Error(response.mensaje || response.message || response.error || 'Error al finalizar acreditación');
    }
  } catch (error) {
    console.error('💥 Error al finalizar acreditación:', error);
    throw error;
  }
};

// Función para actualizar las fechas del proceso de acreditación
export const updateCarreraModalidadFechas = async (carreraModalidadId, fechas) => {
  try {
    console.log(`🔄 Actualizando fechas del proceso para carrera-modalidad ID: ${carreraModalidadId}`);
    console.log('📅 Fechas a actualizar:', fechas);
    
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    // Preparar los datos
    const datos = {
      fecha_ini_proceso: fechas.fecha_ini_proceso || fechas.fechaInicio,
      fecha_fin_proceso: fechas.fecha_fin_proceso || fechas.fechaFin
    };
    
    console.log('📝 Datos preparados para enviar:', datos);
    
    const res = await fetch(`${API_URL}/acreditacion-carreras/${carreraModalidadId}/fechas-proceso`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(datos),
    });
    
    const response = await res.json();
    
    if (res.ok && (response.exito || response.success)) {
      console.log('✅ Fechas del proceso actualizadas exitosamente:', response);
      return response.datos || response.data;
    } else {
      console.error('❌ Error al actualizar fechas del proceso:', response);
      throw new Error(response.mensaje || response.message || response.error || 'Error al actualizar las fechas del proceso');
    }
  } catch (error) {
    console.error('💥 Error al actualizar fechas del proceso:', error);
    throw error;
  }
};

// Función para eliminar una carrera-modalidad
export const eliminarCarreraModalidad = async (carreraModalidadId) => {
  try {
    console.log(`🗑️ Eliminando carrera-modalidad ID: ${carreraModalidadId}`);
    
    const res = await fetch(`${API_URL}/acreditacion-carreras/${carreraModalidadId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    const response = await res.json();
    
    if (res.ok && (response.exito || response.success)) {
      console.log('✅ Carrera-modalidad eliminada exitosamente:', response);
      return response;
    } else {
      console.error('❌ Error al eliminar carrera-modalidad:', response);
      throw new Error(response.mensaje || response.message || response.error || 'Error al eliminar carrera-modalidad');
    }
  } catch (error) {
    console.error('💥 Error al eliminar carrera-modalidad:', error);
    throw error;
  }
};

// Obtener todas las carreras-modalidades con detalles completos
export const getCarrerasModalidadesDetallesCompletos = async () => {
  try {
    console.log('🔍 Obteniendo carreras-modalidades con detalles completos...');
    
    const res = await fetch(`${API_URL}/carrera-modalidad/detalles-completos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const response = await res.json();
    
    if (response.exito && response.datos) {
      console.log('✅ Carreras-modalidades con detalles obtenidas:', response.datos.length);
      return response.datos;
    } else {
      console.error('Error en la respuesta:', response.error || 'Error desconocido');
      return [];
    }
  } catch (error) {
    console.error('💥 Error al obtener carreras-modalidades con detalles:', error);
    return [];
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
      id_usuario_updated_user: 1
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
    const res = await fetch(`${API_URL}/subfases`, {
      headers: getAuthHeaders()
    });
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

export const getSubfasesByFase = async (faseId) => {
  try {
    console.log('Obteniendo subfases para fase_id:', faseId);
    
    if (!faseId) {
      console.error('faseId es requerido');
      return [];
    }
    
    console.log('Método 1: Usando endpoint específico /fases/{fase}/subfases...');
    try {
      const urlEspecifico = `${API_URL}/fases/${faseId}/subfases`;
      console.log('URL:', urlEspecifico);
      
      const res = await fetch(urlEspecifico, {
        headers: getAuthHeaders()
      });
      console.log('Status:', res.status, res.statusText);
      
      if (res.ok) {
        const response = await res.json();
        
        let subfases = [];
        if (response.exito && response.datos) {
          subfases = response.datos;
        } else if (Array.isArray(response)) {
          subfases = response;
        } else {
          console.log('Método 1 - Estructura de respuesta inesperada');
        }
        
        if (subfases.length > 0) {
          
          const subfasesValidas = subfases.filter(subfase => {
            const subfaseFaseId = parseInt(subfase.fase_id);
            const targetId = parseInt(faseId);
            
            const esValida = subfaseFaseId === targetId;
            
            if (!esValida) {
              console.warn(`FILTRO BACKEND FALLIDoO: Subfase ${subfase.id} tiene fase_id ${subfaseFaseId}, se esperaba ${targetId}`);
            }
            
            return esValida;
          });
          
          if (subfasesValidas.length !== subfases.length) {
            console.error('EL BACKEND NO ESTÁ FILTRANDO CORRECTAMENTE. Se filtró en frontend.');
            console.log(`Subfases recibidas: ${subfases.length}, Subfases válidas: ${subfasesValidas.length}`);
          }
        
          return subfasesValidas;
        }
        return subfases;
      } else {
        console.log('Método 1 falló - Status:', res.status);
      }
    } catch (error) {
      console.log('Método 1 error:', error);
    }
    
    console.log('Método 2: Usando query parameter /subfases?fase_id=...');
    try {
      const urlConFiltro = `${API_URL}/subfases?fase_id=${faseId}`;
      console.log('URL:', urlConFiltro);
      
      const res = await fetch(urlConFiltro, {
        headers: getAuthHeaders()
      });
      console.log('Status método 2:', res.status, res.statusText);
      
      if (res.ok) {
        const response = await res.json();
        console.log('Respuesta método 2:', response);
        
        let subfases = [];
        if (response.exito && response.datos) {
          subfases = response.datos;
        } else if (Array.isArray(response)) {
          subfases = response;
        } else {
          console.log('método 2 - Estructura de respuesta inesperada');
        }
        
        if (subfases.length > 0) {
          const subfasesValidas = subfases.filter(subfase => {
            const subfaseFaseId = parseInt(subfase.fase_id);
            const targetId = parseInt(faseId);
            return subfaseFaseId === targetId;
          });
          
          console.log('Método 2 exitoso - Subfases validadas:', subfasesValidas.length);
          return subfasesValidas;
        }
        
        console.log('Método 2 exitoso - Sin subfases:', subfases.length);
        return subfases;
      } else {
        console.log('Método 2 falló - Status:', res.status);
      }
    } catch (error) {
      console.log('Método 2 error:', error);
    }
    
    console.log('Método 3: Filtrando en frontend con validación...');
    try {
      const res = await fetch(`${API_URL}/subfases`, {
        headers: getAuthHeaders()
      });
      console.log('Status método 3:', res.status, res.statusText);
      
      if (res.ok) {
        const response = await res.json();
        
        let todasLasSubfases = [];
        if (response.exito && response.datos) {
          todasLasSubfases = response.datos;
        } else if (Array.isArray(response)) {
          todasLasSubfases = response;
        } else {
          console.error('Estructura de respuesta no reconocida:', response);
          return [];
        }
        
        console.log('Total de subfases obtenidas:', todasLasSubfases.length);
        
  
        const subfasesFiltradas = todasLasSubfases.filter(subfase => {
          const subfaseFaseId = parseInt(subfase.fase_id);
          const targetId = parseInt(faseId);
          const esValida = subfaseFaseId === targetId;
          
          if (esValida) {
            console.log(`Subfase válida: ${subfase.id} (${subfase.nombre_subfase}) - fase_id: ${subfaseFaseId}`);
          }
          
          return esValida;
        });
        
        console.log(`Subfases filtradas para fase ${faseId}:`, subfasesFiltradas.length);
        
        if (subfasesFiltradas.length > 0) {
          console.log('Subfases encontradas:', subfasesFiltradas.map(s => ({
            id: s.id,
            nombre: s.nombre_subfase,
            fase_id: s.fase_id
          })));
        } else {
          console.log(`No se encontraron subfases para la fase ${faseId}`);
        }
        
        return subfasesFiltradas;
      } else {
        console.error('Error en método 3:', res.status, res.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error en método 3:', error);
      return [];
    }
    
  } catch (error) {
    console.error('Error general al obtener subfases:', error);
    return [];
  }
};

// Función auxiliar para obtener todas las subfases para debuggear
export const getAllSubfases = async () => {
  try {
    console.log('Obteniendo todas las subfases...');
    
    const res = await fetch(`${API_URL}/subfases`, {
      headers: getAuthHeaders()
    });
    console.log('Status:', res.status, res.statusText);
    
    if (res.ok) {
      const response = await res.json();
      console.log('Respuesta completa:', response);
      
      let subfases = [];
      if (response.exito && response.datos) {
        subfases = response.datos;
      } else if (Array.isArray(response)) {
        subfases = response;
      }
      
      console.log('Total subfases:', subfases.length);
      return subfases;
    } else {
      console.error('Error al obtener subfases:', res.status);
      return [];
    }
  } catch (error) {
    console.error('error general:', error);
    return [];
  }
};

export const createSubfase = async (subfaseData) => {
  try {
    console.log('🔍 Creando nueva subfase:', subfaseData);
    
    const res = await fetch(`${API_URL}/subfases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subfaseData)
    });
    
    console.log('Status:', res.status, res.statusText);
    
    const response = await res.json();
    
    if (res.ok) {
      console.log('Subfase creada exitosamente:', response);
      return { success: true, data: response.datos || response };
    } else {
      console.error('Error al crear subfase:', response);
      return { success: false, error: response.error || 'Error al crear subfase' };
    }
  } catch (error) {
    console.error('Error general al crear subfase:', error);
    return { success: false, error: 'Error de conexión' };
  }
};

export const updateSubfase = async (subfaseId, subfaseData) => {
  try {
    console.log('Actualizando subfase:', subfaseId, subfaseData);
    
    const res = await fetch(`${API_URL}/subfases/${subfaseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(subfaseData)
    });
    
    console.log('Status:', res.status, res.statusText);
    
    const response = await res.json();
    
    if (res.ok) {
      console.log('Subfase actualizada exitosamente:', response);
      return { success: true, data: response.datos || response };
    } else {
      console.error('Error al actualizar subfase:', response);
      return { success: false, error: response.error || 'Error al actualizar subfase' };
    }
  } catch (error) {
    console.error('Error general al actualizar subfase:', error);
    return { success: false, error: 'Error de conexión' };
  }
};

export const deleteSubfase = async (subfaseId) => {
  try {
    console.log('Eliminando subfase:', subfaseId);
    
    const res = await fetch(`${API_URL}/subfases/${subfaseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    console.log('Status:', res.status, res.statusText);
    
    if (res.ok) {
      console.log('Subfase eliminada exitosamente');
      return { success: true };
    } else {
      const response = await res.json();
      console.error('Error al eliminar subfase:', response);
      return { success: false, error: response.error || 'Error al eliminar subfase' };
    }
  } catch (error) {
    console.error('Error general al eliminar subfase:', error);
    return { success: false, error: 'Error de conexión' };
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

// Obtener historial de acreditaciones de una carrera por modalidad específica
export const getHistorialAcreditacionesPorModalidad = async (carreraId, modalidadId) => {
  try {
    console.log(`🎯 Obteniendo historial de acreditaciones - Carrera: ${carreraId}, Modalidad: ${modalidadId}`);
    
    const res = await fetch(`${API_URL}/carreras/${carreraId}/historial-acreditaciones/${modalidadId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    }
    
    const response = await res.json();
    
    if (response.exito && response.datos) {
      console.log(`✅ Historial obtenido exitosamente:`, response.datos);
      return response.datos;
    } else {
      throw new Error(response?.error || 'Error al obtener historial de acreditaciones');
    }
  } catch (err) {
    console.error(`❌ Error en getHistorialAcreditacionesPorModalidad(${carreraId}, ${modalidadId}):`, err);
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
      console.error('carreraModalidadId es requerido');
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
      id_usuario_updated_user: 1
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

// Actualizar solo la observación de una fase
export const updateObservacionFase = async (faseId, observacion) => {
  try {
    console.log('Actualizando observación de fase:', faseId, observacion);

    const res = await fetch(`${API_URL}/fases/${faseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        observacion_fase: observacion
      }),
    });
    
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al actualizar observación de fase:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al actualizar observación de fase');
    }
  } catch (error) {
    console.error('Error al actualizar observación de fase:', error);
    throw error;
  }
};

// Actualizar solo la observación de una subfase
export const updateObservacionSubfase = async (subfaseId, observacion) => {
  try {
    console.log('Actualizando observación de subfase:', subfaseId, observacion);

    const res = await fetch(`${API_URL}/subfases/${subfaseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        observacion_subfase: observacion
      }),
    });
    
    const response = await res.json();
    
    if (response.exito || res.ok) {
      return response.datos || response;
    } else {
      console.error('Error al actualizar observación de subfase:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al actualizar observación de subfase');
    }
  } catch (error) {
    console.error('Error al actualizar observación de subfase:', error);
    throw error;
  }
};

// Actualizar solo la URL de respuesta de una fase
export const updateUrlFaseRespuesta = async (faseId, urlRespuesta) => {
  try {
    console.log('Actualizando URL de respuesta de fase:', faseId, urlRespuesta);

    const res = await fetch(`${API_URL}/fases/${faseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        url_fase_respuesta: urlRespuesta
      }),
    });
    
    const response = await res.json();
    
    if (response.exito && response.datos) {
      return response.datos;
    } else {
      console.error('Error al actualizar URL de respuesta de fase:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al actualizar URL de respuesta de fase');
    }
  } catch (error) {
    console.error('Error al actualizar URL de respuesta de fase:', error);
    throw error;
  }
};

// Actualizar solo la URL de respuesta de una subfase
export const updateUrlSubfaseRespuesta = async (subfaseId, urlRespuesta) => {
  try {
    console.log('Actualizando URL de respuesta de subfase:', subfaseId, urlRespuesta);

    const res = await fetch(`${API_URL}/subfases/${subfaseId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        url_subfase_respuesta: urlRespuesta
      }),
    });
    
    const response = await res.json();
    
    if (response.exito || res.ok) {
      return response.datos || response;
    } else {
      console.error('Error al actualizar URL de respuesta de subfase:', response.error || 'Error desconocido');
      throw new Error(response.error || 'Error al actualizar URL de respuesta de subfase');
    }
  } catch (error) {
    console.error('Error al actualizar URL de respuesta de subfase:', error);
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

// ===== FUNCIONES DE DOCUMENTOS =====

// Obtener todos los documentos
export const getDocumentos = async () => {
  try {
    console.log('Llamando a getDocumentos...');
    
    const res = await fetch(`${API_URL}/documentos`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Datos recibidos de getDocumentos:', data);
    console.log('Estructura de datos:', {
      exito: data.exito,
      estado: data.estado,
      mensaje: data.mensaje,
      datos: data.datos,
      error: data.error
    });
    
    if (data.datos && Array.isArray(data.datos)) {
      console.log('Número de documentos:', data.datos.length);
      console.log('Documentos:', data.datos.map(doc => ({
        id: doc.id,
        nombre: doc.nombre_documento,
        tipo: doc.tipo_documento
      })));
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    throw error;
  }
};

// Crear nuevo documento con archivo
export const createDocumento = async (documentoData) => {
  try {
    const formData = new FormData();
    formData.append('nombre_documento', documentoData.nombre);
    formData.append('descripcion_documento', documentoData.descripcion || '');
    
    // El tipoDocumento ya viene como código ('01' o '02') desde el frontend
    const tipoDocumento = documentoData.tipoDocumento || '02';
    formData.append('tipo_documento', tipoDocumento);
    
    if (documentoData.archivo) {
      formData.append('archivo_documento', documentoData.archivo);
    }

    const token = getAuthToken();
    const res = await fetch(`${API_URL}/documentos`, {
      method: "POST",
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // No incluir Content-Type para FormData, el navegador lo maneja automáticamente
      },
      body: formData,
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al crear documento:', error);
    throw error;
  }
};

// Crear documento global (sin asociación a fase o subfase)
export const createDocumentoGlobal = async (documentoData) => {
  try {
    const formData = new FormData();
    formData.append('nombre_documento', documentoData.nombre);
    formData.append('descripcion_documento', documentoData.descripcion || '');
    formData.append('tipo_documento', '03'); // Tipo 03 para documentos globales
    
    if (documentoData.archivo) {
      formData.append('archivo_documento', documentoData.archivo);
    }

    const token = getAuthToken();
    const res = await fetch(`${API_URL}/documentos`, {
      method: "POST",
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // No incluir Content-Type para FormData, el navegador lo maneja automáticamente
      },
      body: formData,
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al crear documento global:', error);
    throw error;
  }
};

// Asociar documento existente a una fase
export const asociarDocumentoAFase = async (faseId, documentoId) => {
  try {
    console.log('Asociando documento a fase - faseId:', faseId, 'documentoId:', documentoId);
    
    const payload = { documento_id: documentoId };
    console.log('Payload enviado:', payload);
    
    const res = await fetch(`${API_URL}/fases/${faseId}/documentos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al asociar documento a fase:', error);
    throw error;
  }
};

// Asociar documento existente a una subfase
export const asociarDocumentoASubfase = async (subfaseId, documentoId) => {
  try {
    console.log('Asociando documento a subfase - subfaseId:', subfaseId, 'documentoId:', documentoId);
    
    const payload = { documento_id: documentoId };
    console.log('Payload enviado:', payload);
    
    const res = await fetch(`${API_URL}/subfases/${subfaseId}/documentos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json();
      console.log('Error data:', errorData);
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error al asociar documento a subfase:', error);
    throw error;
  }
};

// Eliminar asociación de documento con fase
export const eliminarDocumentoDeFase = async (faseId, documentoId) => {
  try {
    console.log('🗑️ Eliminando asociación documento-fase - faseId:', faseId, 'documentoId:', documentoId);
    
    const res = await fetch(`${API_URL}/fases/${faseId}/documentos/${documentoId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    const response = await res.json();
    console.log('✅ Asociación documento-fase eliminada exitosamente');
    return response;
  } catch (error) {
    console.error('❌ Error al eliminar asociación documento-fase:', error);
    throw error;
  }
};

// Eliminar asociación de documento con subfase
export const eliminarDocumentoDeSubfase = async (subfaseId, documentoId) => {
  try {
    console.log('🗑️ Eliminando asociación documento-subfase - subfaseId:', subfaseId, 'documentoId:', documentoId);
    
    const res = await fetch(`${API_URL}/subfases/${subfaseId}/documentos/${documentoId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    }
    
    const response = await res.json();
    console.log('✅ Asociación documento-subfase eliminada exitosamente');
    return response;
  } catch (error) {
    console.error('❌ Error al eliminar asociación documento-subfase:', error);
    throw error;
  }
};

// Obtener documentos de una fase específica
export const getDocumentosByFase = async (faseId) => {
  try {
    console.log('🔍 Obteniendo documentos para fase ID:', faseId);
    
    const res = await fetch(`${API_URL}/fases/${faseId}/documentos`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    console.log('📊 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('📄 Respuesta de getDocumentosByFase:', data);
    
    // Retornar los datos según el formato de respuesta de SIGESA
    if (data && data.exito && data.datos) {
      console.log('✅ Documentos encontrados:', data.datos.length);
      return data.datos;
    } else {
      console.log('⚠️ No se encontraron documentos o formato inesperado');
      return [];
    }
  } catch (error) {
    console.error('❌ Error al obtener documentos de fase:', error);
    throw error;
  }
};

// Obtener documentos de una subfase específica
export const getDocumentosBySubfase = async (subfaseId) => {
  try {
    console.log('🔍 Obteniendo documentos para subfase ID:', subfaseId);
    
    const res = await fetch(`${API_URL}/subfases/${subfaseId}/documentos`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    console.log('📊 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('📄 Respuesta de getDocumentosBySubfase:', data);
    
    // Retornar los datos según el formato de respuesta de SIGESA
    if (data && data.exito && data.datos) {
      console.log('✅ Documentos encontrados:', data.datos.length);
      return data.datos;
    } else {
      console.log('⚠️ No se encontraron documentos o formato inesperado');
      return [];
    }
  } catch (error) {
    console.error('❌ Error al obtener documentos de subfase:', error);
    throw error;
  }
};

// Descargar documento usando window.open (método alternativo)
export const downloadDocumentoAlternativo = (documentoId) => {
  try {
    console.log('⬇️ Descargando documento ID (método alternativo):', documentoId);
    
    // Abrir en nueva ventana para forzar descarga
    const url = `${API_URL}/documentos/${documentoId}/descargar`;
    window.open(url, '_blank');
    
    console.log('✅ Descarga iniciada (ventana nueva)');
    return true;
  } catch (error) {
    console.error('❌ Error al descargar documento:', error);
    throw error;
  }
};

// Descargar documento de forma pública (sin autenticación)
export const downloadDocumento = async (documentoId) => {
  try {
    console.log('⬇️ Descargando documento ID:', documentoId);
    
    // Usar el mismo método exitoso que funciona para certificados
    const url = `${API_URL}/documentos/${documentoId}/descargar`;
    
    // Crear un enlace temporal para descargar el documento
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    a.target = '_blank'; // Abrir en nueva pestaña como fallback
    
    // No forzar nombre específico, dejar que el servidor lo maneje
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('✅ Descarga de documento iniciada');
    return true;
  } catch (error) {
    console.error('❌ Error al descargar documento, intentando método alternativo:', error);
    // Si falla, intentar con window.open
    return downloadDocumentoAlternativo(documentoId);
  }
};

// Obtener todos los documentos
export const getAllDocumentos = async () => {
  try {
    const response = await fetch(`${API_URL}/documentos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.exito) {
      return result.datos;
    } else {
      throw new Error(result.error || 'Error al obtener documentos');
    }
  } catch (error) {
    console.error('Error al obtener todos los documentos:', error);
    throw error;
  }
};

// Obtener asociaciones de un documento específico
export const getAsociacionesDocumento = async (documentoId) => {
  try {
    const response = await fetch(`${API_URL}/documentos/${documentoId}/asociaciones`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.exito) {
      return result.datos;
    } else {
      throw new Error(result.error || 'Error al obtener asociaciones del documento');
    }
  } catch (error) {
    console.error('Error al obtener asociaciones del documento:', error);
    throw error;
  }
};

// === FUNCIONES DE CERTIFICADOS DE CARRERAS-MODALIDADES ===

// Subir certificado para una carrera-modalidad
export const subirCertificadoCarreraModalidad = async (carreraModalidadId, certificadoFile) => {
  try {
    console.log('📄 Subiendo certificado para carrera-modalidad ID:', carreraModalidadId);
    
    const formData = new FormData();
    formData.append('certificado', certificadoFile);
    formData.append('_method', 'PUT'); // Laravel method spoofing para PUT request

    const response = await fetch(`${API_URL}/acreditacion-carreras/${carreraModalidadId}`, {
      method: 'POST', // Usando POST con _method=PUT debido a FormData
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        // No agregar Content-Type para FormData, el navegador lo maneja automáticamente
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.exito) {
      console.log('✅ Certificado subido exitosamente');
      return result.datos;
    } else {
      throw new Error(result.error || 'Error al subir certificado');
    }
  } catch (error) {
    console.error('❌ Error al subir certificado:', error);
    throw error;
  }
};

// Descargar certificado de una carrera-modalidad
export const descargarCertificadoCarreraModalidad = (carreraModalidadId, nombreCarrera, nombreModalidad) => {
  try {
    console.log('⬇️ Descargando certificado para carrera-modalidad ID:', carreraModalidadId);
    
    // Crear un enlace temporal para descargar el certificado
    const url = `${API_URL}/acreditacion-carreras/${carreraModalidadId}/certificado/descargar`;
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    // No especificar extensión, el backend enviará el nombre correcto con Content-Disposition
    a.download = `certificado_${nombreCarrera}_${nombreModalidad}`;
    a.target = '_blank';
    
    // Agregar token de autorización como parámetro de consulta
    const token = getAuthToken();
    if (token) {
      a.href += `?token=${token}`;
    }
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('✅ Descarga de certificado iniciada');
    return true;
  } catch (error) {
    console.error('❌ Error al descargar certificado:', error);
    throw error;
  }
};

// ===== FUNCIONES DE FODA =====

// Obtener FODA por subfase
export const getFodaBySubfase = async (subfaseId) => {
  try {
    console.log('🔍 Obteniendo FODA para subfase ID:', subfaseId);
    
    const res = await fetch(`${API_URL}/foda/subfase/${subfaseId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('📊 FODA obtenido:', data);
    
    if (data.estado) {
      return data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener FODA');
    }
  } catch (error) {
    console.error('❌ Error al obtener FODA:', error);
    throw error;
  }
};

// Crear elemento FODA
export const crearElementoFoda = async (elementoData) => {
  try {
    console.log('💾 Creando elemento FODA:', elementoData);
    
    const res = await fetch(`${API_URL}/foda/elementos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(elementoData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      console.log('✅ Elemento FODA creado exitosamente');
      return data.elemento || data;
    } else {
      throw new Error(data.mensaje || 'Error al crear elemento FODA');
    }
  } catch (error) {
    console.error('❌ Error al crear elemento FODA:', error);
    throw error;
  }
};

// Actualizar elemento FODA
export const actualizarElementoFoda = async (elementoId, elementoData) => {
  try {
    console.log('✏️ Actualizando elemento FODA:', elementoId, elementoData);
    
    const res = await fetch(`${API_URL}/foda/elementos/${elementoId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(elementoData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      console.log('✅ Elemento FODA actualizado exitosamente');
      return data.elemento || data;
    } else {
      throw new Error(data.mensaje || 'Error al actualizar elemento FODA');
    }
  } catch (error) {
    console.error('❌ Error al actualizar elemento FODA:', error);
    throw error;
  }
};

// Eliminar elemento FODA
export const eliminarElementoFoda = async (elementoId) => {
  try {
    console.log('�️ Eliminando elemento FODA ID:', elementoId);
    
    const res = await fetch(`${API_URL}/foda/elementos/${elementoId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    console.log('✅ Elemento FODA eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar elemento FODA:', error);
    throw error;
  }
};

// Crear estrategia cruzada FODA
export const crearEstrategiaCruzada = async (estrategiaData) => {
  try {
    console.log('� Creando estrategia cruzada FODA:', estrategiaData);
    
    const res = await fetch(`${API_URL}/foda/estrategias-cruzadas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(estrategiaData),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.mensaje || `Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      console.log('✅ Estrategia cruzada creada exitosamente');
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al crear estrategia cruzada');
    }
  } catch (error) {
    console.error('❌ Error al crear estrategia cruzada:', error);
    throw error;
  }
};

// Obtener estrategias cruzadas por análisis FODA
export const getEstrategiasCruzadas = async (analisisId) => {
  try {
    console.log('🔍 Obteniendo estrategias cruzadas para análisis:', analisisId);
    
    const res = await fetch(`${API_URL}/foda/analisis/${analisisId}/estrategias-cruzadas`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener estrategias cruzadas');
    }
  } catch (error) {
    console.error('❌ Error al obtener estrategias cruzadas:', error);
    throw error;
  }
};

// Obtener tipos de estrategias FODA
export const getTiposEstrategiasFoda = async () => {
  try {
    console.log('🔍 Obteniendo tipos de estrategias FODA');
    
    const res = await fetch(`${API_URL}/foda/tipos-estrategias`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener tipos de estrategias');
    }
  } catch (error) {
    console.error('❌ Error al obtener tipos de estrategias:', error);
    throw error;
  }
};

// ===== FUNCIONES DE PLAME =====

// Verificar si existe PLAME para carrera-modalidad
export const verificarPlameExiste = async (carreraModalidadId) => {
  try {
    // Verificar si hay token de autenticación
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicie sesión nuevamente.');
    }

    console.log('🔍 Verificando existencia de PLAME para carrera-modalidad ID:', carreraModalidadId);
    
    const res = await fetch(`${API_URL}/plame/verificar/${carreraModalidadId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    // Manejar respuestas específicas
    if (res.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    
    if (res.status === 403) {
      throw new Error('No tiene permisos para acceder a esta funcionalidad.');
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('✅ Verificación PLAME:', data);
    
    if (data.estado && data.datos) {
      return data.datos;
    } else {
      throw new Error(data.mensaje || data.error || 'Error al verificar PLAME');
    }
  } catch (error) {
    console.error('❌ Error al verificar PLAME:', error);
    
    // Si es error de red o fetch, proporcionar mensaje más claro
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión con el servidor. Verifique que el servidor esté ejecutándose.');
    }
    
    throw error;
  }
};

// Obtener PLAME por carrera-modalidad
export const getPlameByCarreraModalidad = async (carreraModalidadId) => {
  try {
    // Verificar si hay token de autenticación
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicie sesión nuevamente.');
    }

    console.log('🔍 Obteniendo PLAME para carrera-modalidad ID:', carreraModalidadId);
    
    const res = await fetch(`${API_URL}/plame/carrera-modalidad/${carreraModalidadId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    // Manejar respuestas específicas
    if (res.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    
    if (res.status === 403) {
      throw new Error('No tiene permisos para acceder a esta funcionalidad.');
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('📊 PLAME obtenido:', data);
    
    if (data.estado && data.datos) {
      return data.datos;
    } else {
      throw new Error(data.mensaje || data.error || 'Error al obtener PLAME');
    }
  } catch (error) {
    console.error('❌ Error al obtener PLAME:', error);
    
    // Si es error de red o fetch, proporcionar mensaje más claro
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión con el servidor. Verifique que el servidor esté ejecutándose.');
    }
    
    throw error;
  }
};

// Actualizar matriz PLAME
export const actualizarMatrizPlame = async (plameId, matrizData) => {
  try {
    console.log('💾 Actualizando matriz PLAME:', plameId, matrizData);
    
    const res = await fetch(`${API_URL}/plame/matriz`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id_plame: plameId,
        ...matrizData
      }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.exito && data.datos) {
      console.log('✅ Matriz PLAME actualizada exitosamente');
      return data.datos;
    } else {
      throw new Error(data.error || 'Error al actualizar matriz PLAME');
    }
  } catch (error) {
    console.error('❌ Error al actualizar matriz PLAME:', error);
    throw error;
  }
};

// Obtener estadísticas PLAME
export const getEstadisticasPlame = async (plameId) => {
  try {
    console.log('📊 Obteniendo estadísticas PLAME ID:', plameId);
    
    const res = await fetch(`${API_URL}/plame/estadisticas/${plameId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.exito && data.datos) {
      return data.datos;
    } else {
      throw new Error(data.error || 'Error al obtener estadísticas PLAME');
    }
  } catch (error) {
    console.error('❌ Error al obtener estadísticas PLAME:', error);
    throw error;
  }
};

// Crear PLAME para subfase
export const crearPlameParaSubfase = async (subfaseId, plameData) => {
  try {
    console.log('🆕 Creando PLAME para subfase:', subfaseId, plameData);
    
    const res = await fetch(`${API_URL}/plame`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        subfase_id: subfaseId,
        ...plameData
      }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.exito && data.datos) {
      console.log('✅ PLAME creado exitosamente');
      return data.datos;
    } else {
      throw new Error(data.error || 'Error al crear PLAME');
    }
  } catch (error) {
    console.error('❌ Error al crear PLAME:', error);
    throw error;
  }
};

// Actualizar una relación específica en la matriz PLAME
export const actualizarRelacionPlame = async (plameId, filaId, columnaId, valor) => {
  try {
    console.log('🔄 Actualizando relación PLAME:', { plameId, filaId, columnaId, valor });
    
    const res = await fetch(`${API_URL}/plame/relacion`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id_plame: plameId,
        id_fila_plame: filaId,
        id_columna_plame: columnaId,
        valor_relacion_plame: valor
      }),
    });
    
    if (!res.ok) {
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.mensaje || errorData.error || errorMessage;
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    console.log('🔍 Respuesta del servidor:', data);
    
    // Verificar diferentes formatos de respuesta exitosa
    if (data.exito === true || res.status === 200) {
      console.log('✅ Relación PLAME actualizada exitosamente');
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || data.error || 'Error al actualizar relación PLAME');
    }
  } catch (error) {
    console.error('❌ Error al actualizar relación PLAME:', error);
    throw error;
  }
};

// ===============================
// FUNCIONES DE REPORTES
// ===============================

/**
 * Obtener KPIs principales del sistema
 */
export const getReportesKPIs = async (filters = {}) => {
  try {
    console.log('📊 Obteniendo KPIs de reportes', filters);
    
    const params = new URLSearchParams();
    if (filters.year && filters.year !== 'todos') params.append('year', filters.year);
    if (filters.facultad_id && filters.facultad_id !== 'todas') params.append('facultad_id', filters.facultad_id);
    if (filters.modalidad_id && filters.modalidad_id !== 'todas') params.append('modalidad_id', filters.modalidad_id);
    
    const res = await fetch(`${API_URL}/reportes/kpis?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener KPIs');
    }
  } catch (error) {
    console.error('❌ Error al obtener KPIs:', error);
    throw error;
  }
};

/**
 * Obtener análisis por facultades
 */
export const getReportesAnalisisFacultades = async (filters = {}) => {
  try {
    console.log('🏛️ Obteniendo análisis de facultades', filters);
    
    const params = new URLSearchParams();
    if (filters.year && filters.year !== 'todos') params.append('year', filters.year);
    if (filters.modalidad_id && filters.modalidad_id !== 'todas') params.append('modalidad_id', filters.modalidad_id);
    
    const res = await fetch(`${API_URL}/reportes/facultades/analisis?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener análisis de facultades');
    }
  } catch (error) {
    console.error('❌ Error al obtener análisis de facultades:', error);
    throw error;
  }
};

/**
 * Obtener progreso por modalidades
 */
export const getReportesProgresoModalidades = async (filters = {}) => {
  try {
    console.log('🎯 Obteniendo progreso de modalidades', filters);
    
    const params = new URLSearchParams();
    if (filters.year && filters.year !== 'todos') params.append('year', filters.year);
    if (filters.facultad_id && filters.facultad_id !== 'todas') params.append('facultad_id', filters.facultad_id);
    
    const res = await fetch(`${API_URL}/reportes/modalidades/progreso?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener progreso de modalidades');
    }
  } catch (error) {
    console.error('❌ Error al obtener progreso de modalidades:', error);
    throw error;
  }
};

/**
 * Obtener tendencias temporales
 */
export const getReportesTendenciasTemporales = async (filters = {}) => {
  try {
    console.log('📈 Obteniendo tendencias temporales', filters);
    
    const params = new URLSearchParams();
    if (filters.facultad_id && filters.facultad_id !== 'todas') params.append('facultad_id', filters.facultad_id);
    if (filters.modalidad_id && filters.modalidad_id !== 'todas') params.append('modalidad_id', filters.modalidad_id);
    
    const res = await fetch(`${API_URL}/reportes/tendencias-temporales?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener tendencias temporales');
    }
  } catch (error) {
    console.error('❌ Error al obtener tendencias temporales:', error);
    throw error;
  }
};

/**
 * Obtener distribución de estados
 */
export const getReportesDistribucionEstados = async (filters = {}) => {
  try {
    console.log('📊 Obteniendo distribución de estados', filters);
    
    const params = new URLSearchParams();
    if (filters.year && filters.year !== 'todos') params.append('year', filters.year);
    if (filters.facultad_id && filters.facultad_id !== 'todas') params.append('facultad_id', filters.facultad_id);
    if (filters.modalidad_id && filters.modalidad_id !== 'todas') params.append('modalidad_id', filters.modalidad_id);
    
    const res = await fetch(`${API_URL}/reportes/estados/distribucion?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener distribución de estados');
    }
  } catch (error) {
    console.error('❌ Error al obtener distribución de estados:', error);
    throw error;
  }
};

/**
 * Obtener carreras con acreditación por facultad
 */
export const getReportesCarrerasPorFacultad = async (facultadId) => {
  try {
    console.log(`📚 Obteniendo carreras de facultad ${facultadId}`);
    
    const res = await fetch(`${API_URL}/reportes/facultades/${facultadId}/carreras`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.estado) {
      return data.datos || data;
    } else {
      throw new Error(data.mensaje || 'Error al obtener carreras por facultad');
    }
  } catch (error) {
    console.error('❌ Error al obtener carreras por facultad:', error);
    throw error;
  }
};

// ===== FUNCIONES DE UTILIDAD =====

// Verificar conectividad con el servidor
export const verificarConectividadServidor = async () => {
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' },
    });
    
    return res.ok;
  } catch (error) {
    console.error('Error de conectividad:', error);
    return false;
  }
};

// Verificar autenticación actual
export const verificarAutenticacion = () => {
  const token = getAuthToken();
  return !!token;
};

