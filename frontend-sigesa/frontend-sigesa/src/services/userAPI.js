const API_URL = "http://127.0.0.1:8000/api";

// Obtener todos los usuarios
export const getUsersAPI = async (token) => {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Respuesta de usuarios:', data);

    if (response.ok && data.exito) {
      return {
        success: true,
        data: data.datos
      };
    } else {
      return {
        success: false,
        error: data.error || data.mensaje || 'Error al obtener usuarios'
      };
    }
  } catch (error) {
    console.error('Error de red al obtener usuarios:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};

// Crear nuevo usuario
export const createUserAPI = async (userData, token) => {
  try {
    console.log('Creando usuario con datos:', userData);
    
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Respuesta crear usuario:', data);

    if (response.ok && data.exito) {
      return {
        success: true,
        data: data.datos
      };
    } else {
      return {
        success: false,
        error: data.error || data.mensaje || 'Error al crear usuario',
        validationErrors: data.errores || null
      };
    }
  } catch (error) {
    console.error('Error de red al crear usuario:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};

// Actualizar usuario
export const updateUserAPI = async (userId, userData, token) => {
  try {
    console.log('Actualizando usuario:', userId, userData);
    
    const response = await fetch(`${API_URL}/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Respuesta actualizar usuario:', data);

    if (response.ok && data.exito) {
      return {
        success: true,
        data: data.datos
      };
    } else {
      return {
        success: false,
        error: data.error || data.mensaje || 'Error al actualizar usuario',
        validationErrors: data.errores || null
      };
    }
  } catch (error) {
    console.error('Error de red al actualizar usuario:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};

// Eliminar usuario
export const deleteUserAPI = async (userId, token) => {
  try {
    console.log('Eliminando usuario:', userId);
    
    const response = await fetch(`${API_URL}/usuarios/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Respuesta eliminar usuario:', data);

    if (response.ok && data.exito) {
      return {
        success: true,
        data: data.datos
      };
    } else {
      return {
        success: false,
        error: data.error || data.mensaje || 'Error al eliminar usuario'
      };
    }
  } catch (error) {
    console.error('Error de red al eliminar usuario:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};

// Obtener roles disponibles
export const getRolesAPI = async (token) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Respuesta roles:', data);

    if (response.ok && data.exito) {
      // Normalizar la respuesta - asegurar que sean strings o extraer el campo 'name'
      const normalizedRoles = data.datos.map(role => {
        if (typeof role === 'string') {
          return role;
        }
        if (typeof role === 'object' && role.name) {
          return role.name;
        }
        return role;
      });
      
      return {
        success: true,
        data: normalizedRoles
      };
    } else {
      return {
        success: false,
        error: data.error || data.mensaje || 'Error al obtener roles'
      };
    }
  } catch (error) {
    console.error('Error de red al obtener roles:', error);
    return {
      success: false,
      error: 'Error de conexión'
    };
  }
};
