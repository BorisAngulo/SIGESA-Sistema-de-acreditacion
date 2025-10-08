import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Link, Plus, Save } from 'lucide-react';
import { createSubfase, updateSubfase } from '../services/api';
import '../styles/SubFaseScreen.css';
import useToast from '../hooks/useToast';

const SubFaseScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [urlDrive, setUrlDrive] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [subfaseId, setSubfaseId] = useState(null);
  const [faseData, setFaseData] = useState(null);
  const toast = useToast();
  
  // Estados para habilitar FODA y PLAME
  const [habilitarFoda, setHabilitarFoda] = useState(false);
  const [habilitarPlame, setHabilitarPlame] = useState(false);


  useEffect(() => {
    if (location.state) {
      const { 
        subfase, 
        faseId, 
        faseNombre, 
        carreraId, 
        modalidadId, 
        facultadId, 
        carreraNombre, 
        facultadNombre, 
        modalidad 
      } = location.state;

      setFaseData({
        faseId,
        faseNombre,
        carreraId,
        modalidadId,
        facultadId,
        carreraNombre,
        facultadNombre,
        modalidad
      });

      if (subfase) {
        setIsEditing(true);
        setSubfaseId(subfase.id);
        
        // Usar los nombres de campos correctos según la respuesta del backend
        setTitulo(subfase.nombre || subfase.nombre_subfase || '');
        setDescripcion(subfase.descripcion || subfase.descripcion_subfase || '');
        
        // Formatear fechas para inputs de tipo date (solo YYYY-MM-DD)
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFechaInicio(formatDate(subfase.fechaInicio || subfase.fecha_inicio_subfase));
        setFechaFin(formatDate(subfase.fechaFin || subfase.fecha_fin_subfase));
        setUrlDrive(subfase.urlDrive || subfase.url_subfase || '');
        
        // Cargar configuraciones de FODA y PLAME si existen
        setHabilitarFoda(Boolean(subfase.tiene_foda));
        setHabilitarPlame(Boolean(subfase.tiene_plame));
        
        console.log('📝 Modo edición activado para subfase:', subfase);
        console.log('📅 Fechas cargadas:', {
          inicio: formatDate(subfase.fechaInicio || subfase.fecha_inicio_subfase),
          fin: formatDate(subfase.fechaFin || subfase.fecha_fin_subfase)
        });
        console.log('📋 Datos cargados:', {
          titulo: subfase.nombre || subfase.nombre_subfase,
          descripcion: subfase.descripcion || subfase.descripcion_subfase,
          urlDrive: subfase.urlDrive || subfase.url_subfase,
          foda: subfase.tiene_foda,
          plame: subfase.tiene_plame
        });
      } else {
        console.log('➕ Modo creación activado');
      }
    }
  }, [location.state]);  const validateForm = () => {
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

    if (!faseData?.faseId) {
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
        fase_id: faseData.faseId,
        tiene_foda: habilitarFoda,
        tiene_plame: habilitarPlame
      };

      console.log('📤 Enviando datos de subfase:', subfaseData);

      let result;
      if (isEditing && subfaseId) {
        result = await updateSubfase(subfaseId, subfaseData);
        console.log('✅ Subfase actualizada:', result);
      } else {
        result = await createSubfase(subfaseData);
        console.log('✅ Subfase creada:', result);
      }

      if (result.success) {
        toast.success(isEditing ? 'Subfase actualizada exitosamente' : 'Subfase creada exitosamente');
       navigate(-1);
      } else {
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
    if (faseData) {
      navigate('/fases', {
        state: faseData
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="subfase-main-container">
      <div className="subfase-content-wrapper">
        <div className="subfase-header-card">
          <div className="subfase-header-content">
            <div className="subfase-header-info">
              <div className="subfase-icon-container">
                <FileText className="subfase-icon" />
              </div>
              <div>
                <h1 className="subfase-title">
                  {isEditing ? 'Editar Subfase' : 'Agregar Nueva Subfase'}
                </h1>
                <p className="subfase-subtitle">
                  {faseData?.faseNombre && (
                    <span className="subfase-fase-info">
                      Fase: {faseData.faseNombre} | 
                    </span>
                  )}
                  {isEditing ? 'Modifica la información de la subfase' : 'Completa la información de la subfase del proyecto'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="subfase-error-banner">
            <p>{errors.general}</p>
          </div>
        )}

        <div className="subfase-form-sections">
          <div className="subfase-form-section">
            <h2 className="subfase-section-title">
              <div className="subfase-section-icon-wrapper subfase-section-icon-blue">
                <FileText className="subfase-section-icon subfase-icon-blue" />
              </div>
              Información Básica
            </h2>
            
            <div className="subfase-grid-cols-1 subfase-grid-lg-2">
              <div className="subfase-col-span-2">
                <label className="subfase-form-label">
                  Título de la Subfase <span className="subfase-required">*</span>
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Inauguración, información, concientización"
                  className={`subfase-form-input ${errors.titulo ? 'error' : ''}`}
                />
                {errors.titulo && (
                  <p className="subfase-error-message">{errors.titulo}</p>
                )}
              </div>

              <div>
                <label className="subfase-form-label">
                  Fecha de Inicio <span className="subfase-required">*</span>
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className={`subfase-form-input ${errors.fechaInicio ? 'error' : ''}`}
                />
                {errors.fechaInicio && (
                  <p className="subfase-error-message">{errors.fechaInicio}</p>
                )}
              </div>

              <div>
                <label className="subfase-form-label">
                  Fecha de Fin <span className="subfase-required">*</span>
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className={`subfase-form-input ${errors.fechaFin ? 'error' : ''}`}
                />
                {errors.fechaFin && (
                  <p className="subfase-error-message">{errors.fechaFin}</p>
                )}
              </div>

              <div className="subfase-col-span-2">
                <label className="subfase-form-label">
                  Descripción <span className="subfase-required">*</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe los objetivos y actividades principales de esta subfase..."
                  rows="4"
                  className={`subfase-form-textarea ${errors.descripcion ? 'error' : ''}`}
                />
                <div className="subfase-char-counter">
                  {errors.descripcion && (
                    <p className="subfase-error-message">{errors.descripcion}</p>
                  )}
                  <p className="subfase-char-count">
                    {descripcion.length}/500 caracteres
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="subfase-form-section">
            <h2 className="subfase-section-title">
              <div className="subfase-section-icon-wrapper subfase-section-icon-purple">
                <FileText className="subfase-section-icon subfase-icon-purple" />
              </div>
              Herramientas de Análisis (Opcional)
            </h2>
            
            <div className="subfase-analysis-options">
              <div className="subfase-checkbox-group">
                <label className="subfase-checkbox-item">
                  <input
                    type="checkbox"
                    checked={habilitarFoda}
                    onChange={(e) => setHabilitarFoda(e.target.checked)}
                    className="subfase-checkbox"
                  />
                  <div className="subfase-checkbox-content">
                    <div className="subfase-checkbox-icon-container subfase-checkbox-icon-green">
                      <FileText className="subfase-checkbox-icon" />
                    </div>
                    <div className="subfase-checkbox-text">
                      <h3 className="subfase-checkbox-title">Análisis FODA</h3>
                      <p className="subfase-checkbox-description">
                        Habilitar matriz de Fortalezas, Oportunidades, Debilidades y Amenazas
                      </p>
                    </div>
                  </div>
                </label>

                <label className="subfase-checkbox-item">
                  <input
                    type="checkbox"
                    checked={habilitarPlame}
                    onChange={(e) => setHabilitarPlame(e.target.checked)}
                    className="subfase-checkbox"
                  />
                  <div className="subfase-checkbox-content">
                    <div className="subfase-checkbox-icon-container subfase-checkbox-icon-blue">
                      <FileText className="subfase-checkbox-icon" />
                    </div>
                    <div className="subfase-checkbox-text">
                      <h3 className="subfase-checkbox-title">Matriz PLAME</h3>
                      <p className="subfase-checkbox-description">
                        Habilitar matriz de Planificación, Análisis y Mejora Educativa
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {(habilitarFoda || habilitarPlame) && (
                <div className="subfase-analysis-info">
                  <p className="subfase-info-text">
                    ℹ️ Las herramientas seleccionadas estarán disponibles después de crear la subfase
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="subfase-form-section">
            <h2 className="subfase-section-title">
              <div className="subfase-section-icon-wrapper subfase-section-icon-green">
                <Link className="subfase-section-icon subfase-icon-green" />
              </div>
              Documentos
            </h2>
            
            <div>
              <label className="subfase-form-label">
                URL de Google Drive
              </label>
              <input
                type="url"
                value={urlDrive}
                onChange={(e) => setUrlDrive(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="subfase-form-input"
              />
              <p className="subfase-helper-text">
                Asegúrate de que la carpeta tenga permisos de visualización
              </p>
            </div>
          </div>

          <div className="subfase-actions">
            <button
              type="button"
              className="subfase-btn subfase-btn-secondary"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="subfase-btn subfase-btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="subfase-spinner"></div>
                  <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                </>
              ) : (
                <>
                  {isEditing ? (
                    <>
                      <Save className="subfase-btn-icon" />
                      <span>Actualizar Subfase</span>
                    </>
                  ) : (
                    <>
                      <Plus className="subfase-btn-icon" />
                      <span>Crear Subfase</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubFaseScreen;