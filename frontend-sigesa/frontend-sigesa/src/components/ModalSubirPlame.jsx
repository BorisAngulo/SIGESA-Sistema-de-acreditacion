import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { subirPlame } from '../services/api';
import '../styles/ModalGeneral.css';
import '../styles/ModalSubirPlame.css';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import useToast from '../hooks/useToast';

const ModalSubirPlame = ({ isOpen, onClose, onUpload, carreraModalidad }) => {
  const [formData, setFormData] = useState({
    nombre_documento: '',
    descripcion_documento: '',
    tipo_documento: 'PLAME'
  });
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useBodyScrollLock(isOpen);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    setError('');
    
    // Auto-completar nombre del documento si está vacío
    if (file && !formData.nombre_documento) {
      setFormData(prev => ({
        ...prev,
        nombre_documento: file.name.split('.')[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!archivo) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (!formData.nombre_documento.trim()) {
      setError('Por favor ingresa un nombre para el documento');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const submitFormData = new FormData();
      submitFormData.append('id_carreraModalidad', carreraModalidad.id);
      submitFormData.append('nombre_documento', formData.nombre_documento.trim());
      submitFormData.append('archivo', archivo);

      const result = await subirPlame(submitFormData);
      
      // Llamar al callback con el ID de carrera-modalidad y el nuevo documento
      onUpload(carreraModalidad.id, result);
      toast.success('Documento PLAME subido exitosamente');
      // Limpiar formulario
      setFormData({
        nombre_documento: '',
        descripcion_documento: '',
        tipo_documento: 'PLAME'
      });
      setArchivo(null);
      
    } catch (error) {
      console.error('Error al subir PLAME:', error);
      setError(error.message || 'Error al subir el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre_documento: '',
        descripcion_documento: '',
        tipo_documento: 'PLAME'
      });
      setArchivo(null);
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content subir-plame-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FileText size={20} />
            Subir Documento PLAME
          </h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Información de la carrera-modalidad */}
          <div className="carrera-info">
            <p><strong>Carrera:</strong> {carreraModalidad.carrera?.nombre}</p>
            <p><strong>Modalidad:</strong> {carreraModalidad.modalidad?.nombre}</p>
            <p><strong>Facultad:</strong> {carreraModalidad.facultad?.nombre_facultad}</p>
          </div>

          <form onSubmit={handleSubmit} className="plame-form">
            {/* Nombre del documento */}
            <div className="form-group">
              <label htmlFor="nombre_documento">
                Nombre del documento <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre_documento"
                name="nombre_documento"
                value={formData.nombre_documento}
                onChange={handleInputChange}
                placeholder="Ej: PLAME Ingeniería de Sistemas 2024"
                required
                disabled={loading}
                maxLength={255}
              />
            </div>

            {/* Subir archivo */}
            <div className="form-group">
              <label htmlFor="archivo">
                Archivo <span className="required">*</span>
              </label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="archivo"
                  onChange={handleArchivoChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  required
                  disabled={loading}
                />
                <div className="file-info">
                  <p className="file-types">
                    Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                  </p>
                  <p className="file-size">Tamaño máximo: 10MB</p>
                  {archivo && (
                    <div className="selected-file">
                      <FileText size={16} />
                      <span>{archivo.name}</span>
                      <span className="file-size-info">
                        ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || !archivo}
              >
                {loading ? (
                  <>
                    <Upload size={16} className="animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Subir Documento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalSubirPlame;