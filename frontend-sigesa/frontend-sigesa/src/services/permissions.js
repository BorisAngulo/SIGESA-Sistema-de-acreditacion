// Servicio para manejar roles y permisos basado en roles

/**
 * Obtener roles del usuario desde localStorage
 * @returns {Array} Array de roles del usuario
 */
export const getUserRoles = () => {
  try {
    const roles = localStorage.getItem('userRoles');
    return roles ? JSON.parse(roles) : [];
  } catch (error) {
    console.error('Error al obtener roles del localStorage:', error);
    return [];
  }
};

/**
 * Verificar si el usuario tiene un rol específico
 * @param {string} role - Nombre del rol a verificar
 * @returns {boolean} True si el usuario tiene el rol
 */
export const hasRole = (role) => {
  try {
    const userRoles = getUserRoles();
    return userRoles.includes(role);
  } catch (error) {
    console.error('Error al verificar rol:', error);
    return false;
  }
};

/**
 * Verificar si el usuario tiene alguno de los roles especificados
 * @param {Array} roles - Array de roles a verificar
 * @returns {boolean} True si el usuario tiene al menos uno de los roles
 */
export const hasAnyRole = (roles) => {
  try {
    return roles.some(role => hasRole(role));
  } catch (error) {
    console.error('Error al verificar roles:', error);
    return false;
  }
};

/**
 * Verificar si el usuario tiene todos los roles especificados
 * @param {Array} roles - Array de roles a verificar
 * @returns {boolean} True si el usuario tiene todos los roles
 */
export const hasAllRoles = (roles) => {
  try {
    return roles.every(role => hasRole(role));
  } catch (error) {
    console.error('Error al verificar roles:', error);
    return false;
  }
};

// Funciones de conveniencia para roles específicos
export const isAdmin = () => hasRole('Admin');
export const isTecnico = () => hasRole('Tecnico');
export const isCoordinador = () => hasRole('Coordinador');

// Funciones para verificar si puede realizar acciones específicas basadas en roles
export const canManageFacultades = () => hasAnyRole(['Admin', 'Tecnico']);
export const canManageCarreras = () => hasAnyRole(['Admin', 'Tecnico']);
export const canManageUsers = () => hasRole('Admin');
export const canViewReports = () => hasAnyRole(['Admin', 'Tecnico']);
export const canDeleteItems = () => hasAnyRole(['Admin', 'Tecnico']);

// Mantener compatibilidad con funciones de permisos existentes
export const hasPermission = (permission) => {
  // Mapear permisos a roles
  const permissionRoleMap = {
    'facultades.store': ['Admin', 'Tecnico'],
    'facultades.update': ['Admin', 'Tecnico'],
    'facultades.delete': ['Admin', 'Tecnico'],
    'carreras.store': ['Admin', 'Tecnico'],
    'carreras.update': ['Admin', 'Tecnico'],
    'carreras.delete': ['Admin', 'Tecnico'],
    'usuarios.index': ['Admin'],
    'reportes.index': ['Admin', 'Tecnico'],
    'modalidades.index': ['Admin', 'Tecnico'],
  };
  
  const allowedRoles = permissionRoleMap[permission] || [];
  return hasAnyRole(allowedRoles);
};

export const hasAnyPermission = (permissions) => {
  return permissions.some(permission => hasPermission(permission));
};

export const hasAllPermissions = (permissions) => {
  return permissions.every(permission => hasPermission(permission));
};

/**
 * Limpiar roles del localStorage
 */
export const clearUserRoles = () => {
  try {
    localStorage.removeItem('userRoles');
  } catch (error) {
    console.error('Error al limpiar roles:', error);
  }
};
