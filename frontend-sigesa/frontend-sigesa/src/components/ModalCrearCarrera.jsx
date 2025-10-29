import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Code, Globe, AlertCircle, Building2 } from 'lucide-react';
import { createCarrera, getFacultades } from '../services/api';
import ModalConfirmacionCreacion from './ModalConfirmacionCreacion';
import ModalConfirmacion from './ModalConfirmacion';
import useToast from '../hooks/useToast';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import '../styles/ModalCrearCarrera.css';

export default function ModalCrearCarrera({ isOpen, onClose, onSuccess, facultadId }) {
  const [formData, setFormData] = useState({
    facultad_id: facultadId || '',
    codigo_carrera: '',
    nombre_carrera: '',
    pagina_carrera: '',
    id_usuario_updated_carrera: 1 
  });
  
  const [facultad, setFacultad] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFacultad, setLoadingFacultad] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();

  // Hook para controlar el scroll del body
  useBodyScrollLock(isOpen);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && facultadId) {
      cargarFacultad();
    }
  }, [isOpen, facultadId]);

  // Limpiar datos cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        facultad_id: facultadId || '',
        codigo_carrera: '',
        nombre_carrera: '',
        pagina_carrera: '',
        id_usuario_updated_carrera: 1 
      });
      setFieldErrors({});
      setShowConfirmModal(false);
      setLoading(false);
      setFacultad(null);
    }
  }, [isOpen, facultadId]);

  const cargarFacultad = async () => {
    try {
      setLoadingFacultad(true);
      const facultadesData = await getFacultades();
      const facultadEncontrada = facultadesData.find(f => f.id === parseInt(facultadId));
      
      if (!facultadEncontrada) {
        throw new Error('Facultad no encontrada');
      }
      
      setFacultad(facultadEncontrada);
    } catch (error) {
      console.error('Error al cargar facultad:', error);
      toast.error('Error al cargar la información de la facultad');
    } finally {
      setLoadingFacultad(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const formattedValue = name === 'codigo_carrera' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpiar errores al escribir
    if (fieldErrors[name]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      setFieldErrors(newErrors);
    }
  };

  const validarFormulario = () => {
    const errors = {};

    if (!formData.codigo_carrera.trim()) {
      errors.codigo_carrera = 'El código es requerido';
    } else if (formData.codigo_carrera.length < 2) {
      errors.codigo_carrera = 'El código debe tener al menos 2 caracteres';
    } else if (!/^[A-Z0-9]+$/.test(formData.codigo_carrera)) {
      errors.codigo_carrera = 'El código solo puede contener letras mayúsculas y números';
    }

    if (!formData.nombre_carrera.trim()) {
      errors.nombre_carrera = 'El nombre es requerido';
    } else if (formData.nombre_carrera.length < 3) {
      errors.nombre_carrera = 'El nombre debe tener al menos 3 caracteres';
    }

    if (formData.pagina_carrera && formData.pagina_carrera.trim()) {
      const urlPattern = /^https?:\/\/.+\..+/;
      if (!urlPattern.test(formData.pagina_carrera)) {
        errors.pagina_carrera = 'La URL debe tener un formato válido (ej: https://ejemplo.com)';
      }
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validarFormulario();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setFieldErrors({});
    setShowConfirmModal(true);
  };

  const handleConfirmCreacion = async () => {
    try {
      setLoading(true);
      
      const dataToSend = {
        ...formData,
        facultad_id: parseInt(facultadId)
      };

      if (!dataToSend.pagina_carrera.trim()) {
        delete dataToSend.pagina_carrera;
      }

      await createCarrera(dataToSend);
      
      handleSuccessWithAnimation();
    } catch (error) {
      console.error('Error al crear carrera:', error);
      
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        toast.error('Se encontraron errores en el formulario');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al crear la carrera. Por favor, intenta nuevamente');
      }
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleCancelConfirmacion = () => {
    setShowConfirmModal(false);
  };

  // Función para cerrar modal con animación
  const handleClose = () => {
    if (loading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Función para manejar el éxito con animación
  const handleSuccessWithAnimation = () => {
    toast.success(`La carrera "${formData.nombre_carrera}" ha sido creada exitosamente`);
    
    // Notificar al componente padre que hubo cambios
    if (onSuccess) {
      onSuccess();
    }
    
    // Cerrar modal con animación
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Función para manejar clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const datosParaModal = [
    { label: "Facultad", valor: facultad?.nombre_facultad || 'Cargando...' },
    { label: "Código", valor: formData.codigo_carrera },
    { label: "Nombre", valor: formData.nombre_carrera },
    ...(formData.pagina_carrera ? [{ label: "Página Web", valor: formData.pagina_carrera }] : [])
  ];

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-crear-carrera-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-crear-carrera-container ${isClosing ? 'closing' : ''}`}>
        <button
          className="close-button"
          onClick={handleClose}
          disabled={loading}
        >
          <X size={24} />
        </button>

        <div className="modal-crear-carrera-header">
          <div className="modal-crear-carrera-header-content">
            <div className="modal-crear-carrera-icon-container">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="modal-crear-carrera-title">Crear Nueva Carrera</h2>
              <p className="modal-crear-carrera-subtitle">
                Agrega una nueva carrera a la facultad
              </p>
            </div>
          </div>
        </div>

        <div className="modal-crear-carrera-content">
          {loadingFacultad ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Cargando información de la facultad...</p>
            </div>
          ) : !facultad ? (
            <div className="error-section">
              <AlertCircle size={48} />
              <h3>Facultad no encontrada</h3>
              <p>No se pudo cargar la información de la facultad</p>
            </div>
          ) : (
            <>
              <div className="facultad-info">
                <Building2 size={20} />
                <span>Facultad: <strong>{facultad.nombre_facultad}</strong></span>
              </div>

              <form onSubmit={handleSubmit} className="modal-crear-carrera-form">
                <div className="modal-crear-carrera-section">
                  <h3 className="modal-crear-carrera-section-title">
                    <BookOpen size={20} />
                    Información de la Carrera
                  </h3>

                  <div className="modal-crear-carrera-form-grid">
                    {/* Código de la Carrera */}
                    <div className="modal-crear-carrera-form-group">
                      <label className="modal-crear-carrera-form-label">
                        <Code size={16} />
                        <span>Código de la Carrera</span>
                      </label>
                      <div className="input-with-counter">
                        <input
                          type="text"
                          name="codigo_carrera"
                          value={formData.codigo_carrera}
                          onChange={handleInputChange}
                          placeholder="Ej: 1690888"
                          className={`modal-crear-carrera-form-input ${fieldErrors.codigo_carrera ? 'error' : ''}`}
                          maxLength="10"
                          disabled={loading}
                        />
                        <span className="char-counter">
                          {formData.codigo_carrera.length}/10
                        </span>
                      </div>
                      {fieldErrors.codigo_carrera && (
                        <span className="modal-crear-carrera-form-error">
                          <AlertCircle size={16} />
                          {fieldErrors.codigo_carrera}
                        </span>
                      )}
                    </div>

                    {/* Nombre de la Carrera */}
                    <div className="modal-crear-carrera-form-group">
                      <label className="modal-crear-carrera-form-label">
                        <BookOpen size={16} />
                        <span>Nombre de la Carrera</span>
                      </label>
                      <div className="input-with-counter">
                        <input
                          type="text"
                          name="nombre_carrera"
                          value={formData.nombre_carrera}
                          onChange={handleInputChange}
                          placeholder="Ej: Ingeniería de Sistemas"
                          className={`modal-crear-carrera-form-input ${fieldErrors.nombre_carrera ? 'error' : ''}`}
                          maxLength="100"
                          disabled={loading}
                        />
                        <span className="char-counter">
                          {formData.nombre_carrera.length}/100
                        </span>
                      </div>
                      {fieldErrors.nombre_carrera && (
                        <span className="modal-crear-carrera-form-error">
                          <AlertCircle size={16} />
                          {fieldErrors.nombre_carrera}
                        </span>
                      )}
                    </div>

                    {/* Página Web */}
                    <div className="modal-crear-carrera-form-group full-width">
                      <label className="modal-crear-carrera-form-label">
                        <Globe size={16} />
                        <span>Página Web <span className="optional-text">(opcional)</span></span>
                      </label>
                      <div className="input-with-counter">
                        <input
                          type="url"
                          name="pagina_carrera"
                          value={formData.pagina_carrera}
                          onChange={handleInputChange}
                          placeholder="https://ejemplo.com"
                          className={`modal-crear-carrera-form-input ${fieldErrors.pagina_carrera ? 'error' : ''}`}
                          maxLength="100"
                          disabled={loading}
                        />
                        <span className="char-counter">
                          {formData.pagina_carrera.length}/100
                        </span>
                      </div>
                      {fieldErrors.pagina_carrera && (
                        <span className="modal-crear-carrera-form-error">
                          <AlertCircle size={16} />
                          {fieldErrors.pagina_carrera}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="modal-crear-carrera-footer">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || loadingFacultad || !facultad}
            className="btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Crear Carrera</span>
              </>
            )}
          </button>
        </div>

        <ModalConfirmacion
          isOpen={showConfirmModal}
          onClose={handleCancelConfirmacion}
          onConfirm={handleConfirmCreacion}
          titulo="Confirmar Creación de Carrera"
          mensaje={`¿Estás seguro de que deseas crear esta carrera en la facultad "${facultad?.nombre_facultad}"?`}
          Loading={loading}
        />
      </div>
    </div>
  );
}