import React, { useState } from 'react';
import './ModalAgregarFase.css';

const ModalAgregarFase = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} ${years === 1 ? 'año' : 'años'}${remainingMonths > 0 ? ` ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}` : ''}`;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la fase es requerido';
    }
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }
    
    if (formData.fechaInicio && formData.fechaFin) {
      const startDate = new Date(formData.fechaInicio);
      const endDate = new Date(formData.fechaFin);
      
      if (endDate <= startDate) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const duracion = calculateDuration(formData.fechaInicio, formData.fechaFin);
      
      const nuevaFase = {
        nombre: formData.nombre.trim(),
        fechaInicio: new Date(formData.fechaInicio).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        fechaFin: new Date(formData.fechaFin).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        duracion: duracion,
        descripcion: formData.descripcion.trim() || 'Descripción',
        progreso: 0,
        completada: false,
        expandida: false,
        actividades: []
      };
      
      onSave(nuevaFase);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      descripcion: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar Nueva Fase</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la Fase *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={errors.nombre ? 'error' : ''}
              placeholder="Ingrese el nombre de la fase"
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaInicio">Fecha de Inicio *</label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleInputChange}
                className={errors.fechaInicio ? 'error' : ''}
              />
              {errors.fechaInicio && <span className="error-message">{errors.fechaInicio}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="fechaFin">Fecha de Fin *</label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleInputChange}
                className={errors.fechaFin ? 'error' : ''}
              />
              {errors.fechaFin && <span className="error-message">{errors.fechaFin}</span>}
            </div>
          </div>
          
          {formData.fechaInicio && formData.fechaFin && !errors.fechaFin && (
            <div className="duration-display">
              <strong>Duración calculada: </strong>
              {calculateDuration(formData.fechaInicio, formData.fechaFin)}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Ingrese una descripción para la fase (opcional)"
              rows="3"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose}>
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSave}>
            Guardar Fase
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarFase;