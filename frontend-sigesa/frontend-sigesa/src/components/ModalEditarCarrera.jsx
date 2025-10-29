import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle , Globe, GraduationCap, Edit3 } from 'lucide-react';
import { updateCarrera, getCarreraById, getFacultades } from '../services/api';
import ModalConfirmacion from './ModalConfirmacion';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import '../styles/ModalEditarCarrera.css';

export default function ModalEditarCarrera({ 
  isOpen, 
  onClose, 
  carreraId, 
  onCarreraEditada = () => {} 
}) {
  const [formData, setFormData] = useState({
    nombre_carrera: '',
    codigo_carrera: '',
    pagina_carrera: '',
    id_facultad: ''
  });

  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [initialData, setInitialData] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [loadingFacultades, setLoadingFacultades] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && carreraId) {
      cargarDatos();
    }
  }, [isOpen, carreraId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setLoadingFacultades(true);
      setErrorCarga(null);
      setErrors({});
      
      const [facultadesData, carreraData] = await Promise.all([
        getFacultades(),
        getCarreraById(carreraId)
      ]);
      
      setFacultades(facultadesData);
      
      const data = {
        nombre_carrera: carreraData.nombre_carrera || '',
        codigo_carrera: carreraData.codigo_carrera || '',
        pagina_carrera: carreraData.pagina_carrera || '',
        id_facultad: carreraData.facultad_id?.toString() || ''
      };
      
      setFormData(data);
      setInitialData(data);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorCarga('Error al cargar los datos de la carrera');
    } finally {
      setLoading(false);
      setLoadingFacultades(false);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nombre_carrera':
        if (!value.trim()) {
          newErrors.nombre_carrera = 'El nombre de la carrera es requerido';
        } else if (value.length > 50) {
          newErrors.nombre_carrera = 'El nombre no puede exceder 50 caracteres';
        } else {
          delete newErrors.nombre_carrera;
        }
        break;

      case 'codigo_carrera':
        if (!value.trim()) {
          newErrors.codigo_carrera = 'El código de la carrera es requerido';
        } else if (value.length > 10) {
          newErrors.codigo_carrera = 'El código no puede exceder 10 caracteres';
        } else {
          delete newErrors.codigo_carrera;
        }
        break;

      case 'pagina_carrera':
        if (value && value.trim()) {
          try {
            new URL(value);
            delete newErrors.pagina_carrera;
          } catch {
            newErrors.pagina_carrera = 'Ingrese una URL válida (ej: https://ejemplo.com)';
          }
        } else {
          delete newErrors.pagina_carrera;
        }
        break;

      case 'id_facultad':
        if (!value) {
          newErrors.id_facultad = 'Debe seleccionar una facultad';
        } else {
          delete newErrors.id_facultad;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores al empezar a escribir
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    setTimeout(() => {
      if (touched[name]) {
        validateField(name, value);
      }
    }, 500);
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

  const handleClose = () => {
    if (hasChanges()) {
      if (window.confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      // Reset form
      setFormData({
        nombre_carrera: '',
        codigo_carrera: '',
        pagina_carrera: '',
        id_facultad: ''
      });
      setErrors({});
      setTouched({});
      setInitialData({});
      setShowConfirmModal(false);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      setErrors({ general: 'No se han detectado cambios' });
      return;
    }

    // Validar todos los campos
    const fieldsToValidate = ['nombre_carrera', 'codigo_carrera', 'pagina_carrera', 'id_facultad'];
    fieldsToValidate.forEach(field => {
      validateField(field, formData[field]);
    });

    const hasFieldErrors = Object.keys(errors).filter(key => key !== 'general').length > 0;
    if (hasFieldErrors) {
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmEdicion = async () => {
    try {
      setSaving(true);
      setErrors({});

      const dataToSend = {
        nombre_carrera: formData.nombre_carrera.trim(),
        codigo_carrera: formData.codigo_carrera.trim().toUpperCase(),
        pagina_carrera: formData.pagina_carrera.trim() || null,
        id_facultad: parseInt(formData.id_facultad)
      };

      const result = await updateCarrera(carreraId, dataToSend);
      
      setShowConfirmModal(false);
      onCarreraEditada(result);
      closeModal();

    } catch (error) {
      console.error('Error al actualizar carrera:', error);
      setErrors({ general: error.message || 'Error al actualizar la carrera' });
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-editar-carrera-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="modal-editar-carrera-container">
        {/* Header */}
        <div className="modal-editar-carrera-header">
          <div className="modal-editar-carrera-header-content">
            <div className="modal-editar-carrera-icon-container">
              <Edit3 size={24} />
            </div>
            <div>
              <h2 className="modal-editar-carrera-title">Editar Carrera</h2>
              <p className="modal-editar-carrera-subtitle">Modifica la información de la carrera</p>
            </div>
          </div>
          
          <button
            className="close-button"
            onClick={handleClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-editar-carrera-content">
          {loading ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Cargando datos de la carrera...</p>
            </div>
          ) : errorCarga ? (
            <div className="error-section">
              <AlertCircle size={48} />
              <h3>Error al cargar datos</h3>
              <p>{errorCarga}</p>
            </div>
          ) : (
            <>
              {errors.general && (
                <div className="modal-editar-carrera-alert error">
                  <AlertCircle size={20} />
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="modal-editar-carrera-form">
                <div className="modal-editar-carrera-section">
                  <h3 className="modal-editar-carrera-section-title">
                    <GraduationCap size={20} />
                    Información de la Carrera
                  </h3>

                  <div className="modal-editar-carrera-form-grid">
                    <div className="modal-editar-carrera-form-group">
                      <label htmlFor="nombre_carrera" className="modal-editar-carrera-form-label">
                        Nombre de la Carrera *
                      </label>
                      <div className="input-with-counter">
                        <input
                          type="text"
                          id="nombre_carrera"
                          name="nombre_carrera"
                          value={formData.nombre_carrera}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`modal-editar-carrera-form-input ${errors.nombre_carrera ? 'error' : ''}`}
                          placeholder="Ej: Ingeniería de Sistemas"
                          maxLength={50}
                          disabled={saving}
                        />
                        <span className="char-counter">
                          {formData.nombre_carrera.length}/50
                        </span>
                      </div>
                      {errors.nombre_carrera && (
                        <div className="modal-editar-carrera-form-error">
                          <AlertCircle size={16} />
                          {errors.nombre_carrera}
                        </div>
                      )}
                    </div>

                    <div className="modal-editar-carrera-form-group">
                      <label htmlFor="codigo_carrera" className="modal-editar-carrera-form-label">
                        Código de la Carrera *
                      </label>
                      <div className="input-with-counter">
                        <input
                          type="text"
                          id="codigo_carrera"
                          name="codigo_carrera"
                          value={formData.codigo_carrera}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`modal-editar-carrera-form-input ${errors.codigo_carrera ? 'error' : ''}`}
                          placeholder="Ej: INGSIS"
                          maxLength={10}
                          style={{ textTransform: 'uppercase' }}
                          disabled={saving}
                        />
                        <span className="char-counter">
                          {formData.codigo_carrera.length}/10
                        </span>
                      </div>
                      {errors.codigo_carrera && (
                        <div className="modal-editar-carrera-form-error">
                          <AlertCircle size={16} />
                          {errors.codigo_carrera}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-editar-carrera-form-group">
                    <label htmlFor="id_facultad" className="modal-editar-carrera-form-label">
                      <GraduationCap size={16} />
                      Facultad *
                    </label>
                    <select
                      id="id_facultad"
                      name="id_facultad"
                      value={formData.id_facultad}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`modal-editar-carrera-form-input ${errors.id_facultad ? 'error' : ''}`}
                      disabled={saving || loadingFacultades}
                    >
                      <option value="">
                        {loadingFacultades ? 'Cargando facultades...' : 'Seleccione una facultad'}
                      </option>
                      {facultades.map(facultad => (
                        <option key={facultad.id} value={facultad.id}>
                          {facultad.nombre_facultad}
                        </option>
                      ))}
                    </select>
                    {errors.id_facultad && (
                      <div className="modal-editar-carrera-form-error">
                        <AlertCircle size={16} />
                        {errors.id_facultad}
                      </div>
                    )}
                  </div>

                  <div className="modal-editar-carrera-form-group">
                    <label htmlFor="pagina_carrera" className="modal-editar-carrera-form-label">
                      <Globe size={16} />
                      Página Web <span className="optional-text">(Opcional)</span>
                    </label>
                    <input
                      type="url"
                      id="pagina_carrera"
                      name="pagina_carrera"
                      value={formData.pagina_carrera}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`modal-editar-carrera-form-input ${errors.pagina_carrera ? 'error' : ''}`}
                      placeholder="https://carrera.universidad.edu"
                      disabled={saving}
                    />
                    {errors.pagina_carrera && (
                      <div className="modal-editar-carrera-form-error">
                        <AlertCircle size={16} />
                        {errors.pagina_carrera}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !errorCarga && (
          <div className="modal-editar-carrera-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={saving}
            >
              <X size={20} />
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={
                saving || 
                Object.keys(errors).filter(key => key !== 'general').length > 0 || 
                !hasChanges() ||
                loadingFacultades
              }
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
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <ModalConfirmacion
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmEdicion}
          titulo="¿Confirmar edición de carrera?"
          mensaje="¿Estás seguro de que deseas guardar los cambios realizados en esta carrera?"
          loading={saving}
        />
      )}
    </div>
  );
}