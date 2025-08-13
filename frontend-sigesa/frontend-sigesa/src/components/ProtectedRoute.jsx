import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../services/permissions';
import './ProtectedRoute.css';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  permission,
  permissions,
  requireAllPermissions = false,
  fallbackMessage = 'No tienes permisos para acceder a esta sección'
}) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        <div className="loading-text">
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si se requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos especificados, verificar que el usuario tenga uno de ellos
  if (allowedRoles.length > 0 && isAuthenticated()) {
    const userRole = getUserRole();
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-card">
            <h2>Acceso Denegado</h2>
            <p>No tienes permisos para acceder a esta página.</p>
            <p>Tu rol actual: <strong>{userRole}</strong></p>
            <p>Roles permitidos: <strong>{allowedRoles.join(', ')}</strong></p>
            <button onClick={() => window.history.back()}>
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  // Verificar permisos específicos si están definidos
  if (isAuthenticated()) {
    let hasAccess = true;

    // Verificar permiso único
    if (permission) {
      hasAccess = hasPermission(permission);
    }
    // Verificar múltiples permisos
    else if (permissions && Array.isArray(permissions)) {
      hasAccess = requireAllPermissions 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    // Si no tiene acceso por permisos
    if (!hasAccess) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-card">
            <h2>Acceso Denegado</h2>
            <p>{fallbackMessage}</p>
            <button onClick={() => window.history.back()}>
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
