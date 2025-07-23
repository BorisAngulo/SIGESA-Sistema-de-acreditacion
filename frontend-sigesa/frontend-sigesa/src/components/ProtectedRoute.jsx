import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
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

  return children;
};

export default ProtectedRoute;
