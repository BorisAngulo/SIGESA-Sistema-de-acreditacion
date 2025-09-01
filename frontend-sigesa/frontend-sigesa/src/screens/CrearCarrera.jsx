import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCarrera, getFacultades } from '../services/api';
import { ArrowLeft, Save, AlertCircle, BookOpen, Code, Globe, CheckCircle, X } from 'lucide-react';
import ModalConfirmacionCreacion from '../components/ModalConfirmacionCreacion';
import "../styles/CrearCarrera.css";

const AlertToast = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`alert-toast ${type}`}>
      <div className="alert-content">
        {type === 'success' ? (
          <CheckCircle size={20} className="alert-icon" />
        ) : (
          <AlertCircle size={20} className="alert-icon" />
        )}
        <span className="alert-message">{message}</span>
        <button onClick={onClose} className="alert-close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default function CrearCarrera() {
  const { facultadId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    facultad_id: facultadId || '',
    codigo_carrera: '',
    nombre_carrera: '',
    pagina_carrera: '',
    id_usuario_updated_carrera: 1 
  });
  
  const [facultad, setFacultad] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFacultad, setLoadingFacultad] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [alert, setAlert] = useState({
    show: false,
    type: 'success', 
    message: ''
  });

  const showAlert = (type, message) => {
    setAlert({
      show: true,
      type,
      message
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const cargarFacultad = async () => {
      try {
        setLoadingFacultad(true);
        const facultadesData = await getFacultades();
        const facultadEncontrada = facultadesData.find(f => f.id === parseInt(facultadId));
        
        if (!facultadEncontrada) {
          throw new Error('Facultad no encontrada');
        }
        
        setFacultad(facultadEncontrada);
      } catch (error) {
        console.error('Error al cargar facultad:', error);
        showAlert('error', 'Error al cargar la información de la facultad');
      } finally {
        setLoadingFacultad(false);
      }
    };

    if (facultadId) {
      cargarFacultad();
    }
  }, [facultadId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!formData.codigo_carrera.trim()) {
      errors.codigo_carrera = 'El código de carrera es requerido';
    }
    if (!formData.nombre_carrera.trim()) {
      errors.nombre_carrera = 'El nombre de carrera es requerido';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showAlert('error', 'Por favor, corrige los errores en el formulario');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmCreacion = async () => {
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        facultad_id: parseInt(formData.facultad_id),
        codigo_carrera: formData.codigo_carrera.trim().toUpperCase(),
        nombre_carrera: formData.nombre_carrera.trim(),
        pagina_carrera: formData.pagina_carrera.trim() || null
      };

      console.log('Enviando datos:', dataToSend);
      
      const response = await createCarrera(dataToSend);
      console.log('Carrera creada:', response);
      
      showAlert('success', `La carrera "${formData.nombre_carrera}" ha sido creada exitosamente`);
      
      setFormData({
        facultad_id: facultadId || '',
        codigo_carrera: '',
        nombre_carrera: '',
        pagina_carrera: '',
        id_usuario_updated_carrera: 1 
      });
      
    } catch (error) {
      console.error('Error al crear carrera:', error);
      
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        showAlert('error', 'Se encontraron errores en el formulario');
      } else if (error.response?.data?.message) {
        showAlert('error', error.response.data.message);
      } else {
        showAlert('error', 'Error al crear la carrera. Por favor, intenta nuevamente');
      }
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleCancelConfirmacion = () => {
    setShowConfirmModal(false);
  };

  const handleVolver = () => {
    navigate(`/visualizar-carreras/${facultadId}`);
  };

  if (loadingFacultad) {
    return (
      <div className="crear-carrera-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!facultad) {
    return (
      <div className="crear-carrera-container">
        <div className="error-state">
          <AlertCircle size={48} className="error-icon" />
          <h2>Error</h2>
          <p>No se pudo cargar la información de la facultad</p>
          <button onClick={handleVolver} className="btn btn-secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const datosParaModal = {
    nombre: formData.nombre_carrera.trim(),
    codigo: formData.codigo_carrera.trim().toUpperCase(),
    ...(formData.pagina_carrera.trim() && { pagina_web: formData.pagina_carrera.trim() })
  };

  return (
    <div className="crear-carrera-container">
      <AlertToast
        type={alert.type}
        message={alert.message}
        isVisible={alert.show}
        onClose={closeAlert}
      />

      <div className="content-wrapper">
        <div className="page-header">
          <button onClick={handleVolver} className="back-button">
            <ArrowLeft size={20} />
            <span>Volver a Carreras</span>
          </button>
          
          <div className="header-info">
            <h1 className="page-title">Crear Nueva Carrera</h1>
            <div className="faculty-badge">
              <BookOpen size={16} />
              <span>{facultad.nombre_facultad}</span>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="card-header">
            <h2>Información de la Carrera</h2>
            <p>Complete los datos para crear una nueva carrera en esta facultad</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="codigo_carrera" className="form-label">
                  <Code size={18} />
                  <span>Código de Carrera *</span>
                </label>
                <input
                  type="text"
                  id="codigo_carrera"
                  name="codigo_carrera"
                  value={formData.codigo_carrera}
                  onChange={handleInputChange}
                  className={`form-input ${fieldErrors.codigo_carrera ? 'error' : ''}`}
                  placeholder="Ej: INGSIS, MED, DER"
                  maxLength="20"
                  disabled={loading}
                />
                {fieldErrors.codigo_carrera && (
                  <span className="field-error">{fieldErrors.codigo_carrera}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nombre_carrera" className="form-label">
                  <BookOpen size={18} />
                  <span>Nombre de Carrera *</span>
                </label>
                <input
                  type="text"
                  id="nombre_carrera"
                  name="nombre_carrera"
                  value={formData.nombre_carrera}
                  onChange={handleInputChange}
                  className={`form-input ${fieldErrors.nombre_carrera ? 'error' : ''}`}
                  placeholder="Ej: Ingeniería de Sistemas"
                  maxLength="50"
                  disabled={loading}
                />
                {fieldErrors.nombre_carrera && (
                  <span className="field-error">{fieldErrors.nombre_carrera}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="pagina_carrera" className="form-label">
                  <Globe size={18} />
                  <span>Página Web</span>
                  <span className="optional-badge">Opcional</span>
                </label>
                <input
                  type="url"
                  id="pagina_carrera"
                  name="pagina_carrera"
                  value={formData.pagina_carrera}
                  onChange={handleInputChange}
                  className={`form-input ${fieldErrors.pagina_carrera ? 'error' : ''}`}
                  placeholder="https://ejemplo.com"
                  maxLength="100"
                  disabled={loading}
                />
                {fieldErrors.pagina_carrera && (
                  <span className="field-error">{fieldErrors.pagina_carrera}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleVolver}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Crear Carrera</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ModalConfirmacionCreacion
        isOpen={showConfirmModal}
        onClose={handleCancelConfirmacion}
        onConfirm={handleConfirmCreacion}
        titulo="Confirmar Creación de Carrera"
        mensaje={`¿Estás seguro de que deseas crear esta carrera en la facultad "${facultad?.nombre_facultad}"?`}
        datosAMostrar={datosParaModal}
        textoConfirmar="Sí, Crear Carrera"
        textoCancelar="Cancelar"
        isLoading={loading}
      />
    </div>
  );
}