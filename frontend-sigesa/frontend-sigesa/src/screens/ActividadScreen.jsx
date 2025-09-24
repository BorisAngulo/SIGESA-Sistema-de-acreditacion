import React, { useState, useEffect } from 'react';
import { activityLogAPI } from '../services/activityLogAPI';
import { getUsersAPI } from '../services/userAPI';
import { useAuth } from '../contexts/AuthContext';
import './ActividadScreen.css';

const ActividadScreen = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [stats, setStats] = useState(null);
    
    // Filtros
    const [filters, setFilters] = useState({
        user_id: '',
        action: '',
        model_type: '',
        date_from: '',
        date_to: '',
        recent_days: 30,
        per_page: 15,
        page: 1
    });

    const [showFilters, setShowFilters] = useState(false);

    // Opciones para filtros
    const actionOptions = [
        { value: '', label: 'Todas las acciones', icon: '📋' },
        { value: 'created', label: 'Creado', icon: '✨' },
        { value: 'updated', label: 'Actualizado', icon: '📝' },
        { value: 'deleted', label: 'Eliminado', icon: '🗑️' },
        { value: 'login', label: 'Inicio de sesión', icon: '🔑' },
        { value: 'logout', label: 'Cierre de sesión', icon: '🚪' }
    ];

    const modelOptions = [
        { value: '', label: 'Todos los tipos', icon: '🗂️' },
        { value: 'App\\Models\\User', label: 'Usuarios', icon: '👤' },
        { value: 'App\\Models\\Facultad', label: 'Facultades', icon: '🏛️' },
        { value: 'App\\Models\\Carrera', label: 'Carreras', icon: '🎓' },
        { value: 'App\\Models\\Fase', label: 'Fases', icon: '⏳' },
        { value: 'App\\Models\\SubFase', label: 'SubFases', icon: '📊' },
        { value: 'App\\Models\\Documento', label: 'Documentos', icon: '📄' },
        { value: 'App\\Models\\Modalidad', label: 'Modalidades', icon: '🎯' },
        { value: 'App\\Models\\CarreraModalidad', label: 'Carrera-Modalidad', icon: '🔗' }
    ];

    const recentDaysOptions = [
        { value: 7, label: 'Últimos 7 días', icon: '📅' },
        { value: 30, label: 'Últimos 30 días', icon: '📆' },
        { value: 90, label: 'Últimos 90 días', icon: '🗓️' },
        { value: 365, label: 'Último año', icon: '📊' }
    ];

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadLogs();
    }, [filters.page]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            
            // Cargar usuarios para el filtro
            const usersResponse = await getUsersAPI(token);
            if (usersResponse.success) {
                setUsers(usersResponse.data);
            }

            // Cargar estadísticas
            const statsResponse = await activityLogAPI.getStats(filters.recent_days);
            if (statsResponse.success) {
                setStats(statsResponse.data);
            }

            // Cargar logs iniciales
            await loadLogs();
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            setError(error.message || 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            const response = await activityLogAPI.getLogs(filters);
            if (response.success) {
                setLogs(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error cargando logs:', error);
            setError(error.message || 'Error al cargar los logs');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 1 // Reset a primera página cuando cambian los filtros
        }));
    };

    const applyFilters = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        loadLogs();
    };

    const clearFilters = () => {
        setFilters({
            user_id: '',
            action: '',
            model_type: '',
            date_from: '',
            date_to: '',
            recent_days: 30,
            per_page: 15,
            page: 1
        });
        setTimeout(() => loadLogs(), 100);
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const formatUserName = (user) => {
        if (!user) return 'Usuario desconocido';
        return user.name || 'Sin nombre';
    };

    // Función de paginación mejorada
    const renderPagination = () => {
        if (!pagination.total || pagination.total <= pagination.per_page) return null;

        const totalPages = pagination.last_page;
        const currentPage = pagination.current_page;
        const pages = [];

        // Lógica de paginación inteligente
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="pagination-container">
                <div className="pagination-content">
                    <div className="pagination-info">
                        <span className="pagination-badge primary">
                            📊 {pagination.from} - {pagination.to}
                        </span>
                        <span className="pagination-text">de</span>
                        <span className="pagination-badge secondary">
                            {pagination.total} registros
                        </span>
                    </div>
                    
                    <div className="pagination-controls">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        >
                            ← Anterior
                        </button>
                        
                        <div className="pagination-pages">
                            {pages.map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="usuarios-screen">
                <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner">
                    </div>
                    <h2 className="loading-title">Cargando Logs de Actividad</h2>
                    <p className="loading-subtitle">Por favor espera un momento...</p>
                </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <div className="error-icon">
                        <span>⚠️</span>
                    </div>
                    <h2 className="error-title">Error al cargar</h2>
                    <p className="error-message">
                        {typeof error === 'string' ? error : error.message || 'Error al cargar los datos'}
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="error-button"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="actividad-screen">
            <div className="actividad-container">
                {/* Header */}
                <div className="header-card">
                    <div className="header-content">
                        <div className="header-info">
                            <div className="header-title-section">
                                <div className="header-icon">
                                    <span>📊</span>
                                </div>
                                <div className="header-text">
                                    <h1 className="main-title">Logs de Actividad</h1>
                                    <p className="main-subtitle">Registro completo de actividades del sistema</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                        >
                            <span className="btn-icon">
                                {showFilters ? '❌' : '🔍'}
                            </span>
                            <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
                        </button>
                    </div>
                </div>

                {/* Estadísticas */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card stat-total">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <div className="stat-number">{stats.total_activities}</div>
                                    <div className="stat-label">Total Actividades</div>
                                </div>
                                <div className="stat-icon">
                                    <span>📈</span>
                                </div>
                            </div>
                            <div className="stat-progress">
                                <div className="progress-bar full"></div>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-created">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <div className="stat-number">
                                        {stats.activities_by_action?.find(a => a.action === 'created')?.count || 0}
                                    </div>
                                    <div className="stat-label">Creaciones</div>
                                </div>
                                <div className="stat-icon">
                                    <span>✨</span>
                                </div>
                            </div>
                            <div className="stat-progress">
                                <div 
                                    className="progress-bar created" 
                                    style={{width: `${Math.min(100, ((stats.activities_by_action?.find(a => a.action === 'created')?.count || 0) / stats.total_activities) * 100)}%`}}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-updated">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <div className="stat-number">
                                        {stats.activities_by_action?.find(a => a.action === 'updated')?.count || 0}
                                    </div>
                                    <div className="stat-label">Actualizaciones</div>
                                </div>
                                <div className="stat-icon">
                                    <span>📝</span>
                                </div>
                            </div>
                            <div className="stat-progress">
                                <div 
                                    className="progress-bar updated" 
                                    style={{width: `${Math.min(100, ((stats.activities_by_action?.find(a => a.action === 'updated')?.count || 0) / stats.total_activities) * 100)}%`}}
                                ></div>
                            </div>
                        </div>
                        
                        <div className="stat-card stat-deleted">
                            <div className="stat-content">
                                <div className="stat-info">
                                    <div className="stat-number">
                                        {stats.activities_by_action?.find(a => a.action === 'deleted')?.count || 0}
                                    </div>
                                    <div className="stat-label">Eliminaciones</div>
                                </div>
                                <div className="stat-icon">
                                    <span>🗑️</span>
                                </div>
                            </div>
                            <div className="stat-progress">
                                <div 
                                    className="progress-bar deleted" 
                                    style={{width: `${Math.min(100, ((stats.activities_by_action?.find(a => a.action === 'deleted')?.count || 0) / stats.total_activities) * 100)}%`}}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Panel de Filtros */}
                {showFilters && (
                    <div className="filters-panel">
                        <div className="filters-header">
                            <div className="filters-title">
                                <div className="filters-icon">🔍</div>
                                <h3>Filtros Avanzados</h3>
                            </div>
                        </div>
                        
                        <div className="filters-content">
                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label className="filter-label">
                                        <span className="label-icon">👤</span>
                                        <span>Usuario</span>
                                    </label>
                                    <select
                                        value={filters.user_id}
                                        onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">Todos los usuarios</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {formatUserName(user)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">
                                        <span className="label-icon">⚡</span>
                                        <span>Acción</span>
                                    </label>
                                    <select
                                        value={filters.action}
                                        onChange={(e) => handleFilterChange('action', e.target.value)}
                                        className="filter-select"
                                    >
                                        {actionOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.icon} {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">
                                        <span className="label-icon">🗂️</span>
                                        <span>Tipo de Modelo</span>
                                    </label>
                                    <select
                                        value={filters.model_type}
                                        onChange={(e) => handleFilterChange('model_type', e.target.value)}
                                        className="filter-select"
                                    >
                                        {modelOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.icon} {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">
                                        <span className="label-icon">📅</span>
                                        <span>Fecha Desde</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date_from}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">
                                        <span className="label-icon">📅</span>
                                        <span>Fecha Hasta</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.date_to}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">
                                        <span className="label-icon">⏰</span>
                                        <span>Período</span>
                                    </label>
                                    <select
                                        value={filters.recent_days}
                                        onChange={(e) => handleFilterChange('recent_days', parseInt(e.target.value))}
                                        className="filter-select"
                                        disabled={filters.date_from || filters.date_to}
                                    >
                                        {recentDaysOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.icon} {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="filters-actions">
                                <button
                                    onClick={applyFilters}
                                    className="filter-btn apply-btn"
                                >
                                    ✅ Aplicar Filtros
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="filter-btn clear-btn"
                                >
                                    🗑️ Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Logs */}
                <div className="logs-panel">
                    <div className="logs-header">
                        <div className="logs-title">
                            <div className="logs-icon">📝</div>
                            <h3>Registro de Actividades</h3>
                        </div>
                        <div className="logs-count">
                            Total: {pagination.total || logs.length} registros
                        </div>
                    </div>
                    
                    <div className="logs-table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>
                                        <div className="th-content">
                                            <span className="th-icon">🕒</span>
                                            <span>Fecha/Hora</span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="th-content">
                                            <span className="th-icon">👤</span>
                                            <span>Usuario</span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="th-content">
                                            <span className="th-icon">⚡</span>
                                            <span>Acción</span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="th-content">
                                            <span className="th-icon">📄</span>
                                            <span>Descripción</span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="th-content">
                                            <span className="th-icon">🗂️</span>
                                            <span>Tipo</span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="th-content">
                                            <span className="th-icon">🌐</span>
                                            <span>IP</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={log.id} className={`log-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                                        <td>
                                            <div className="cell-content">
                                                <div className="status-dot"></div>
                                                <span className="cell-text">
                                                    {activityLogAPI.formatDateTime(log.created_at)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    <span>
                                                        {formatUserName(log.user).substring(0, 1).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="user-name">
                                                    {formatUserName(log.user)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`action-badge ${log.action}`}>
                                                <span className="action-icon">{activityLogAPI.getActionIcon(log.action)}</span>
                                                <span>{activityLogAPI.formatAction(log.action)}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="description-cell">
                                                <p className="description-text" title={log.description}>
                                                    {log.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="type-badge">
                                                {activityLogAPI.formatModelType(log.model_type)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="ip-address">
                                                {log.ip_address}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {logs.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <span>📝</span>
                            </div>
                            <h3 className="empty-title">No se encontraron logs</h3>
                            <p className="empty-subtitle">No hay logs de actividad con los filtros aplicados.</p>
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {renderPagination()}
            </div>
        </div>
    );
};

export default ActividadScreen;
