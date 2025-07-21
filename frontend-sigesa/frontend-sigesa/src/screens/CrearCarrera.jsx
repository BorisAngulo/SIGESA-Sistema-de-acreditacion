import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCarrera, getFacultades } from '../services/api';
import { ArrowLeft, Save, AlertCircle, BookOpen, Code, Globe, CheckCircle } from 'lucide-react';
import ModalConfirmacionCreacion from '../components/ModalConfirmacionCreacion';
import "../styles/CrearCarrera.css";

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
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

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
        setError('Error al cargar la información de la facultad');
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
    setError(null);
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
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmCreacion = async () => {
    setLoading(true);
    setError(null);

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
      
      setSuccessMessage(`La carrera "${formData.nombre_carrera}" ha sido creada exitosamente.`);
      
      setFormData({
        facultad_id: facultadId || '',
        codigo_carrera: '',
        nombre_carrera: '',
        pagina_carrera: '',
        id_usuario_updated_carrera: 1 
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error al crear carrera:', error);
      
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error al crear la carrera. Por favor, intenta nuevamente.');
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
      <div className="container loading">
        <div className="spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  if (!facultad) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>No se pudo cargar la información de la facultad</p>
          <button onClick={handleVolver} className="btn-secondary">
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
    <div className="container">
      <div className="header">
        <button onClick={handleVolver} className="back-btn">
          <ArrowLeft size={20} />
          <span>Volver a Carreras</span>
        </button>
        
        <h1 className="title">Crear Nueva Carrera</h1>
        <p className="subtitle">Facultad: {facultad.nombre_facultad}</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="codigo_carrera" className="form-label">
              <Code size={18} />
              Código de Carrera *
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
              <span className="error-text">{fieldErrors.codigo_carrera}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="nombre_carrera" className="form-label">
              <BookOpen size={18} />
              Nombre de Carrera *
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
              <span className="error-text">{fieldErrors.nombre_carrera}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="pagina_carrera" className="form-label">
              <Globe size={18} />
              Página Web (Opcional)
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
              <span className="error-text">{fieldErrors.pagina_carrera}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleVolver}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              <Save size={20} />
              Crear Carrera
            </button>
          </div>
        </form>
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