// === FUNCIÓN ALTERNATIVA PARA VISUALIZACIÓN CON FETCH ===
// Si prefieres usar esta implementación, reemplaza la función viewDocumento en api.jsx

// Visualizar documento usando fetch (con CORS corregido)
export const viewDocumentoConFetch = async (documentoId) => {
  try {
    console.log('📄 Abriendo documento ID con fetch:', documentoId);
    
    const response = await fetch(`${API_URL}/documentos/${documentoId}/ver`, {
      method: 'GET',
      mode: 'cors', // Habilitar CORS explícitamente
      headers: {
        'Accept': 'application/pdf,application/*',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    // Obtener el blob del documento
    const blob = await response.blob();
    
    // Crear URL temporal para el blob
    const url = URL.createObjectURL(blob);
    
    // Abrir en nueva ventana
    const nuevaVentana = window.open(url, '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    
    if (!nuevaVentana) {
      URL.revokeObjectURL(url);
      throw new Error('No se pudo abrir la nueva ventana. Verifica que no esté bloqueada por el navegador.');
    }
    
    // Limpiar URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
    
    console.log('✅ Documento abierto en nueva ventana con fetch');
    return true;
  } catch (error) {
    console.error('❌ Error al visualizar documento con fetch:', error);
    throw error;
  }
};
