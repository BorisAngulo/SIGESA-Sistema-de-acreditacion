import React, { useState } from 'react';
import './DateProcessModal.css';

const DateProcessModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  carreraNombre, 
  modalidadNombre,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    fecha_ini_proceso: '',
    fecha_fin_proceso: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fecha_ini_proceso) {
      newErrors.fecha_ini_proceso = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fecha_fin_proceso) {
      newErrors.fecha_fin_proceso = 'La fecha de fin es requerida';
    }
    
    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (formData.fecha_ini_proceso && formData.fecha_fin_proceso) {
      const fechaInicio = new Date(formData.fecha_ini_proceso);
      const fechaFin = new Date(formData.fecha_fin_proceso);
      
      if (fechaFin <= fechaInicio) {
        newErrors.fecha_fin_proceso = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onConfirm(formData);
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fecha_ini_proceso: '',
        fecha_fin_proceso: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content date-process-modal">
        <div className="modal-header">
          <h2>Configurar Fechas del Proceso</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="process-info">
            <p><strong>Carrera:</strong> {carreraNombre}</p>
            <p><strong>Modalidad:</strong> {modalidadNombre}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="date-form">
            <div className="form-group">
              <label htmlFor="fecha_ini_proceso">
                Fecha de Inicio del Proceso *
              </label>
              <input
                type="date"
                id="fecha_ini_proceso"
                name="fecha_ini_proceso"
                value={formData.fecha_ini_proceso}
                onChange={handleInputChange}
                className={errors.fecha_ini_proceso ? 'error' : ''}
                disabled={loading}
              />
              {errors.fecha_ini_proceso && (
                <span className="field-error">{errors.fecha_ini_proceso}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fecha_fin_proceso">
                Fecha de Fin del Proceso *
              </label>
              <input
                type="date"
                id="fecha_fin_proceso"
                name="fecha_fin_proceso"
                value={formData.fecha_fin_proceso}
                onChange={handleInputChange}
                className={errors.fecha_fin_proceso ? 'error' : ''}
                disabled={loading}
              />
              {errors.fecha_fin_proceso && (
                <span className="field-error">{errors.fecha_fin_proceso}</span>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Carrera-Modalidad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DateProcessModal;
