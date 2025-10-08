import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import './ModalSubirDocumentoGlobal.css';
import useToast from '../hooks/useToast';

const ModalSubirDocumentoGlobal = ({ isOpen, onClose, onUpload, isUploading = false }) => {
  const toast = useToast();
  const [documentData, setDocumentData] = useState({
    nombre: '',
    descripcion: '',
    archivo: null
  });
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field, value) => {
    setDocumentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDocumentData(prev => ({
      ...prev,
      archivo: file
    }));
  };

  const handleFileInputClick = () => {
    document.getElementById('global-file-input').click();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDocumentData(prev => ({
        ...prev,
        archivo: e.dataTransfer.files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentData.archivo || !documentData.nombre.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await onUpload(documentData);
      // Resetear formulario
      setDocumentData({
        nombre: '',
        descripcion: '',
        archivo: null
      });
      onClose();
      toast.success('Documento subido exitosamente');
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error('Error al subir el documento: ' + (error.message || 'Error desconocido'));
    }
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

  const resetForm = () => {
    setDocumentData({
      nombre: '',
      descripcion: '',
      archivo: null
    });
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-global-overlay" onClick={handleClose}>
      <div className="modal-global-documento" onClick={(e) => e.stopPropagation()}>
        <div className="modal-global-header">
          <h2>Subir Documento Global</h2>
          <button 
            className="global-close-button" 
            onClick={handleClose}
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-global-content">
          <div className="global-form-group">
            <label htmlFor="nombre">Nombre del documento *</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ingrese el nombre del documento..."
              value={documentData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              className="global-form-input"
              required
              disabled={isUploading}
            />
          </div>

          <div className="global-form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              placeholder="Descripción del documento..."
              value={documentData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className="global-form-textarea"
              rows="3"
              disabled={isUploading}
            />
          </div>

          <div className="global-form-group">
            <label>Archivo *</label>
            <div className="global-file-upload-area">
              <input
                id="global-file-input"
                type="file"
                accept=".png,.doc,.docx,.pdf,.jpg,.jpeg,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                onChange={handleFileChange}
                className="global-file-input"
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              
              <div
                className={`global-file-upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!documentData.archivo ? (
                  <div className="global-upload-placeholder" onClick={handleFileInputClick}>
                    <div className="global-upload-icon">
                      <Upload size={32} color="#6c757d" />
                    </div>
                    <p className="global-file-upload-text">Haz clic o arrastra archivos aquí</p>
                    <p className="global-file-upload-subtitle">PDF, DOC, DOCX, imágenes, Excel, etc. (max 20MB)</p>
                  </div>
                ) : (
                  <div className="global-file-preview">
                    <div className="global-file-preview-icon">
                      <FileText size={24} />
                    </div>
                    <div className="global-file-preview-info">
                      <div className="global-file-preview-name">{documentData.archivo.name}</div>
                      <div className="global-file-preview-size">({formatFileSize(documentData.archivo.size)})</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setDocumentData(prev => ({ ...prev, archivo: null }))}
                      className="global-remove-file"
                      disabled={isUploading}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-global-footer">
            <button
              type="button"
              onClick={handleClose}
              className="global-btn global-btn-secondary"
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!documentData.archivo || !documentData.nombre.trim() || isUploading}
              className="global-btn global-btn-primary"
            >
              {isUploading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalSubirDocumentoGlobal;
