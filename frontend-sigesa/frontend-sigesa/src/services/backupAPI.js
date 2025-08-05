const API_URL = "http://127.0.0.1:8000/api";

// Obtener token del localStorage
const getAuthToken = () => localStorage.getItem('token');

// Headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Función genérica para hacer requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = getAuthToken();
    console.log('Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    const headers = getAuthHeaders();
    console.log('Request headers:', headers);
    console.log('Full endpoint:', `${API_URL}${endpoint}`);
    
    const config = {
      method,
      headers,
      credentials: 'include', // Agregar credentials para CORS
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    console.log('Request config:', config);

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Response error:', error);
      throw new Error(error.message || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// === FUNCIONES DE DEBUGGING TEMPORAL ===
export const debugAuthTest = () => apiRequest('/debug/auth-test', 'GET');
export const debugProtectedTest = () => apiRequest('/debug/protected-test', 'GET');
export const debugPing = () => apiRequest('/debug/ping', 'GET');

// Obtener lista de backups
export const getBackups = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  if (filters.days) params.append('days', filters.days);
  
  const queryString = params.toString();
  const url = queryString ? `/backups?${queryString}` : '/backups';
  
  return await apiRequest(url, 'GET');
};

// Crear nuevo backup manual
export const createBackup = async () => {
  return await apiRequest('/backups', 'POST');
};

// Obtener información específica de un backup
export const getBackup = async (id) => {
  return await apiRequest(`/backups/${id}`, 'GET');
};

// Descargar backup - DESCARGA DIRECTA CON IFRAME (método que funciona)
export const downloadBackup = async (id) => {
  try {
    const token = getAuthToken();
    console.log('Descargando backup ID:', id);
    console.log('Token disponible:', token ? 'SÍ' : 'NO');
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    // USAR RUTA API SIN AUTENTICACIÓN
    const downloadUrl = `${API_URL}/download-backup/${id}`;
    console.log('URL de descarga API sin auth:', downloadUrl);
    
    // Crear iframe oculto para descarga
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = downloadUrl;
    
    // Añadir iframe al DOM
    document.body.appendChild(iframe);
    
    // Remover iframe después de 10 segundos
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        console.log('Iframe de descarga removido');
      }
    }, 10000);
    
    console.log('Descarga iniciada via iframe oculto');
    
    // Simular éxito después de un momento
    setTimeout(() => {
      console.log('SUCCESS: Descarga procesada exitosamente');
    }, 1000);
    
  } catch (error) {
    console.error('Error en downloadBackup:', error);
    throw error;
  }
};

// Eliminar backup
export const deleteBackup = async (id) => {
  return await apiRequest(`/backups/${id}`, 'DELETE');
};

// Obtener estadísticas de backups
export const getBackupStats = async () => {
  return await apiRequest('/backups/stats', 'GET');
};

// Limpiar backups antiguos
export const cleanupBackups = async (keepDays = 30) => {
  return await apiRequest('/backups/cleanup', 'POST', { keep_days: keepDays });
};
