import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllDocumentos, createDocumentoGlobal, downloadDocumento } from '../services/api';
import ModalAsociacionesDocumento from '../components/ModalAsociacionesDocumento';
import ModalSubirDocumentoGlobal from '../components/ModalSubirDocumentoGlobal';
import { FileText, Search, Eye, Calendar, Hash, Plus, Download } from 'lucide-react';
import '../styles/DocumentosScreen.css';
import useToast from '../hooks/useToast';

const DocumentosScreen = () => {
  const { hasRole } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingDocuments, setDownloadingDocuments] = useState(new Set());
  const toast = useToast();

  // Verificar si el usuario tiene permisos
  const tienePermisoCompleto = hasRole('Admin') || hasRole('Tecnico');
  const esCoordinador = hasRole('Coordinador');
  const tieneAcceso = tienePermisoCompleto || esCoordinador;

  useEffect(() => {
    if (!tieneAcceso) {
      setError('No tienes permisos para acceder a esta sección');
      setLoading(false);
      return;
    }

    cargarDocumentos();
  }, [tieneAcceso]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllDocumentos();
      setDocumentos(response || []);
    } catch (err) {
      console.error('Error al cargar documentos:', err);
      setError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const getTipoDocumentoText = (tipoDocumento) => {
    switch (tipoDocumento) {
      case '01':
        return 'Específico';
      case '02':
        return 'General';
      case '03':
        return 'Global';
      default:
        return 'Desconocido';
    }
  };

  const getTipoDocumentoBadge = (tipoDocumento) => {
    const texto = getTipoDocumentoText(tipoDocumento);
    let className = 'badge-general'; // Por defecto
    
    switch (tipoDocumento) {
      case '01':
        className = 'badge-especifico';
        break;
      case '02':
        className = 'badge-general';
        break;
      case '03':
        className = 'badge-global';
        break;
      default:
        className = 'badge-desconocido';
    }
    
    return <span className={`tipo-documento-badge ${className}`}>{texto}</span>;
  };

  const getFileIcon = (tipoMime) => {
    if (!tipoMime) return <FileText size={20} />;
    
    if (tipoMime.includes('pdf')) {
      return <FileText size={20} color="#dc2626" />;
    } else if (tipoMime.includes('word') || tipoMime.includes('document')) {
      return <FileText size={20} color="#2563eb" />;
    } else if (tipoMime.includes('image')) {
      return <FileText size={20} color="#059669" />;
    } else if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) {
      return <FileText size={20} color="#16a34a" />;
    } else {
      return <FileText size={20} color="#6b7280" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleVerAsociaciones = (documento) => {
    setSelectedDocumento(documento);
    setIsModalOpen(true);
  };

  const handleUploadDocumento = async (documentData) => {
    try {
      setIsUploading(true);
      const result = await createDocumentoGlobal(documentData);
      
      if (result && result.exito) {
        console.log('Documento subido exitosamente:', result);
        toast.success('Documento subido exitosamente');
        await cargarDocumentos();
        setShowUploadModal(false);
      } else {
        throw new Error(result?.error || 'Error al subir el documento');
      }
    } catch (error) {
      console.error('Error al subir documento:', error);
      toast.error(error.message || 'Error al subir el documento');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDescargarDocumento = async (documento) => {
    try {
      toast.success(`Iniciando descarga de ${documento.nombre_documento}`);
      // Agregar el documento a la lista de descargas en progreso
      setDownloadingDocuments(prev => new Set(prev).add(documento.id));
      
      await downloadDocumento(documento.id);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast.error('Error al descargar el documento: ' + (error.message || 'Error desconocido'));
    } finally {
      // Remover el documento de la lista de descargas en progreso
      setDownloadingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documento.id);
        return newSet;
      });
    }
  };

  // Filtrar documentos según el tipo de usuario
  const documentosFiltradosPorTipo = esCoordinador 
    ? documentos.filter(doc => doc.tipo_documento === '03') // Solo documentos globales para coordinadores
    : documentos; // Todos los documentos para Admin y Técnico

  const filteredDocumentos = documentosFiltradosPorTipo.filter(doc =>
    doc.nombre_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.descripcion_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.nombre_archivo_original?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!tieneAcceso) {
    return (
      <div className="documentos-screen">
        <div className="documentos-container">
          <div className="error-message">
            <h2>Acceso Denegado</h2>
            <p>No tienes permisos para acceder a esta sección. Solo usuarios con rol Admin, Técnico o Coordinador pueden ver los documentos.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="documentos-screen">
        <div className="documentos-container">
          <div className="loading-message">
            <p>Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documentos-screen">
        <div className="documentos-container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={cargarDocumentos} className="retry-button">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="documentos-screen">
      <div className="documentos-container">
        <div className="documentos-header">
          <div className="documentos-title-section">
            <h1>{esCoordinador ? 'Documentos Globales' : 'Gestión de Documentos'}</h1>
            <p>{esCoordinador ? 'Documentos globales disponibles para consulta' : 'Lista completa de documentos del sistema y sus asociaciones'}</p>
          </div>
          
          {tienePermisoCompleto && (
            <div className="documentos-actions">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-subir-documento"
                disabled={isUploading}
              >
                <Plus size={20} />
                Subir Documento
              </button>
            </div>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={esCoordinador ? "Buscar documentos globales..." : "Buscar documentos por nombre, descripción o archivo..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>{esCoordinador ? 'Documentos Globales' : 'Total Documentos'}</h3>
            <p>{esCoordinador ? documentos.filter(doc => doc.tipo_documento === '03').length : documentos.length}</p>
          </div>
          {!esCoordinador && (
            <>
              <div className="stat-card">
                <h3>Específicos</h3>
                <p>{documentos.filter(doc => doc.tipo_documento === '01').length}</p>
              </div>
              <div className="stat-card">
                <h3>Generales</h3>
                <p>{documentos.filter(doc => doc.tipo_documento === '02').length}</p>
              </div>
              <div className="stat-card">
                <h3>Globales</h3>
                <p>{documentos.filter(doc => doc.tipo_documento === '03').length}</p>
              </div>
            </>
          )}
          <div className="stat-card">
            <h3>Resultados</h3>
            <p>{filteredDocumentos.length}</p>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="documentos-list">
          {filteredDocumentos.length === 0 ? (
            <div className="no-results">
              <FileText size={48} color="#9ca3af" />
              <h3>No se encontraron documentos</h3>
              <p>
                {searchTerm 
                  ? 'Intenta ajustar los términos de búsqueda'
                  : esCoordinador 
                    ? 'No hay documentos globales disponibles'
                    : 'No hay documentos registrados en el sistema'
                }
              </p>
            </div>
          ) : (
            filteredDocumentos.map((documento) => (
              <div key={documento.id} className="documento-card">
                <div className="documento-icon">
                  {getFileIcon(documento.tipo_mime)}
                </div>
                
                <div className="documento-content">
                  <div className="documento-header">
                    <div className="documento-title">
                      <h3>{documento.nombre_documento}</h3>
                      {getTipoDocumentoBadge(documento.tipo_documento)}
                    </div>
                    
                    <div className="documento-actions">
                      <button
                        onClick={() => handleDescargarDocumento(documento)}
                        className="btn-descargar-documento"
                        title="Descargar documento"
                        disabled={downloadingDocuments.has(documento.id)}
                      >
                        <Download size={16} />
                        {downloadingDocuments.has(documento.id) ? 'Descargando...' : 'Descargar'}
                      </button>
                      {!esCoordinador && (
                        <button
                          onClick={() => handleVerAsociaciones(documento)}
                          className="btn-ver-asociaciones"
                          title="Ver asociaciones"
                        >
                          <Eye size={16} />
                          Ver Asociaciones
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {documento.descripcion_documento && (
                    <p className="documento-description">
                      {documento.descripcion_documento}
                    </p>
                  )}
                  
                  <div className="documento-metadata">
                    <div className="metadata-row">
                      <div className="metadata-item">
                        <FileText size={16} />
                        <span>{documento.nombre_archivo_original || 'Sin archivo'}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">Tamaño:</span>
                        <span>{formatFileSize(documento.tamano_archivo)}</span>
                      </div>
                    </div>
                    
                    <div className="metadata-row">
                      <div className="metadata-item">
                        <Hash size={16} />
                        <span>ID: {documento.id}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <span className="metadata-label">MIME:</span>
                        <span className="mime-type">{documento.tipo_mime || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="metadata-row">
                      <div className="metadata-item">
                        <Calendar size={16} />
                        <span>Creado: {formatDate(documento.created_at)}</span>
                      </div>
                      
                      <div className="metadata-item">
                        <Calendar size={16} />
                        <span>Actualizado: {formatDate(documento.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de asociaciones */}
      {!esCoordinador && selectedDocumento && (
        <ModalAsociacionesDocumento
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocumento(null);
          }}
          documento={selectedDocumento}
        />
      )}

      {/* Modal de subir documento global */}
      {tienePermisoCompleto && (
        <ModalSubirDocumentoGlobal
          isOpen={showUploadModal}
          onClose={() => {
            if (!isUploading) {
              setShowUploadModal(false);
            }
          }}
          onUpload={handleUploadDocumento}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

export default DocumentosScreen;
