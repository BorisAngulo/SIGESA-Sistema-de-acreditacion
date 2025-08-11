import React, { useState, useEffect } from 'react';
import { Search, Upload, FileText, X, CheckCircle, FileImage, FileType, FileSpreadsheet } from 'lucide-react';
import './ModalEscogerDocumento.css';

const ModalEscogerDocumento = ({ isOpen, onClose, onSelect, onUpload, existingDocuments = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadData, setUploadData] = useState({
    nombre: '',
    descripcion: '',
    tipoDocumento: '02', // '02' para General (valor por defecto)
    archivo: null
  });
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Asegurar que existingDocuments sea un array válido
  const documentsArray = Array.isArray(existingDocuments) ? existingDocuments : [];

  // Función para obtener el icono según el tipo de archivo
  const getDocumentIcon = (tipoMime, nombreArchivo) => {
    if (!tipoMime && !nombreArchivo) {
      return <FileText size={24} color="#6c757d" />;
    }

    // Obtener extensión del nombre del archivo si no hay tipo MIME
    const extension = nombreArchivo ? nombreArchivo.split('.').pop()?.toLowerCase() : '';
    
    // Determinar tipo basado en MIME type o extensión
    const tipo = tipoMime || '';
    
    // PDFs
    if (tipo.includes('pdf') || extension === 'pdf') {
      return <FileText size={24} color="#dc3545" />; // Rojo para PDF
    }
    
    // Documentos de Word
    if (tipo.includes('word') || tipo.includes('document') || 
        extension === 'doc' || extension === 'docx') {
      return <FileType size={24} color="#2b579a" />; // Azul para Word
    }
    
    // Imágenes
    if (tipo.includes('image') || 
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return <FileImage size={24} color="#28a745" />; // Verde para imágenes
    }
    
    // Excel/Hojas de cálculo
    if (tipo.includes('sheet') || tipo.includes('excel') || 
        ['xls', 'xlsx', 'csv'].includes(extension)) {
      return <FileSpreadsheet size={24} color="#0d7377" />; // Verde oscuro para Excel
    }
    
    // Archivo genérico
    return <FileText size={24} color="#6c757d" />;
  };

  // Función para obtener el texto del tipo de documento
  const getDocumentTypeText = (tipoMime, nombreArchivo, tipoDocumento) => {
    // Primero mostrar el tipo de documento (General/Específico) si está disponible
    let tipoTexto = '';
    if (tipoDocumento) {
      tipoTexto = tipoDocumento === '01' ? 'General' : tipoDocumento === '02' ? 'Específico' : tipoDocumento;
    }

    // Luego determinar el tipo de archivo basado en MIME o extensión
    if (!tipoMime && !nombreArchivo) {
      return tipoTexto || 'Documento';
    }

    const extension = nombreArchivo ? nombreArchivo.split('.').pop()?.toLowerCase() : '';
    const tipo = tipoMime || '';
    
    let tipoArchivo = '';
    if (tipo.includes('pdf') || extension === 'pdf') {
      tipoArchivo = 'PDF';
    } else if (tipo.includes('word') || tipo.includes('document') || 
        extension === 'doc' || extension === 'docx') {
      tipoArchivo = 'Word';
    } else if (tipo.includes('image') || 
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      tipoArchivo = 'Imagen';
    } else if (tipo.includes('sheet') || tipo.includes('excel') || 
        ['xls', 'xlsx', 'csv'].includes(extension)) {
      tipoArchivo = 'Excel';
    } else {
      tipoArchivo = 'Documento';
    }

    // Combinar tipo de documento y tipo de archivo
    if (tipoTexto && tipoArchivo) {
      return `${tipoTexto} - ${tipoArchivo}`;
    } else if (tipoTexto) {
      return tipoTexto;
    } else {
      return tipoArchivo;
    }
  };

  // Filtrar documentos según búsqueda
  const filteredDocuments = documentsArray.filter(doc =>
    doc.nombre_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.descripcion_documento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedDocument(null);
      setUploadData({
        nombre: '',
        descripcion: '',
        tipoDocumento: '02', // '02' para General (valor por defecto)
        archivo: null
      });
    }
  }, [isOpen]);

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadData(prev => ({
      ...prev,
      archivo: file
    }));
  };

  const handleFileInputClick = () => {
    document.getElementById('file-input').click();
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
      setUploadData(prev => ({
        ...prev,
        archivo: e.dataTransfer.files[0]
      }));
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadData.archivo || !uploadData.nombre.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(uploadData);
      onClose();
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir el documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectExisting = () => {
    if (selectedDocument) {
      onSelect(selectedDocument);
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="modal-escoger-overlay" onClick={onClose}>
      <div className="modal-escoger-documento" onClick={(e) => e.stopPropagation()}>
        <div className="modal-escoger-header">
          <h2>Escoger documento</h2>
          <button className="escoger-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-escoger-content">
          {/* Barra de búsqueda */}
          <div className="escoger-search-section">
            <div className="escoger-search-input-container">
              <Search size={20} className="escoger-search-icon" />
              <input
                type="text"
                placeholder="Buscar documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="escoger-search-input"
              />
            </div>
          </div>

          <div className="modal-escoger-body">
            {/* Lista de documentos existentes */}
            <div className="escoger-documents-section">
              <div className="escoger-documents-list">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`escoger-document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <div className="escoger-document-icon">
                        {getDocumentIcon(doc.tipo_mime, doc.nombre_archivo_original)}
                      </div>
                      <div className="escoger-document-info">
                        <h4>{doc.nombre_documento}</h4>
                        <span className={`escoger-document-type ${(doc.tipo_documento || doc.tipo) === '01' ? 'tipo-especifico' : 'tipo-general'}`}>
                          {getDocumentTypeText(doc.tipo_mime, doc.nombre_archivo_original, doc.tipo_documento || doc.tipo)}
                        </span>
                        <p className="escoger-document-description">{doc.descripcion_documento}</p>
                        {doc.tamano_archivo && (
                          <span className="escoger-document-size">{formatFileSize(doc.tamano_archivo)}</span>
                        )}
                      </div>
                      {selectedDocument?.id === doc.id && (
                        <div className="escoger-selection-indicator">
                          <CheckCircle size={20} color="#28a745" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="escoger-no-documents">
                    <FileText size={48} color="#6c757d" />
                    <p>No se encontraron documentos</p>
                    <p className="escoger-no-documents-subtitle">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay documentos disponibles'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Área de subida de archivos */}
            <div className="escoger-upload-section">
              <div className="escoger-upload-header">
                <h3>Subir nuevo documento</h3>
              </div>

              {/* Formulario siempre visible */}
              <div className="escoger-upload-form">
                <div className="escoger-form-group">
                  <label>Nombre del documento:</label>
                  <input
                    type="text"
                    placeholder="Nombre del documento..."
                    value={uploadData.nombre}
                    onChange={(e) => setUploadData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="escoger-form-input"
                  />
                </div>

                <div className="escoger-form-group">
                  <label>Tipo de documento:</label>
                  <select
                    value={uploadData.tipoDocumento}
                    onChange={(e) => setUploadData(prev => ({ ...prev, tipoDocumento: e.target.value }))}
                    className="escoger-form-select"
                  >
                    <option value="02">General</option>
                    <option value="01">Específico</option>
                  </select>
                </div>

                <div className="escoger-form-group">
                  <label>Descripción:</label>
                  <textarea
                    placeholder="Descripción del documento..."
                    value={uploadData.descripcion}
                    onChange={(e) => setUploadData(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="escoger-form-textarea"
                    rows="3"
                  />
                </div>

                <div className="escoger-form-group">
                  <label>Archivo:</label>
                  <div className="escoger-file-upload-area">
                    <input
                      id="file-input"
                      type="file"
                      accept=".png,.doc,.docx,.pdf,.jpg,.jpeg,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                      onChange={handleFileChange}
                      className="escoger-file-input"
                      style={{ display: 'none' }}
                    />
                    
                    <div
                      className={`escoger-file-upload-area ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {!uploadData.archivo ? (
                        <div className="escoger-upload-placeholder" onClick={handleFileInputClick}>
                          <div className="escoger-upload-icon">
                            <Upload size={32} color="#6c757d" />
                          </div>
                          <p className="escoger-file-upload-text">Haz clic o arrastra archivos aquí</p>
                          <p className="escoger-file-upload-subtitle">PDF, DOC, DOCX, imágenes (max 20MB)</p>
                        </div>
                      ) : (
                        <div className="escoger-file-preview">
                          <div className="escoger-file-preview-icon">
                            <FileText size={24} />
                          </div>
                          <div className="escoger-file-preview-info">
                            <div className="escoger-file-preview-name">{uploadData.archivo.name}</div>
                            <div className="escoger-file-preview-size">({formatFileSize(uploadData.archivo.size)})</div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setUploadData(prev => ({ ...prev, archivo: null }))}
                            className="escoger-remove-file"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUploadSubmit}
                  disabled={!uploadData.archivo || !uploadData.nombre.trim() || isUploading}
                  className="escoger-btn escoger-btn-primary"
                >
                  {isUploading ? 'Subiendo...' : 'Subir documento'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-escoger-footer">
          <button
            onClick={handleSelectExisting}
            disabled={!selectedDocument}
            className="escoger-btn escoger-btn-primary"
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEscogerDocumento;
