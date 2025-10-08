import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import { updateFacultad, getFacultadById } from '../services/api';
import mascota from '../assets/mascota.png';
import '../styles/EditarFacultadScreen.css';
import useToast from '../hooks/useToast';

export default function EditarFacultadScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    nombre_facultad: '',
    codigo_facultad: '',
    pagina_facultad: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    const cargarFacultad = async () => {
      try {
        setLoading(true);
        const facultad = await getFacultadById(id);
        
        const data = {
          nombre_facultad: facultad.nombre_facultad || '',
          codigo_facultad: facultad.codigo_facultad || '',
          pagina_facultad: facultad.pagina_facultad || ''
        };
        
        setFormData(data);
        setInitialData(data);
        setLoadSuccess(true);
        
        setTimeout(() => {
          setLoadSuccess(false);
        }, 3000);
        
      } catch (error) {
        console.error('Error al cargar facultad:', error);
        setErrors({ general: error.message });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarFacultad();
    }
  }, [id]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nombre_facultad':
        if (!value.trim()) {
          newErrors.nombre_facultad = 'El nombre de la facultad es requerido';
        } else if (value.length > 50) {
          newErrors.nombre_facultad = 'El nombre no puede exceder 50 caracteres';
        } else {
          delete newErrors.nombre_facultad;
        }
        break;

      case 'codigo_facultad':
        if (!value.trim()) {
          newErrors.codigo_facultad = 'El código de la facultad es requerido';
        } else if (value.length > 10) {
          newErrors.codigo_facultad = 'El código no puede exceder 10 caracteres';
        } else {
          delete newErrors.codigo_facultad;
        }
        break;

      case 'pagina_facultad':
        if (value && value.trim()) {
          try {
            new URL(value);
            delete newErrors.pagina_facultad;
          } catch {
            newErrors.pagina_facultad = 'Ingrese una URL válida (ej: https://ejemplo.com)';
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
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      setErrors({ general: 'No se han detectado cambios' });
      return;
    }

    ['nombre_facultad', 'codigo_facultad', 'pagina_facultad'].forEach(field => {
      validateField(field, formData[field]);
    });

    if (Object.keys(errors).filter(key => key !== 'general').length > 0) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const dataToSend = {
        nombre_facultad: formData.nombre_facultad.trim(),
        codigo_facultad: formData.codigo_facultad.trim().toUpperCase(),
        pagina_facultad: formData.pagina_facultad.trim() || null,
      };

      await updateFacultad(id, dataToSend);
      
      setSaveSuccess(true);
      toast.success("Facultad actualizada exitosamente!");
      navigate(-1);

    } catch (error) {
      console.error('Error al actualizar facultad:', error);
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };


  if (loading) {
    return (
        <p>Cargando datos de la facultad...</p>
    );
  }

  return (
    <div className="editar-facultad-container">
      <div className="editar-facultad-header">
        <button 
          className="btn-volver"
          onClick={handleCancel}
          type="button"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        
        <div className="header-content">
          <img src={mascota} alt="Mascota" className="mascota-header" />
          <div className="header-text">
            <h1>Editar Facultad</h1>
            <p>Modifica la información de la facultad</p>
          </div>
        </div>
      </div>

      {loadSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>¡Datos de la facultad cargados correctamente!</span>
        </div>
      )}

      {saveSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>¡Facultad actualizada exitosamente!</span>
        </div>
      )}

      {errors.general && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="editar-facultad-card">
        <form onSubmit={handleSubmit} className="facultad-form">
          <div className="form-group">
            <label htmlFor="nombre_facultad" className="form-label">
              Nombre de la Facultad *
            </label>
            <input
              type="text"
              id="nombre_facultad"
              name="nombre_facultad"
              value={formData.nombre_facultad}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${errors.nombre_facultad ? 'error' : ''} ${touched.nombre_facultad && !errors.nombre_facultad ? 'success' : ''}`}
              placeholder="Ej: Facultad de Ingeniería"
              maxLength={50}
            />
            {errors.nombre_facultad && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.nombre_facultad}
              </span>
            )}
            <span className="char-counter">
              {formData.nombre_facultad.length}/50
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="codigo_facultad" className="form-label">
              Código de la Facultad *
            </label>
            <input
              type="text"
              id="codigo_facultad"
              name="codigo_facultad"
              value={formData.codigo_facultad}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${errors.codigo_facultad ? 'error' : ''} ${touched.codigo_facultad && !errors.codigo_facultad ? 'success' : ''}`}
              placeholder="Ej: ING"
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.codigo_facultad && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.codigo_facultad}
              </span>
            )}
            <span className="char-counter">
              {formData.codigo_facultad.length}/10
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="pagina_facultad" className="form-label">
              <Globe size={16} />
              Página Web (Opcional)
            </label>
            <input
              type="url"
              id="pagina_facultad"
              name="pagina_facultad"
              value={formData.pagina_facultad}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${errors.pagina_facultad ? 'error' : ''} ${touched.pagina_facultad && !errors.pagina_facultad && formData.pagina_facultad ? 'success' : ''}`}
              placeholder="https://facultad.universidad.edu"
            />
            {errors.pagina_facultad && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.pagina_facultad}
              </span>
            )}
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancelar"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={20} />
              <span>Cancelar</span>
            </button>

            <button
              type="submit"
              className="btn-guardar"
              disabled={saving || Object.keys(errors).filter(key => key !== 'general').length > 0 || !hasChanges()}
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
        </form>
      </div>
    </div>
  );
}