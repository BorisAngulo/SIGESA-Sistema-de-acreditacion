import React, { useState } from 'react';
import './FinalizarAcreditacionModal.css';

const FinalizarAcreditacionModal = ({ show, onClose, onConfirm, carreraModalidadData, loading = false }) => {
  const [formData, setFormData] = useState({
    fecha_ini_aprobacion: '',
    fecha_fin_aprobacion: '',
    certificado: null
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          certificado: 'Solo se permiten archivos PNG, JPEG, JPG o PDF'
        }));
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          certificado: 'El archivo no puede ser mayor a 10MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        certificado: file
      }));
      
      // Limpiar error si había
      if (errors.certificado) {
        setErrors(prev => ({
          ...prev,
          certificado: null
        }));
      }
    }
  };

  const validateForm = () => {
    console.log('🔍 Validando formulario...');
    console.log('📋 Datos del formulario:', formData);
    
    const newErrors = {};
    
    if (!formData.fecha_ini_aprobacion) {
      newErrors.fecha_ini_aprobacion = 'La fecha de inicio de aprobación es requerida';
    }
    
    if (!formData.fecha_fin_aprobacion) {
      newErrors.fecha_fin_aprobacion = 'La fecha de fin de aprobación es requerida';
    }
    
    if (!formData.certificado) {
      newErrors.certificado = 'El certificado es requerido';
    }
    
    // Validar que fecha fin sea mayor a fecha inicio
    if (formData.fecha_ini_aprobacion && formData.fecha_fin_aprobacion) {
      const fechaInicio = new Date(formData.fecha_ini_aprobacion);
      const fechaFin = new Date(formData.fecha_fin_aprobacion);
      
      if (fechaFin <= fechaInicio) {
        newErrors.fecha_fin_aprobacion = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    console.log('❌ Errores encontrados:', newErrors);
    console.log('✅ ¿Formulario válido?:', Object.keys(newErrors).length === 0);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando handleSubmit del modal');
    console.log('📋 Estado del formulario:', formData);
    
    if (validateForm()) {
      const formDataToSend = new FormData();
      formDataToSend.append('_method', 'PUT'); // Simular método PUT
      formDataToSend.append('fecha_ini_aprobacion', formData.fecha_ini_aprobacion);
      formDataToSend.append('fecha_fin_aprobacion', formData.fecha_fin_aprobacion);
      
      // Solo agregar certificado si existe
      if (formData.certificado) {
        console.log('📎 Agregando certificado:', formData.certificado.name);
        formDataToSend.append('certificado', formData.certificado);
      } else {
        console.log('📎 No hay certificado para enviar');
      }
      
      console.log('📦 FormData creado, enviando...');
      console.log('📋 Contenido del FormData:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  - ${key}:`, value);
      }
      
      onConfirm(formDataToSend);
    } else {
      console.log('❌ Formulario no válido');
    }
  };

  const handleClose = () => {
    setFormData({
      fecha_ini_aprobacion: '',
      fecha_fin_aprobacion: '',
      certificado: null
    });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content finalizar-acreditacion-modal">
        <div className="modal-header">
          <h3>Finalizar Acreditación</h3>
          <button className="close-button" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="carrera-info">
            <h4>📋 Información de la Acreditación</h4>
            <p><strong>Carrera:</strong> {carreraModalidadData?.carreraNombre || 'N/A'}</p>
            <p><strong>Modalidad:</strong> {carreraModalidadData?.modalidadNombre || 'N/A'}</p>
            <p><strong>Facultad:</strong> {carreraModalidadData?.facultadNombre || 'N/A'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="finalizar-form">
            <div className="form-group">
              <label htmlFor="fecha_ini_aprobacion">
                📅 Fecha Inicio de Aprobación *
              </label>
              <input
                type="date"
                id="fecha_ini_aprobacion"
                name="fecha_ini_aprobacion"
                value={formData.fecha_ini_aprobacion}
                onChange={handleInputChange}
                disabled={loading}
                className={errors.fecha_ini_aprobacion ? 'error' : ''}
              />
              {errors.fecha_ini_aprobacion && (
                <span className="error-message">{errors.fecha_ini_aprobacion}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fecha_fin_aprobacion">
                📅 Fecha Fin de Aprobación *
              </label>
              <input
                type="date"
                id="fecha_fin_aprobacion"
                name="fecha_fin_aprobacion"
                value={formData.fecha_fin_aprobacion}
                onChange={handleInputChange}
                disabled={loading}
                className={errors.fecha_fin_aprobacion ? 'error' : ''}
              />
              {errors.fecha_fin_aprobacion && (
                <span className="error-message">{errors.fecha_fin_aprobacion}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="certificado">
                📄 Certificado de Acreditación *
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="certificado"
                  name="certificado"
                  onChange={handleFileChange}
                  accept=".png,.jpeg,.jpg,.pdf"
                  disabled={loading}
                  className={errors.certificado ? 'error' : ''}
                />
                <div className="file-info">
                  <small>Formatos permitidos: PNG, JPEG, JPG, PDF (máx. 10MB)</small>
                  {formData.certificado && (
                    <div className="selected-file">
                      ✅ Archivo seleccionado: {formData.certificado.name}
                    </div>
                  )}
                </div>
              </div>
              {errors.certificado && (
                <span className="error-message">{errors.certificado}</span>
              )}
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
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
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Finalizando...
              </>
            ) : (
              '✅ Finalizar Acreditación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalizarAcreditacionModal;
