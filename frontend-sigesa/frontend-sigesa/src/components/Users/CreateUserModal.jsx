import React, { useState, useEffect, useCallback } from 'react';
import { createUserAPI, getRolesAPI } from '../../services/userAPI';
import { getFacultades, getCarrerasByFacultad } from '../../services/api';
import './UserModal.css';
import useToast from '../../hooks/useToast';

const CreateUserModal = ({ onClose, onUserCreated, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
    facultad_id: '',
    id_carrera_usuario: ''
  });
  
  const [roles, setRoles] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const toast = useToast();

  const loadRoles = useCallback(async () => {
    try {
      const response = await getRolesAPI(token);
      if (response.success) {
        setRoles(response.data);
      } else {
        console.error('Error al cargar roles:', response.error);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  }, [token]);

  const loadFacultades = useCallback(async () => {
    try {
      const response = await getFacultades();
      if (response && response.length > 0) {
        setFacultades(response);
      }
    } catch (error) {
      console.error('Error al cargar facultades:', error);
    }
  }, []);

  const loadCarrerasByFacultad = useCallback(async (facultadId) => {
    try {
      const response = await getCarrerasByFacultad(facultadId);
      if (response && response.length > 0) {
        setCarreras(response);
      } else {
        setCarreras([]);
      }
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setCarreras([]);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadFacultades();
  }, [loadRoles, loadFacultades]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambió la facultad, cargar las carreras de esa facultad
    if (name === 'facultad_id' && value) {
      loadCarrerasByFacultad(value);
      // Limpiar la carrera seleccionada cuando se cambia la facultad
      setFormData(prev => ({
        ...prev,
        facultad_id: value,
        id_carrera_usuario: ''
      }));
      return;
    }
    
    // Si se cambió el rol y no es Coordinador, limpiar facultad y carrera
    if (name === 'role') {
      if (value !== 'Coordinador') {
        setFormData(prev => ({
          ...prev,
          role: value,
          facultad_id: '',
          id_carrera_usuario: ''
        }));
        setCarreras([]);
      } else {
        setFormData(prev => ({
          ...prev,
          role: value
        }));
      }
    } else {
      // Para todos los demás campos
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden';
    }
    
    if (!formData.role) {
      errors.role = 'El rol es requerido';
    }
    
    // Validaciones adicionales para Coordinador
    if (formData.role === 'Coordinador') {
      if (!formData.facultad_id) {
        errors.facultad_id = 'La facultad es requerida para el rol Coordinador';
      }
      if (!formData.id_carrera_usuario) {
        errors.id_carrera_usuario = 'La carrera es requerida para el rol Coordinador';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    setError('');
    setValidationErrors({});
    
    try {
      const response = await createUserAPI(formData, token);
      
      if (response.success) {
        onUserCreated(response.data);
        toast.success('Usuario creado exitosamente');
      } else {
        if (response.validationErrors) {
          setValidationErrors(response.validationErrors);
        } else {
          setError(response.error);
        }
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setError('Error inesperado al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Usuario</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="modal-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={validationErrors.name ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.name && (
                <span className="field-error">{validationErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Apellido *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={validationErrors.lastName ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.lastName && (
                <span className="field-error">{validationErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={validationErrors.email ? 'error' : ''}
              disabled={loading}
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={validationErrors.password ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password_confirmation">Confirmar Contraseña *</label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                className={validationErrors.password_confirmation ? 'error' : ''}
                disabled={loading}
              />
              {validationErrors.password_confirmation && (
                <span className="field-error">{validationErrors.password_confirmation}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={validationErrors.role ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Seleccionar rol</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'Admin' ? 'Administrador' : 
                   role === 'Tecnico' ? 'Técnico' : 
                   role === 'Coordinador' ? 'Coordinador' : 
                   role === 'General' ? 'General' : role}
                </option>
              ))}
            </select>
            {validationErrors.role && (
              <span className="field-error">{validationErrors.role}</span>
            )}
          </div>

          {/* Campos adicionales para Coordinador */}
          {formData.role === 'Coordinador' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="facultad_id">Facultad *</label>
                  <select
                    id="facultad_id"
                    name="facultad_id"
                    value={formData.facultad_id}
                    onChange={handleInputChange}
                    className={validationErrors.facultad_id ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="">Seleccionar facultad</option>
                    {facultades.map(facultad => (
                      <option key={facultad.id} value={facultad.id}>
                        {facultad.nombre_facultad}
                      </option>
                    ))}
                  </select>
                  {validationErrors.facultad_id && (
                    <span className="field-error">{validationErrors.facultad_id}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="id_carrera_usuario">Carrera *</label>
                  <select
                    id="id_carrera_usuario"
                    name="id_carrera_usuario"
                    value={formData.id_carrera_usuario}
                    onChange={handleInputChange}
                    className={validationErrors.id_carrera_usuario ? 'error' : ''}
                    disabled={loading || !formData.facultad_id}
                  >
                    <option value="">
                      {!formData.facultad_id ? 'Primero selecciona una facultad' : 'Seleccionar carrera'}
                    </option>
                    {carreras.map(carrera => (
                      <option 
                        key={carrera.id} 
                        value={carrera.id}
                        title={carrera.nombre_carrera}
                      >
                        {carrera.nombre_carrera}
                      </option>
                    ))}
                  </select>
                  {validationErrors.id_carrera_usuario && (
                    <span className="field-error">{validationErrors.id_carrera_usuario}</span>
                  )}
                </div>
              </div>
            </>
          )}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
