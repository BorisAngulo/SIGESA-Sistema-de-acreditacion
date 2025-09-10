import React, { useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import './ModalSubirCertificado.css';

const ModalSubirCertificado = ({ isOpen, onClose, onUpload, carreraModalidad }) => {
  const [certificadoFile, setCertificadoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelection(file);
  };

  const handleFileSelection = (file) => {
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos PDF, PNG, JPEG o JPG');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo no puede ser mayor a 10MB');
      return;
    }

    setCertificadoFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelection(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!certificadoFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      setUploading(true);
      await onUpload(certificadoFile);
      
      // Limpiar y cerrar modal
      setCertificadoFile(null);
      onClose();
    } catch (error) {
      console.error('Error al subir certificado:', error);
      alert('Error al subir el certificado: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setCertificadoFile(null);
    setUploading(false);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-subir-certificado">
        <div className="modal-header">
          <h2>Subir Certificado de Acreditación</h2>
          <button onClick={resetForm} className="close-button" disabled={uploading}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Información de la carrera-modalidad */}
          <div className="carrera-info">
            <h3>Carrera-Modalidad:</h3>
            <p><strong>{carreraModalidad?.carrera?.nombre}</strong> - {carreraModalidad?.modalidad?.nombre}</p>
            <p className="facultad-info">Facultad: {carreraModalidad?.carrera?.facultad?.nombre}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Zona de arrastrar y soltar */}
            <div 
              className={`file-drop-zone ${dragOver ? 'drag-over' : ''} ${certificadoFile ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {certificadoFile ? (
                <div className="file-preview">
                  <File size={48} />
                  <div className="file-info">
                    <h4>{certificadoFile.name}</h4>
                    <p>Tamaño: {formatFileSize(certificadoFile.size)}</p>
                    <p>Tipo: {certificadoFile.type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCertificadoFile(null)}
                    className="remove-file-button"
                    disabled={uploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="drop-prompt">
                  <Upload size={48} />
                  <h3>Arrastra tu certificado aquí</h3>
                  <p>o haz clic para seleccionar</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={uploading}
                    style={{ display: 'none' }}
                    id="certificado-input"
                  />
                  <label htmlFor="certificado-input" className="file-input-label">
                    Seleccionar archivo
                  </label>
                </div>
              )}
            </div>

            {/* Información sobre los archivos permitidos */}
            <div className="file-requirements">
              <AlertCircle size={16} />
              <p>Formatos permitidos: PDF, PNG, JPG, JPEG. Tamaño máximo: 10MB</p>
            </div>

            {/* Botones de acción */}
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={resetForm} 
                className="btn-cancel"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-upload"
                disabled={!certificadoFile || uploading}
              >
                {uploading ? 'Subiendo...' : 'Subir Certificado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalSubirCertificado;
