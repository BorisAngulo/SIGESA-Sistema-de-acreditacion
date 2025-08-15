import React from 'react';
import './UserCard.css';

const UserCard = ({ user, currentUser, onEdit, onDelete }) => {
  const getRoleDisplayName = (roleName) => {
    const roleNames = {
      'Admin': 'Administrador',
      'Tecnico': 'Técnico',
      'Coordinador': 'Coordinador',
      'General': 'General'
    };
    return roleNames[roleName] || roleName;
  };

  const getRoleColor = (roleName) => {
    const roleColors = {
      'Admin': '#dc2626',
      'Tecnico': '#2563eb',
      'Coordinador': '#059669',
      'General': '#7c3aed'
    };
    return roleColors[roleName] || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isCurrentUser = currentUser && currentUser.id === user.id;
  const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'Sin rol';

  // Debug temporal para ver qué datos llegan
  if (userRole === 'Coordinador') {
    console.log('Usuario Coordinador:', user);
    console.log('Carrera:', user.carrera);
    console.log('ID Carrera:', user.id_carrera_usuario);
  }

  return (
    <div className={`user-card ${isCurrentUser ? 'current-user' : ''}`}>
      {isCurrentUser && (
        <div className="current-user-badge">
          Tú
        </div>
      )}
      
      <div className="user-role-header">
        <div 
          className="role-display"
          style={{ backgroundColor: getRoleColor(userRole) }}
        >
          {getRoleDisplayName(userRole)}
        </div>
      </div>

      <div className="user-info">
        <h3 className="user-name">
          {user.name} {user.lastName || ''}
        </h3>
        <p className="user-email">{user.email}</p>
        
        <div className="user-details">
          <div className="detail-row">
            <span className="detail-label">ID:</span>
            <span className="detail-value">#{user.id}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Creado:</span>
            <span className="detail-value">{formatDate(user.created_at)}</span>
          </div>

          {/* Información adicional para Coordinadores */}
          {userRole === 'Coordinador' && (
            <>
              {/* Mostrar información de carrera si está disponible */}
              {user.carrera && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Facultad:</span>
                    <span className="detail-value">{user.carrera.facultad?.nombre_facultad || 'No asignada'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Carrera:</span>
                    <span className="detail-value">{user.carrera.nombre_carrera || 'No asignada'}</span>
                  </div>
                </>
              )}
              
              {/* Mostrar mensaje si no hay carrera asignada */}
              {!user.carrera && user.id_carrera_usuario && (
                <div className="detail-row">
                  <span className="detail-label">Carrera:</span>
                  <span className="detail-value">ID: {user.id_carrera_usuario} (Detalles no cargados)</span>
                </div>
              )}
              
              {/* Mostrar mensaje si no tiene carrera asignada */}
              {!user.carrera && !user.id_carrera_usuario && (
                <div className="detail-row">
                  <span className="detail-label">Carrera:</span>
                  <span className="detail-value">No asignada</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="user-actions">
        <button 
          className="action-btn edit-btn"
          onClick={() => onEdit(user)}
          title="Editar usuario"
        >
          ✏️ Editar
        </button>
        
        {!isCurrentUser && (
          <button 
            className="action-btn delete-btn"
            onClick={() => onDelete(user)}
            title="Eliminar usuario"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
