const API_BASE_URL = 'http://127.0.0.1:8000/api/activity-logs';

// Helper para obtener el token de autenticación
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper para hacer peticiones fetch con autenticación
const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers,
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

export const activityLogAPI = {
    // Obtener lista de logs con filtros opcionales
    getLogs: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            // Agregar filtros si existen
            if (filters.user_id) params.append('user_id', filters.user_id);
            if (filters.action) params.append('action', filters.action);
            if (filters.model_type) params.append('model_type', filters.model_type);
            if (filters.date_from) params.append('date_from', filters.date_from);
            if (filters.date_to) params.append('date_to', filters.date_to);
            if (filters.recent_days) params.append('recent_days', filters.recent_days);
            if (filters.per_page) params.append('per_page', filters.per_page);
            if (filters.page) params.append('page', filters.page);

            const queryString = params.toString();
            const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
            
            return await fetchWithAuth(url);
        } catch (error) {
            console.error('Error obteniendo logs de actividad:', error);
            throw error;
        }
    },

    // Obtener un log específico
    getLog: async (id) => {
        try {
            return await fetchWithAuth(`${API_BASE_URL}/${id}`);
        } catch (error) {
            console.error('Error obteniendo log de actividad:', error);
            throw error;
        }
    },

    // Obtener estadísticas de actividad
    getStats: async (days = 30) => {
        try {
            return await fetchWithAuth(`${API_BASE_URL}/stats/summary?days=${days}`);
        } catch (error) {
            console.error('Error obteniendo estadísticas de actividad:', error);
            throw error;
        }
    },

    // Obtener historial de un modelo específico
    getModelHistory: async (modelType, modelId) => {
        try {
            return await fetchWithAuth(`${API_BASE_URL}/model/${encodeURIComponent(modelType)}/${modelId}`);
        } catch (error) {
            console.error('Error obteniendo historial del modelo:', error);
            throw error;
        }
    },

    // Helpers para formatear datos
    formatAction: (action) => {
        const actionMap = {
            'created': 'Creado',
            'updated': 'Actualizado',
            'deleted': 'Eliminado',
            'login': 'Inicio de sesión',
            'logout': 'Cierre de sesión',
            'viewed': 'Consultado',
            'exported': 'Exportado',
        };
        return actionMap[action] || action;
    },

    formatModelType: (modelType) => {
        const modelMap = {
            'App\\Models\\User': 'Usuario',
            'App\\Models\\Facultad': 'Facultad',
            'App\\Models\\Carrera': 'Carrera',
            'App\\Models\\Fase': 'Fase',
            'App\\Models\\SubFase': 'SubFase',
            'App\\Models\\Documento': 'Documento',
            'App\\Models\\Modalidad': 'Modalidad',
            'App\\Models\\CarreraModalidad': 'Carrera-Modalidad',
            // Agregar más modelos según sea necesario
        };
        return modelMap[modelType] || modelType.split('\\').pop();
    },

    formatDateTime: (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    getActionColor: (action) => {
        const colorMap = {
            'created': 'text-green-600',
            'updated': 'text-blue-600',
            'deleted': 'text-red-600',
            'login': 'text-purple-600',
            'logout': 'text-gray-600',
            'viewed': 'text-yellow-600',
            'exported': 'text-indigo-600',
        };
        return colorMap[action] || 'text-gray-600';
    },

    getActionIcon: (action) => {
        const iconMap = {
            'created': '➕',
            'updated': '✏️',
            'deleted': '🗑️',
            'login': '🔓',
            'logout': '🔒',
            'viewed': '👁️',
            'exported': '📤',
        };
        return iconMap[action] || '📝';
    }
};

export default activityLogAPI;
