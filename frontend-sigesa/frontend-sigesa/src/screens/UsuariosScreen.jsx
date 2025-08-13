import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserCard from '../components/Users/UserCard';
import CreateUserModal from '../components/Users/CreateUserModal';
import EditUserModal from '../components/Users/EditUserModal';
import ConfirmDeleteModal from '../components/Users/ConfirmDeleteModal';
import { getUsersAPI, deleteUserAPI } from '../services/userAPI';
import './UsuariosScreen.css';

const UsuariosScreen = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsersAPI(token);
      
      if (response.success) {
        setUsers(response.data);
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.mensaje || response.error?.error || 'Error al cargar usuarios';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Error de conexión al cargar usuarios';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (userData) => {
    setSelectedUser(userData);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userData) => {
    setSelectedUser(userData);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await deleteUserAPI(selectedUser.id, token);
      
      if (response.success) {
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.mensaje || response.error?.error || 'Error al eliminar usuario';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Error de conexión al eliminar usuario';
      setError(errorMessage);
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers([...users, newUser]);
    setShowCreateModal(false);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = !roleFilter || (user.roles && user.roles.some(role => role.name === roleFilter));
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="usuarios-screen">
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-inner"></div>
            </div>
            <h2 className="loading-title">Cargando Usuarios</h2>
            <p className="loading-subtitle">Por favor espera un momento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-screen">
      <div className="usuarios-header">
        <div className="header-content">
          <h1>Gestión de Usuarios</h1>
          <p>Administrar usuarios del sistema SIGESA</p>
        </div>
        <button className="btn-primary" onClick={handleCreateUser}>
          + Crear Usuario
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <span>⚠️ {typeof error === 'string' ? error : error.mensaje || error.error || 'Error desconocido'}</span>
          <button onClick={() => setError('')} className="close-alert">×</button>
        </div>
      )}

      <div className="usuarios-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los roles</option>
            <option value="Admin">Admin</option>
            <option value="Tecnico">Técnico</option>
            <option value="Coordinador">Coordinador</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="results-count">
          <span>{filteredUsers.length} usuario(s) encontrado(s)</span>
        </div>
      </div>

      <div className="usuarios-grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(userData => (
            <UserCard
              key={userData.id}
              user={userData}
              currentUser={user}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          ))
        ) : (
          <div className="no-users">
            <p>No se encontraron usuarios</p>
            {searchTerm || roleFilter ? (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                }}
                className="btn-secondary"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreated={handleUserCreated}
          token={token}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdated}
          token={token}
        />
      )}

      {showDeleteModal && selectedUser && (
        <ConfirmDeleteModal
          user={selectedUser}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmDeleteUser}
        />
      )}
    </div>
  );
};

export default UsuariosScreen;
