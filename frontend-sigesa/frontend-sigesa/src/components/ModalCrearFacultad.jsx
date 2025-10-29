import React, { useState, useEffect } from "react";
import { X, Building2, Hash, Globe, AlertCircle } from "lucide-react";
import { createFacultad } from "../services/api";
import ModalConfirmacionCreacion from "./ModalConfirmacionCreacion";
import useToast from "../hooks/useToast";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import "../styles/ModalCrearFacultad.css";

export default function ModalCrearFacultad({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    pagina_web: "",
    logo: null
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();

  // Hook para controlar el scroll del body
  useBodyScrollLock(isOpen);

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: "",
        codigo: "",
        pagina_web: "",
        logo: null
      });
      setErrors({});
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  }, [isOpen]);

  const validateNombre = (nombre) => {
    if (!nombre.trim()) return "El nombre es requerido";
    if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres";
    if (nombre.length > 100) return "El nombre no puede exceder 100 caracteres";
    if (/\d/.test(nombre)) return "El nombre no puede contener números";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return "El nombre solo puede contener letras y espacios";
    return null;
  };

  const validateCodigo = (codigo) => {
    if (!codigo.trim()) return "El código es requerido";
    if (codigo.length < 2) return "El código debe tener al menos 2 caracteres";
    if (codigo.length > 10) return "El código no puede exceder 10 caracteres";
    if (!/^[A-Z0-9]+$/.test(codigo)) return "El código solo puede contener letras mayúsculas y números";
    return null;
  };

  const validateURL = (url) => {
    if (!url || !url.trim()) return null; // URL es opcional
    
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url)) return "La URL no tiene un formato válido";
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return "La URL debe comenzar con http:// o https://";
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    const formattedValue = name === 'codigo' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validar en tiempo real
    let error = null;
    if (name === 'nombre') error = validateNombre(formattedValue);
    else if (name === 'codigo') error = validateCodigo(formattedValue);
    else if (name === 'pagina_web') error = validateURL(formattedValue);

    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmitClick = () => {
    const nombreError = validateNombre(formData.nombre);
    const codigoError = validateCodigo(formData.codigo);
    const urlError = validateURL(formData.pagina_web || "");

    const newErrors = {};
    if (nombreError) newErrors.nombre = nombreError;
    if (codigoError) newErrors.codigo = codigoError;
    if (urlError) newErrors.pagina_web = urlError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const dataToSend = {
        nombre_facultad: formData.nombre,
        codigo_facultad: formData.codigo
      };

      if (formData.pagina_web && formData.pagina_web.trim()) {
        dataToSend.pagina_facultad = formData.pagina_web;
      }

      let nueva;
      if (formData.logo) {
        const formDataToSend = new FormData();
        formDataToSend.append('nombre_facultad', formData.nombre);
        formDataToSend.append('codigo_facultad', formData.codigo);
        if (formData.pagina_web && formData.pagina_web.trim()) {
          formDataToSend.append('pagina_facultad', formData.pagina_web);
        }
        formDataToSend.append('logo', formData.logo);
        nueva = await createFacultad(formDataToSend);
      } else {
        nueva = await createFacultad(dataToSend);
      }

      setShowConfirmModal(false);
      handleSuccessWithAnimation(nueva);
      
    } catch (error) {
      console.error("Error detallado:", error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const newErrors = {};
          Object.keys(errorData.errors).forEach(key => {
            newErrors[key] = errorData.errors[key][0];
          });
          setErrors(newErrors);
        } else if (errorData.message) {
          setErrors({ general: errorData.message });
        } else {
          setErrors({ general: "Error al crear la facultad" });
        }
      } else if (error.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Error de conexión. Verifica tu internet." });
      }
      toast.error("Error al crear la facultad");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar modal con animación
  const handleClose = () => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Función para manejar el éxito con animación
  const handleSuccessWithAnimation = (result) => {
    toast.success('Facultad creada exitosamente');
    
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
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  const hasErrors = Object.values(errors).some(error => error !== null);

  const datosParaModal = [
    { label: "Nombre", valor: formData.nombre },
    { label: "Código", valor: formData.codigo },
    ...(formData.pagina_web ? [{ label: "Página Web", valor: formData.pagina_web }] : [])
  ];

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-facultad-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`modal-facultad-container ${isClosing ? 'closing' : ''}`}>
        <button
          className="close-button"
          onClick={handleClose}
          disabled={isLoading}
        >
          <X size={24} />
        </button>

        <div className="modal-facultad-header">
          <div className="modal-facultad-header-content">
            <div className="modal-facultad-icon-container">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="modal-facultad-title">Crear Nueva Facultad</h2>
              <p className="modal-facultad-subtitle">Completa la información para registrar una nueva facultad</p>
            </div>
          </div>
        </div>

        <div className="modal-facultad-content">
          {errors.general && (
            <div className="modal-facultad-error-banner">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="modal-facultad-section">
            <h3 className="modal-facultad-section-title">
              <Building2 size={20} />
              Información de la Facultad
            </h3>

            <div className="modal-facultad-form-grid">
              {/* Nombre de la Facultad */}
              <div className="modal-facultad-form-group">
                <label className="modal-facultad-form-label">
                  <Building2 size={16} />
                  <span>Nombre de la Facultad</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Facultad de Ingeniería"
                  className={`modal-facultad-form-input ${errors.nombre ? 'error' : ''}`}
                  disabled={isLoading}
                />
                {errors.nombre && (
                  <span className="modal-facultad-form-error">
                    <AlertCircle size={16} />
                    {errors.nombre}
                  </span>
                )}
              </div>

              {/* Código de la Facultad */}
              <div className="modal-facultad-form-group">
                <label className="modal-facultad-form-label">
                  <Hash size={16} />
                  <span>Código de la Facultad</span>
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  placeholder="Ej: ING"
                  className={`modal-facultad-form-input ${errors.codigo ? 'error' : ''}`}
                  disabled={isLoading}
                />
                {errors.codigo && (
                  <span className="modal-facultad-form-error">
                    <AlertCircle size={16} />
                    {errors.codigo}
                  </span>
                )}
              </div>

              {/* Página Web */}
              <div className="modal-facultad-form-group full-width">
                <label className="modal-facultad-form-label">
                  <Globe size={16} />
                  <span>Página Web <span className="optional-text">(opcional)</span></span>
                </label>
                <input
                  type="url"
                  name="pagina_web"
                  value={formData.pagina_web}
                  onChange={handleInputChange}
                  placeholder="https://www.facultad.edu.bo"
                  className={`modal-facultad-form-input ${errors.pagina_web ? 'error' : ''}`}
                  disabled={isLoading}
                />
                {errors.pagina_web && (
                  <span className="modal-facultad-form-error">
                    <AlertCircle size={16} />
                    {errors.pagina_web}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-facultad-footer">
          <button
            type="button"
            onClick={handleClose}
            className="modal-facultad-btn modal-facultad-btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={hasErrors || isLoading}
            className="modal-facultad-btn modal-facultad-btn-primary"
          >
            {isLoading ? 'Creando...' : 'Crear Facultad'}
          </button>
        </div>

        <ModalConfirmacionCreacion
          isOpen={showConfirmModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmSubmit}
          titulo="Confirmar Creación de Facultad"
          mensaje="¿Estás seguro de que deseas crear esta nueva facultad con los siguientes datos?"
          datosAMostrar={datosParaModal}
          textoConfirmar="Sí, crear facultad"
          textoCancelar="Cancelar"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}