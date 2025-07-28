import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, AlertCircle, CheckCircle, Globe, GraduationCap } from 'lucide-react';
import { updateCarrera, getCarreraById, getFacultades } from '../services/api';
import mascota from '../assets/mascota.png';
import '../styles/EditarCarreraScreen.css';

export default function EditarCarreraScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        const [facultadesData, carreraData] = await Promise.all([
          getFacultades(),
          getCarreraById(id)
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
        setLoadSuccess(true);
        
        setTimeout(() => {
          setLoadSuccess(false);
        }, 3000);
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setErrors({ general: error.message });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarDatos();
    }
  }, [id]);

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

    ['nombre_carrera', 'codigo_carrera', 'pagina_carrera', 'id_facultad'].forEach(field => {
      validateField(field, formData[field]);
    });

    if (Object.keys(errors).filter(key => key !== 'general').length > 0) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const dataToSend = {
        nombre_carrera: formData.nombre_carrera.trim(),
        codigo_carrera: formData.codigo_carrera.trim().toUpperCase(),
        pagina_carrera: formData.pagina_carrera.trim() || null,
        id_facultad: parseInt(formData.id_facultad)
      };

      await updateCarrera(id, dataToSend);
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        navigate('/carrera');
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar carrera:', error);
      setErrors({ general: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
        navigate('/carrera');
      }
    } else {
      navigate('/carrera');
    }
  };

  if (loading) {
    return (
      <div className="editar-carrera-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando datos de la carrera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-carrera-container">
      <div className="editar-carrera-header">
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
            <h1>Editar Carrera</h1>
            <p>Modifica la información de la carrera</p>
          </div>
        </div>
      </div>

      {loadSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>¡Datos de la carrera cargados correctamente!</span>
        </div>
      )}

      {saveSuccess && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>¡Carrera actualizada exitosamente!</span>
        </div>
      )}

      {errors.general && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="editar-carrera-card">
        <form onSubmit={handleSubmit} className="carrera-form">
          <div className="form-group">
            <label htmlFor="nombre_carrera" className="form-label">
              Nombre de la Carrera *
            </label>
            <input
              type="text"
              id="nombre_carrera"
              name="nombre_carrera"
              value={formData.nombre_carrera}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${errors.nombre_carrera ? 'error' : ''} ${touched.nombre_carrera && !errors.nombre_carrera ? 'success' : ''}`}
              placeholder="Ej: Ingeniería de Sistemas"
              maxLength={50}
            />
            {errors.nombre_carrera && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.nombre_carrera}
              </span>
            )}
            <span className="char-counter">
              {formData.nombre_carrera.length}/50
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="codigo_carrera" className="form-label">
              Código de la Carrera *
            </label>
            <input
              type="text"
              id="codigo_carrera"
              name="codigo_carrera"
              value={formData.codigo_carrera}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${errors.codigo_carrera ? 'error' : ''} ${touched.codigo_carrera && !errors.codigo_carrera ? 'success' : ''}`}
              placeholder="Ej: INGSIS"
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.codigo_carrera && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.codigo_carrera}
              </span>
            )}
            <span className="char-counter">
              {formData.codigo_carrera.length}/10
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="id_facultad" className="form-label">
              <GraduationCap size={16} />
              Facultad *
            </label>
            <select
              id="id_facultad"
              name="id_facultad"
              value={formData.id_facultad}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-select ${errors.id_facultad ? 'error' : ''} ${touched.id_facultad && !errors.id_facultad ? 'success' : ''}`}
            >
              <option value="">Seleccione una facultad</option>
              {facultades.map(facultad => (
                <option key={facultad.id} value={facultad.id}>
                  {facultad.nombre_facultad}
                </option>
              ))}
            </select>
            {errors.id_facultad && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.id_facultad}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="pagina_carrera" className="form-label">
              <Globe size={16} />
              Página Web (Opcional)
            </label>
            <input
              type="url"
              id="pagina_carrera"
              name="pagina_carrera"
              value={formData.pagina_carrera}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`form-input ${errors.pagina_carrera ? 'error' : ''} ${touched.pagina_carrera && !errors.pagina_carrera && formData.pagina_carrera ? 'success' : ''}`}
              placeholder="https://carrera.universidad.edu"
            />
            {errors.pagina_carrera && (
              <span className="error-message">
                <AlertCircle size={16} />
                {errors.pagina_carrera}
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