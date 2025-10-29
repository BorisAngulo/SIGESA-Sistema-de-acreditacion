import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Hash, Globe, AlertCircle } from 'lucide-react';
import { updateFacultad, getFacultadById } from '../services/api';
import useToast from '../hooks/useToast';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import '../styles/ModalEditarFacultad.css';

export default function ModalEditarFacultad({ isOpen, onClose, onSuccess, facultadId }) {
  const [formData, setFormData] = useState({
    nombre_facultad: '',
    codigo_facultad: '',
    pagina_facultad: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [initialData, setInitialData] = useState({});
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
        nombre_facultad: '',
        codigo_facultad: '',
        pagina_facultad: ''
      });
      setErrors({});
      setTouched({});
      setInitialData({});
      setSaving(false);
    }
  }, [isOpen]);

  const cargarFacultad = async () => {
    try {
      setLoading(true);
      const facultad = await getFacultadById(facultadId);
      
      const data = {
        nombre_facultad: facultad.nombre_facultad || '',
        codigo_facultad: facultad.codigo_facultad || '',
        pagina_facultad: facultad.pagina_facultad || ''
      };
      
      setFormData(data);
      setInitialData(data);
      
    } catch (error) {
      console.error('Error al cargar facultad:', error);
      setErrors({ general: error.message });
      toast.error('Error al cargar la facultad');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nombre_facultad':
        if (!value.trim()) {
          newErrors.nombre_facultad = 'El nombre es requerido';
        } else if (value.length < 3) {
          newErrors.nombre_facultad = 'El nombre debe tener al menos 3 caracteres';
        } else if (value.length > 100) {
          newErrors.nombre_facultad = 'El nombre no puede exceder 100 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors.nombre_facultad = 'El nombre solo puede contener letras y espacios';
        } else {
          delete newErrors.nombre_facultad;
        }
        break;

      case 'codigo_facultad':
        if (!value.trim()) {
          newErrors.codigo_facultad = 'El código es requerido';
        } else if (value.length < 2) {
          newErrors.codigo_facultad = 'El código debe tener al menos 2 caracteres';
        } else if (value.length > 10) {
          newErrors.codigo_facultad = 'El código no puede exceder 10 caracteres';
        } else if (!/^[A-Z0-9]+$/.test(value)) {
          newErrors.codigo_facultad = 'El código solo puede contener letras mayúsculas y números';
        } else {
          delete newErrors.codigo_facultad;
        }
        break;

      case 'pagina_facultad':
        if (value && value.trim()) {
          const urlPattern = /^https?:\/\/.+\..+/;
          if (!urlPattern.test(value)) {
            newErrors.pagina_facultad = 'La URL debe tener un formato válido (ej: https://ejemplo.com)';
          } else {
            delete newErrors.pagina_facultad;
          }
        } else {
          delete newErrors.pagina_facultad;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const formattedValue = name === 'codigo_facultad' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpiar errores al escribir
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      setTimeout(() => {
        validateField(name, formattedValue);
      }, 300);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateField(name, value);
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      setErrors({ general: 'No se han detectado cambios' });
      return;
    }

    // Validar todos los campos
    ['nombre_facultad', 'codigo_facultad', 'pagina_facultad'].forEach(field => {
      validateField(field, formData[field]);
    });

    // Verificar si hay errores de validación
    const validationErrors = Object.keys(errors).filter(key => key !== 'general');
    if (validationErrors.length > 0) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      await updateFacultad(facultadId, formData);
      
      handleSuccessWithAnimation();
      
    } catch (error) {
      console.error('Error al actualizar facultad:', error);
      
      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ general: error.message || 'Error al actualizar la facultad' });
      }
      
      toast.error('Error al actualizar la facultad');
    } finally {
      setSaving(false);
    }
  };

  // Función para cerrar modal con animación
  const handleClose = () => {
    if (saving) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Función para manejar el éxito con animación
  const handleSuccessWithAnimation = () => {
    toast.success('Facultad actualizada exitosamente');
    
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
    if (e.target === e.currentTarget && !saving) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-editar-facultad-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-editar-facultad-container ${isClosing ? 'closing' : ''}`}>
        <button
          className="close-button"
          onClick={handleClose}
          disabled={saving}
        >
          <X size={24} />
        </button>

        <div className="modal-editar-facultad-header">
          <div className="modal-editar-facultad-header-content">
            <div className="modal-editar-facultad-icon-container">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="modal-editar-facultad-title">Editar Facultad</h2>
              <p className="modal-editar-facultad-subtitle">
                Modifica la información de la facultad
              </p>
            </div>
          </div>
        </div>

        <div className="modal-editar-facultad-content">
          {loading ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Cargando información de la facultad...</p>
            </div>
          ) : (
            <>
              {errors.general && (
                <div className="modal-editar-facultad-error-banner">
                  <AlertCircle size={20} />
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="modal-editar-facultad-form">
                <div className="modal-editar-facultad-section">
                  <h3 className="modal-editar-facultad-section-title">
                    <Building2 size={20} />
                    Información de la Facultad
                  </h3>

                  <div className="modal-editar-facultad-form-grid">
                    {/* Nombre de la Facultad */}
                    <div className="modal-editar-facultad-form-group">
                      <label className="modal-editar-facultad-form-label">
                        <Building2 size={16} />
                        <span>Nombre de la Facultad</span>
                      </label>
                      <div className="input-with-counter">
                        <input
                          type="text"
                          name="nombre_facultad"
                          value={formData.nombre_facultad}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="Ej: Facultad de Ingeniería"
                          className={`modal-editar-facultad-form-input ${
                            errors.nombre_facultad ? 'error' : 
                            touched.nombre_facultad && !errors.nombre_facultad && formData.nombre_facultad ? 'success' : ''
                          }`}
                          disabled={saving}
                        />
                        <span className="char-counter">
                          {formData.nombre_facultad.length}/100
                        </span>
                      </div>
                      {errors.nombre_facultad && (
                        <span className="modal-editar-facultad-form-error">
                          <AlertCircle size={16} />
                          {errors.nombre_facultad}
                        </span>
                      )}
                    </div>

                    {/* Código de la Facultad */}
                    <div className="modal-editar-facultad-form-group">
                      <label className="modal-editar-facultad-form-label">
                        <Hash size={16} />
                        <span>Código de la Facultad</span>
                      </label>
                      <div className="input-with-counter">
                        <input
                          type="text"
                          name="codigo_facultad"
                          value={formData.codigo_facultad}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="Ej: ING"
                          className={`modal-editar-facultad-form-input ${
                            errors.codigo_facultad ? 'error' : 
                            touched.codigo_facultad && !errors.codigo_facultad && formData.codigo_facultad ? 'success' : ''
                          }`}
                          disabled={saving}
                        />
                        <span className="char-counter">
                          {formData.codigo_facultad.length}/10
                        </span>
                      </div>
                      {errors.codigo_facultad && (
                        <span className="modal-editar-facultad-form-error">
                          <AlertCircle size={16} />
                          {errors.codigo_facultad}
                        </span>
                      )}
                    </div>

                    {/* Página Web */}
                    <div className="modal-editar-facultad-form-group full-width">
                      <label className="modal-editar-facultad-form-label">
                        <Globe size={16} />
                        <span>Página Web <span className="optional-text">(opcional)</span></span>
                      </label>
                      <input
                        type="url"
                        name="pagina_facultad"
                        value={formData.pagina_facultad}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="https://facultad.universidad.edu"
                        className={`modal-editar-facultad-form-input ${
                          errors.pagina_facultad ? 'error' : 
                          touched.pagina_facultad && !errors.pagina_facultad && formData.pagina_facultad ? 'success' : ''
                        }`}
                        disabled={saving}
                      />
                      {errors.pagina_facultad && (
                        <span className="modal-editar-facultad-form-error">
                          <AlertCircle size={16} />
                          {errors.pagina_facultad}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="modal-editar-facultad-footer">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving || Object.keys(errors).filter(key => key !== 'general').length > 0 || !hasChanges()}
            className="btn-primary"
          >
            {saving ? (
              <>
                <div className="spinner-small"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}