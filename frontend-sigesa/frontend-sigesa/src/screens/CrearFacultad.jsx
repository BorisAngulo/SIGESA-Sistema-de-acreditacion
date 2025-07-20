import React, { useState } from "react";
import { Upload, Plus, Globe, Image, Building2, Hash, AlertCircle, CheckCircle2 } from "lucide-react";
import { createFacultad } from "../services/api";
import "../styles/CrearFacultad.css";

export default function CrearFacultad({ onNuevaFacultad }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    pagina_web: "",
    logo: null
  });
  const [mensaje, setMensaje] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewLogo, setPreviewLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!url.trim()) return null; // URL es opcional
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
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

    // Formatear código automáticamente
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          logo: "Por favor selecciona un archivo de imagen válido"
        }));
        return;
      }

      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          logo: "El logo debe ser menor a 5MB"
        }));
        return;
      }

      setErrors(prev => ({
        ...prev,
        logo: null
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSubmit = async () => {
    const nombreError = validateNombre(formData.nombre);
    const codigoError = validateCodigo(formData.codigo);
    const urlError = validateURL(formData.pagina_web);

    const newErrors = {};
    if (nombreError) newErrors.nombre = nombreError;
    if (codigoError) newErrors.codigo = codigoError;
    if (urlError) newErrors.pagina_web = urlError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMensaje(null);
      return;
    }

    setIsLoading(true);
    setMensaje(null);
    setErrors({});
    
    try {
      const dataToSend = {
        nombre_facultad: formData.nombre,
        codigo_facultad: formData.codigo
      };

      // Agregar página web solo si existe
      if (formData.pagina_web && formData.pagina_web.trim()) {
        dataToSend.pagina_web = formData.pagina_web;
      }

      let nueva;
      if (formData.logo) {
        const formDataToSend = new FormData();
        formDataToSend.append('nombre_facultad', formData.nombre);
        formDataToSend.append('codigo_facultad', formData.codigo);
        if (formData.pagina_web && formData.pagina_web.trim()) {
          formDataToSend.append('pagina_web', formData.pagina_web);
        }
        formDataToSend.append('logo', formData.logo);
        nueva = await createFacultad(formDataToSend);
      } else {
        nueva = await createFacultad(dataToSend);
      }

      setMensaje("Facultad creada exitosamente");
      setErrors({});
      setFormData({
        nombre: "",
        codigo: "",
        pagina_web: "",
        logo: null
      });
      setPreviewLogo(null);
      
      if (onNuevaFacultad) onNuevaFacultad(nueva);
    } catch (error) {
      console.error("Error detallado:", error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          const newErrors = {};
          if (errorData.errors.nombre_facultad) {
            newErrors.nombre = errorData.errors.nombre_facultad[0];
          }
          if (errorData.errors.codigo_facultad) {
            newErrors.codigo = errorData.errors.codigo_facultad[0];
          }
          if (errorData.errors.pagina_web) {
            newErrors.pagina_web = errorData.errors.pagina_web[0];
          }
          if (errorData.errors.logo) {
            newErrors.logo = errorData.errors.logo[0];
          }
          setErrors(newErrors);
        } else {
          setErrors({ general: ` ${errorData.message || "Error al crear la facultad"}` });
        }
      } else {
        setErrors({ general: "Error al crear la facultad. Intenta nuevamente." });
      }
      setMensaje(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== null);

  return (
    <div className="crear-facultad-container">
      <div className="crear-facultad-header">
        <div className="crear-facultad-icon">
          <Building2 className="icon-building" />
        </div>
        <h1 className="crear-facultad-title">Nueva Facultad</h1>
        <p className="crear-facultad-subtitle">Completa la información para registrar una nueva facultad</p>
      </div>

      {mensaje && (
        <div className="alert alert-success">
          <CheckCircle2 className="alert-icon" />
          <p className="alert-message">{mensaje}</p>
        </div>
      )}

      {errors.general && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          <p className="alert-message">{errors.general}</p>
        </div>
      )}

      <div className="form-container">
        {/* Nombre de la Facultad */}
        <div className="form-group">
          <label className="form-label">
            <Building2 className="label-icon" />
            Nombre de la Facultad
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Facultad de Ingeniería"
            className={`form-input ${errors.nombre ? 'form-input-error' : ''}`}
          />
          {errors.nombre && (
            <p className="error-message">
              <AlertCircle className="error-icon" />
              {errors.nombre}
            </p>
          )}
        </div>

        {/* Código de la Facultad */}
        <div className="form-group">
          <label className="form-label">
            <Hash className="label-icon" />
            Código de la Facultad
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            placeholder="Ej: ING"
            className={`form-input ${errors.codigo ? 'form-input-error' : ''}`}
          />
          {errors.codigo && (
            <p className="error-message">
              <AlertCircle className="error-icon" />
              {errors.codigo}
            </p>
          )}
        </div>

        {/* Página web de la facultad*/}
        <div className="form-group">
          <label className="form-label">
            <Globe className="label-icon" />
            Página Web <span className="optional-text">(opcional)</span>
          </label>
          <input
            type="url"
            name="pagina_web"
            value={formData.pagina_web}
            onChange={handleInputChange}
            placeholder="https://www.facultad.edu.bo"
            className={`form-input ${errors.pagina_web ? 'form-input-error' : ''}`}
          />
          {errors.pagina_web && (
            <p className="error-message">
              <AlertCircle className="error-icon" />
              {errors.pagina_web}
            </p>
          )}
        </div>

        {/* Logo */}
        <div className="form-group">
          <label className="form-label">
            <Image className="label-icon" />
            Logo de la Facultad <span className="optional-text">(opcional)</span>
          </label>
          
          <div className="logo-upload-container">
            <div className="logo-upload-area">
              <label className="logo-upload-label">
                <div className="logo-upload-content">
                  <Upload className="upload-icon" />
                  <p className="upload-text">
                    <span className="upload-text-bold">Clic para subir</span> o arrastra el archivo
                  </p>
                  <p className="upload-text-small">PNG, JPG o SVG (Máx. 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden-file-input"
                />
              </label>
            </div>
            
            {previewLogo && (
              <div className="logo-preview">
                <div className="logo-preview-container">
                  <img
                    src={previewLogo}
                    alt="Preview logo"
                    className="logo-preview-image"
                  />
                </div>
              </div>
            )}
          </div>
          
          {errors.logo && (
            <p className="error-message">
              <AlertCircle className="error-icon" />
              {errors.logo}
            </p>
          )}
        </div>

        {/* Botón de enviar */}
        <div className="submit-container">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={hasErrors || isLoading}
            className={`submit-button ${hasErrors || isLoading ? 'submit-button-disabled' : 'submit-button-enabled'}`}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Creando...
              </>
            ) : (
              <>
                <Plus className="button-icon" />
                Crear Facultad
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}