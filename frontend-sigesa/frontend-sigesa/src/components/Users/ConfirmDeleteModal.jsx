import React from 'react';
import './UserModal.css';

const ConfirmDeleteModal = ({ user, onClose, onConfirm }) => {
  const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'Sin rol';
  
  const getRoleDisplayName = (roleName) => {
    const roleNames = {
      'Admin': 'Administrador',
      'Tecnico': 'Técnico',
      'Coordinador': 'Coordinador',
      'General': 'General'
    };
    return roleNames[roleName] || roleName;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirmar Eliminación</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="delete-content">
          <div className="warning-icon">
            ⚠️
          </div>
          
          <div className="delete-message">
            <p>¿Estás seguro de que quieres eliminar este usuario?</p>
            <p className="warning-text">
              Esta acción <strong>no se puede deshacer</strong>.
            </p>
          </div>

          <div className="user-preview">
            <div className="preview-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="preview-info">
              <h4>{user.name} {user.lastName || ''}</h4>
              <p>{user.email}</p>
              <span className="preview-role">
                {getRoleDisplayName(userRole)}
              </span>
            </div>
          </div>

          <div className="consequences">
            <h4>Consecuencias de esta acción:</h4>
            <ul>
              <li>Se eliminará toda la información del usuario</li>
              <li>Se revocarán todos sus accesos al sistema</li>
              <li>Sus datos asociados podrían quedar huérfanos</li>
              <li>No podrá volver a acceder con estas credenciales</li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-danger"
            onClick={onConfirm}
          >
            Sí, Eliminar Usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
