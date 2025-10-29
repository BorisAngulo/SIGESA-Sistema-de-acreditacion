import React, { useState, useEffect } from 'react';
import { X, FileText, Link, Plus, Save, Calendar, CheckSquare } from 'lucide-react';
import { createSubfase, updateSubfase } from '../services/api';
import '../styles/ModalAgregarSubfase.css';
import useToast from '../hooks/useToast';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const ModalAgregarSubfase = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  faseId, 
  faseNombre, 
  carreraId, 
  modalidadId, 
  facultadId, 
  carreraNombre, 
  facultadNombre, 
  modalidad,
  subfaseToEdit = null 
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [urlDrive, setUrlDrive] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [habilitarFoda, setHabilitarFoda] = useState(false);
  const [habilitarPlame, setHabilitarPlame] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();

  const isEditing = !!subfaseToEdit;

  // Hook para controlar el scroll del body
  useBodyScrollLock(isOpen);

  // Efecto para cargar datos de subfase si estamos editando
  useEffect(() => {
    if (isOpen && subfaseToEdit) {
      // Formatear fechas para inputs de tipo date (solo YYYY-MM-DD)
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setTitulo(subfaseToEdit.nombre || subfaseToEdit.nombre_subfase || '');
      setDescripcion(subfaseToEdit.descripcion || subfaseToEdit.descripcion_subfase || '');
      setFechaInicio(formatDate(subfaseToEdit.fechaInicio || subfaseToEdit.fecha_inicio_subfase));
      setFechaFin(formatDate(subfaseToEdit.fechaFin || subfaseToEdit.fecha_fin_subfase));
      setUrlDrive(subfaseToEdit.urlDrive || subfaseToEdit.url_subfase || '');
      setHabilitarFoda(Boolean(subfaseToEdit.tiene_foda));
      setHabilitarPlame(Boolean(subfaseToEdit.tiene_plame));
    } else if (isOpen) {
      // Limpiar formulario para nueva subfase
      setTitulo('');
      setDescripcion('');
      setFechaInicio('');
      setFechaFin('');
      setUrlDrive('');
      setHabilitarFoda(false);
      setHabilitarPlame(false);
      setErrors({});
    }
  }, [isOpen, subfaseToEdit]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    
    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    if (!fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }
    
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (!faseId) {
      newErrors.general = 'No se pudo identificar la fase asociada';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const subfaseData = {
        nombre_subfase: titulo,
        descripcion_subfase: descripcion,
        fecha_inicio_subfase: fechaInicio,
        fecha_fin_subfase: fechaFin,
        url_subfase: urlDrive || null,
        fase_id: faseId,
        tiene_foda: habilitarFoda,
        tiene_plame: habilitarPlame
      };

      let result;
      if (isEditing && subfaseToEdit?.id) {
        result = await updateSubfase(subfaseToEdit.id, subfaseData);
      } else {
        result = await createSubfase(subfaseData);
      }

      if (result.success) {
        handleSuccessWithAnimation(result);
      } else {
        console.error('❌ Detalles del error:', result.details);
        throw new Error(result.error || 'Error al procesar la subfase');
      }
      
    } catch (error) {
      console.error('❌ Error al procesar subfase:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la subfase: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, 300); // Duración de la animación
    }
  };

  // Función para manejar el éxito con animación
  const handleSuccessWithAnimation = (result) => {
    toast.success(isEditing ? 'Subfase actualizada exitosamente' : 'Subfase creada exitosamente');
    
    // Notificar al componente padre que hubo cambios
    if (onSuccess) {
      onSuccess(result.data || result);
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
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-subfase-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-subfase-container ${isClosing ? 'closing' : ''}`}>
        <div className="modal-subfase-header">
          <div className="modal-subfase-header-content">
            <div className="modal-subfase-icon-container">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="modal-subfase-title">
                {isEditing ? 'Editar Subfase' : 'Agregar Nueva Subfase'}
              </h2>
              <p className="modal-subfase-subtitle">
                Fase: {faseNombre} | {isEditing ? 'Modifica la información de la subfase' : 'Completa la información de la subfase del proyecto'}
              </p>
            </div>
          </div>
          <button 
            className="modal-subfase-close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-subfase-content">
          {errors.general && (
            <div className="modal-subfase-error-banner">
              <p>{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Información General */}
            <div className="modal-subfase-section">
              <h3 className="modal-subfase-section-title">
                <FileText size={20} />
                Información General
              </h3>
              
              <div className="modal-subfase-form-grid">
                <div className="modal-subfase-form-group">
                  <label className="modal-subfase-form-label">
                    Título de la Subfase *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ingresa el título de la subfase"
                    className={`modal-subfase-form-input ${errors.titulo ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.titulo && (
                    <span className="modal-subfase-error-text">{errors.titulo}</span>
                  )}
                </div>

                <div className="modal-subfase-form-group full-width">
                  <label className="modal-subfase-form-label">
                    Descripción *
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe el propósito y objetivos de esta subfase"
                    className={`modal-subfase-form-textarea ${errors.descripcion ? 'error' : ''}`}
                    rows={4}
                    disabled={isSubmitting}
                  />
                  {errors.descripcion && (
                    <span className="modal-subfase-error-text">{errors.descripcion}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="modal-subfase-section">
              <h3 className="modal-subfase-section-title">
                <Calendar size={20} />
                Cronograma
              </h3>
              
              <div className="modal-subfase-form-grid">
                <div className="modal-subfase-form-group">
                  <label className="modal-subfase-form-label">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className={`modal-subfase-form-input ${errors.fechaInicio ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.fechaInicio && (
                    <span className="modal-subfase-error-text">{errors.fechaInicio}</span>
                  )}
                </div>

                <div className="modal-subfase-form-group">
                  <label className="modal-subfase-form-label">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className={`modal-subfase-form-input ${errors.fechaFin ? 'error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.fechaFin && (
                    <span className="modal-subfase-error-text">{errors.fechaFin}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recursos */}
            <div className="modal-subfase-section">
              <h3 className="modal-subfase-section-title">
                <Link size={20} />
                Recursos
              </h3>
              
              <div className="modal-subfase-form-group">
                <label className="modal-subfase-form-label">
                  URL de Google Drive
                </label>
                <input
                  type="url"
                  value={urlDrive}
                  onChange={(e) => setUrlDrive(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="modal-subfase-form-input"
                  disabled={isSubmitting}
                />
                <p className="modal-subfase-helper-text">
                  Asegúrate de que la carpeta tenga permisos de visualización
                </p>
              </div>
            </div>

            {/* Herramientas de Análisis */}
            <div className="modal-subfase-section">
              <h3 className="modal-subfase-section-title">
                <CheckSquare size={20} />
                Herramientas de Análisis
              </h3>
              
              <div className="modal-subfase-form-grid">
                <div className="modal-subfase-checkbox-group">
                  <label className="modal-subfase-checkbox-label">
                    <input
                      type="checkbox"
                      checked={habilitarFoda}
                      onChange={(e) => setHabilitarFoda(e.target.checked)}
                      className="modal-subfase-checkbox"
                      disabled={isSubmitting}
                    />
                    <span className="modal-subfase-checkbox-text">
                      Habilitar Análisis FODA
                    </span>
                  </label>
                  <p className="modal-subfase-helper-text">
                    Permite realizar análisis de Fortalezas, Oportunidades, Debilidades y Amenazas
                  </p>
                </div>

                <div className="modal-subfase-checkbox-group">
                  <label className="modal-subfase-checkbox-label">
                    <input
                      type="checkbox"
                      checked={habilitarPlame}
                      onChange={(e) => setHabilitarPlame(e.target.checked)}
                      className="modal-subfase-checkbox"
                      disabled={isSubmitting}
                    />
                    <span className="modal-subfase-checkbox-text">
                      Habilitar Matriz PLAME
                    </span>
                  </label>
                  <p className="modal-subfase-helper-text">
                    Permite crear matriz de Planificación, Logro, Aplicación, Mejora y Evaluación
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-subfase-footer">
          <button
            type="button"
            className="modal-subfase-btn modal-subfase-btn-secondary"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="modal-subfase-btn modal-subfase-btn-primary"
          >
            {isSubmitting ? (
              <>
                <div className="modal-subfase-spinner"></div>
                <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
              </>
            ) : (
              <>
                {isEditing ? (
                  <>
                    <Save size={16} />
                    <span>Actualizar Subfase</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Crear Subfase</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarSubfase;