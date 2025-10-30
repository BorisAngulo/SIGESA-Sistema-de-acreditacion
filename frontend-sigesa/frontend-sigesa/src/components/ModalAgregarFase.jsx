import React, { useState, useEffect } from 'react';
import { FileText, Edit, Calendar, Save } from 'lucide-react';
import '../styles/ModalAgregarFase.css';

const ModalAgregarFase = ({ isOpen, onClose, onSave, fase = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [diasCalculados, setDiasCalculados] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (fase) {
        setFormData({
          nombre: fase.nombre || '',
          descripcion: fase.descripcion || '',
          fechaInicio: fase.fechaInicio || '',
          fechaFin: fase.fechaFin || ''
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: '',
          fechaInicio: '',
          fechaFin: ''
        });
      }
      setErrors({});
      setDiasCalculados(0);
    }
  }, [isOpen, fase]);

  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFin = new Date(formData.fechaFin);
      
      if (fechaFin > fechaInicio) {
        const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
        const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
        setDiasCalculados(diferenciaDias);
      } else {
        setDiasCalculados(0);
      }
    } else {
      setDiasCalculados(0);
    }
  }, [formData.fechaInicio, formData.fechaFin]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Ingresa un nombre para la fase';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'Selecciona la fecha de inicio';
    }

    if (!formData.fechaFin) {
      newErrors.fechaFin = 'Selecciona la fecha de finalización';
    }

    if (formData.fechaInicio && formData.fechaFin) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFin = new Date(formData.fechaFin);
      
      if (fechaFin <= fechaInicio) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior al inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        duracionDias: diasCalculados
      });
      
      onClose();
    } catch (error) {
      console.error('Error al guardar fase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setFormData({
        nombre: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: ''
      });
      setErrors({});
      setDiasCalculados(0);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content modal-content-agregarFase" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <FileText size={24} />
          </div>
          <div className="modal-header-text">
            <h2>{fase ? 'Editar Fase' : 'Agregar Nueva Fase'}</h2>
            <p>Completa la información de la fase del proyecto</p>
          </div>
        </div>

        <div className="modal-form">
          <div>
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                <Edit className="label-icon" size={20} />
                Nombre de la Fase <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Fase 1: Planificación Inicial"
                disabled={isLoading}
                className={`form-input ${errors.nombre ? 'form-input-error' : ''}`}
                maxLength={300}
              />
              {errors.nombre && (
                <p className="error-message">{errors.nombre}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">
                <FileText className="label-icon" size={20} />
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe los objetivos y actividades principales de esta fase..."
                rows="4"
                disabled={isLoading}
                className="form-input form-textarea"
                maxLength={1000}
              />
              <div className="character-count">
                {formData.descripcion.length}/1000 caracteres
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fechaInicio" className="form-label">
                  <Calendar className="label-icon" size={20} />
                  Fecha de Inicio <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`form-input ${errors.fechaInicio ? 'form-input-error' : ''}`}
                />
                {errors.fechaInicio && (
                  <p className="error-message">{errors.fechaInicio}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fechaFin" className="form-label">
                  <Calendar className="label-icon" size={20} />
                  Fecha de Fin <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="fechaFin"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`form-input ${errors.fechaFin ? 'form-input-error' : ''}`}
                  min={formData.fechaInicio}
                />
                {errors.fechaFin && (
                  <p className="error-message">{errors.fechaFin}</p>
                )}
              </div>
            </div>

            {diasCalculados > 0 && (
              <div className="duration-info">
                <div className="duration-badge">
                  <Calendar size={16} />
                  <span>
                    Duración: {diasCalculados} {diasCalculados === 1 ? 'día' : 'días'}
                    {diasCalculados > 30 && (
                      <span className="duration-extra">
                        ({Math.ceil(diasCalculados / 30)} {Math.ceil(diasCalculados / 30) === 1 ? 'mes' : 'meses'} aprox.)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={`btn-primary ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {fase ? 'Actualizar Fase' : 'Crear Fase'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarFase;