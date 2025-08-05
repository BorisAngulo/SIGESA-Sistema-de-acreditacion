import React, { useState, useEffect } from 'react';
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

// Función temporal para notificaciones (reemplazar con toast cuando esté disponible)
const showNotification = (message, type = 'info') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  if (type === 'error') {
    alert(`Error: ${message}`);
  } else {
    alert(message);
  }
};

const BackupScreen = () => {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    days: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backupsData, statsData] = await Promise.all([
        getBackups(filters),
        getBackupStats()
      ]);
      
      setBackups(backupsData.backups.data || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showNotification('Error al cargar los datos de backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      await createBackup();
      showNotification('Backup manual iniciado correctamente', 'success');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error creando backup:', error);
      showNotification('Error al crear backup: ' + error.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      await downloadBackup(backup.id);
      showNotification(`Descargando ${backup.filename}`, 'success');
    } catch (error) {
      console.error('Error descargando backup:', error);
      showNotification('Error al descargar backup: ' + error.message, 'error');
    }
  };

  const handleDelete = async (backup) => {
    if (!window.confirm(`¿Estás seguro de eliminar el backup "${backup.filename}"?`)) {
      return;
    }

    try {
      await deleteBackup(backup.id);
      showNotification('Backup eliminado correctamente', 'success');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error eliminando backup:', error);
      showNotification('Error al eliminar backup: ' + error.message, 'error');
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
      showNotification(result.message, 'success');
      loadData(); // Recargar datos
    } catch (error) {
      console.error('Error en limpieza:', error);
      showNotification('Error en la limpieza: ' + error.message, 'error');
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
            <div className="spinner-ring"></div>
            <div className="spinner-inner"></div>
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
          <button 
            onClick={handleCreateBackup}
            disabled={creating}
            className="btn btn-primary"
          >
            {creating ? 'Creando...' : '📦 Crear Backup Manual'}
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
