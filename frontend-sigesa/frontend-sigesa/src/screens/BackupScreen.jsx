import React, { useState, useEffect, useCallback } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import {
  getBackups,
  createBackup,
  downloadBackup,
  deleteBackup,
  getBackupStats,
  cleanupBackups
} from '../services/backupAPI';
import '../styles/BackupScreen.css';
import useToast from '../hooks/useToast';

const BackupScreen = () => {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [storageDisk, setStorageDisk] = useState('local'); // Estado para el tipo de almacenamiento
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    days: ''
  });
  const toast = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [backupsData, statsData] = await Promise.all([
        getBackups(filters),
        getBackupStats()
      ]);
      
      setBackups(backupsData.backups.data || []);
      setStats(statsData);
    } catch (error) {
      toast.error('Error al cargar los datos de backups');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      await createBackup(storageDisk); // Pasar el tipo de almacenamiento seleccionado
      const storageText = storageDisk === 'google' ? 'Google Drive' : 'Local';
      toast.success(`Backup manual iniciado correctamente en ${storageText}`);
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error creando backup:', error);
      toast.error('Error al crear backup: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      await downloadBackup(backup.id);
      toast.success(`Iniciando descarga de ${backup.filename}`);
    } catch (error) {
      console.error('Error descargando backup:', error);
      toast.error('Error al descargar backup: ' + error.message);
    }
  };

  const handleDelete = async (backup) => {
    if (!window.confirm(`¿Estás seguro de eliminar el backup "${backup.filename}"?`)) {
      return;
    }

    try {
      await deleteBackup(backup.id);
      toast.success('Backup eliminado correctamente');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error eliminando backup:', error);
      toast.error('Error al eliminar backup: ' + error.message);
    }
  };

  const handleCleanup = async () => {
    const keepDays = prompt('¿Cuántos días de backups deseas mantener?', '30');
    if (!keepDays || isNaN(keepDays)) return;

    if (!window.confirm(`¿Eliminar todos los backups anteriores a ${keepDays} días?`)) {
      return;
    }

    try {
      const result = await cleanupBackups(parseInt(keepDays));
      toast.success(result.message || 'Limpieza de backups completada');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error en limpieza:', error);
      toast.error('Error en la limpieza: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'status-completed', text: 'Completado' },
      processing: { class: 'status-processing', text: 'Procesando' },
      failed: { class: 'status-failed', text: 'Fallido' },
      pending: { class: 'status-pending', text: 'Pendiente' }
    };

    const config = statusConfig[status] || { class: 'status-unknown', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getStorageIcon = (storageDisk) => {
    switch (storageDisk) {
      case 'google':
        return '☁️'; // Icono de nube para Google Drive
      case 'local':
      default:
        return '💾'; // Icono de disco para almacenamiento local
    }
  };

  const getStorageText = (storageDisk) => {
    switch (storageDisk) {
      case 'google':
        return 'Google Drive';
      case 'local':
      default:
        return 'Local';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="backup-container">
        <div className="loading-content">
          <div className="loading-spinner">
          </div>
          <h2 className="loading-title">Cargando Backups</h2>
          <p className="loading-subtitle">Por favor espera un momento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backup-container">
      <div className="backup-header">
        <h1>Gestión de Backups</h1>
        <div className="backup-actions">
          <div className="backup-storage-selector">
            <label htmlFor="storage-selector">💾 Guardar en:</label>
            <select 
              id="storage-selector"
              value={storageDisk} 
              onChange={(e) => setStorageDisk(e.target.value)}
              disabled={creating}
              className="storage-selector"
            >
              <option value="local">💾 Almacenamiento Local</option>
              <option value="google">☁️ Google Drive</option>
            </select>
          </div>
          <button 
            onClick={handleCreateBackup}
            disabled={creating}
            className="btn btn-primary"
          >
            {creating ? '⏳ Creando...' : `📦 Crear Backup en ${getStorageText(storageDisk)}`}
          </button>
          <button 
            onClick={handleCleanup}
            className="btn btn-secondary"
          >
            🧹 Limpiar Antiguos
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="backup-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{stats.total_backups}</h3>
              <p>Total Backups</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.completed_backups}</h3>
              <p>Completados</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{stats.failed_backups}</h3>
              <p>Fallidos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-content">
              <h3>{formatFileSize(stats.total_size)}</h3>
              <p>Espacio Total</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🕒</div>
            <div className="stat-content">
              <h3>{stats.last_successful ? formatDate(stats.last_successful) : 'N/A'}</h3>
              <p>Último Exitoso</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="backup-filters">
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">Todos los estados</option>
          <option value="completed">Completados</option>
          <option value="processing">Procesando</option>
          <option value="failed">Fallidos</option>
          <option value="pending">Pendientes</option>
        </select>

        <select 
          value={filters.type} 
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">Todos los tipos</option>
          <option value="manual">Manual</option>
          <option value="scheduled">Programado</option>
        </select>

        <select 
          value={filters.days} 
          onChange={(e) => setFilters({...filters, days: e.target.value})}
        >
          <option value="">Todos los días</option>
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>

      {/* Lista de backups */}
      <div className="backup-list">
        {backups.length === 0 ? (
          <div className="no-backups">
            <p>No hay backups disponibles</p>
          </div>
        ) : (
          <div className="backup-table">
            <div className="table-header">
              <div>Archivo</div>
              <div>Tipo</div>
              <div>Almacenamiento</div>
              <div>Estado</div>
              <div>Tamaño</div>
              <div>Fecha</div>
              <div>Creado por</div>
              <div>Acciones</div>
            </div>
            
            {backups.map((backup) => (
              <div key={backup.id} className="table-row">
                <div className="backup-filename">
                  {backup.filename}
                </div>
                <div>
                  <span className={`type-badge type-${backup.backup_type}`}>
                    {backup.backup_type === 'manual' ? '👤 Manual' : '⏰ Programado'}
                  </span>
                </div>
                <div>
                  <span className={`storage-badge storage-${backup.storage_disk || 'local'}`}>
                    {getStorageIcon(backup.storage_disk || 'local')} {getStorageText(backup.storage_disk || 'local')}
                  </span>
                </div>
                <div>
                  {getStatusBadge(backup.status)}
                </div>
                <div>
                  {formatFileSize(backup.file_size)}
                </div>
                <div>
                  {formatDate(backup.created_at)}
                </div>
                <div>
                  {backup.creator?.name || 'Sistema'}
                </div>
                <div className="backup-actions-cell">
                  {backup.status === 'completed' && (
                    <button
                      onClick={() => handleDownload(backup)}
                      className="btn btn-small btn-download"
                      title="Descargar"
                    >
                      📥
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(backup)}
                    className="btn btn-small btn-delete"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Comentado hasta que react-toastify esté disponible */}
      {/* <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      /> */}
    </div>
  );
};

export default BackupScreen;
