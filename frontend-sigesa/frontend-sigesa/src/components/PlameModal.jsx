import React, { useState, useEffect, useCallback } from 'react';
import { 
  verificarPlameExiste,
  getPlameByCarreraModalidad, 
  actualizarRelacionPlame
} from '../services/api';
import '../styles/PlameModal.css';

const PlameModal = ({ carreraModalidad, onClose }) => {
  const [plame, setPlame] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editandoCelda, setEditandoCelda] = useState(null);
  const [valorTemporal, setValorTemporal] = useState('');
  
  // Estados para verificación y creación
  const [verificando, setVerificando] = useState(true);
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(false);

  const cargarPlameExistente = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener PLAME por carrera-modalidad
      const plameData = await getPlameByCarreraModalidad(carreraModalidad.id);
      
      // Estructurar los datos correctamente para el frontend
      const plameEstructurado = {
        ...plameData.plame,
        filas: plameData.filas || [],
        columnas: plameData.columnas || [],
        relaciones: plameData.relaciones || []
      };
      
      console.log('📊 PLAME estructurado para frontend:', plameEstructurado);
      setPlame(plameEstructurado);
      
      // Las estadísticas se calcularán en tiempo real cuando existan relaciones
      setEstadisticas(null);
    } catch (err) {
      console.error('Error cargando PLAME:', err);
      
      // Manejo específico de errores de autenticación
      if (err.message.includes('token de autenticación') || err.message.includes('Sesión expirada')) {
        setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      } else if (err.message.includes('Error de conexión')) {
        setError('No se puede conectar con el servidor. Verifique que el servidor esté ejecutándose.');
      } else {
        setError('Error al cargar datos PLAME: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [carreraModalidad]);

  const verificarExistencia = useCallback(async () => {
    try {
      setVerificando(true);
      setError(null);
      
      // Verificar si existe PLAME para esta carrera-modalidad
      const existeData = await verificarPlameExiste(carreraModalidad.id);
      
      if (existeData.existe) {
        // Si existe, cargar directamente
        await cargarPlameExistente();
      } else {
        // Si no existe, mostrar confirmación
        setMostrandoConfirmacion(true);
      }
    } catch (err) {
      console.error('Error al verificar existencia de PLAME:', err);
      
      // Manejo específico de errores de autenticación
      if (err.message.includes('token de autenticación') || err.message.includes('Sesión expirada')) {
        setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      } else if (err.message.includes('Error de conexión')) {
        setError('No se puede conectar con el servidor. Verifique que el servidor esté ejecutándose.');
      } else {
        setError('Error al verificar matriz PLAME: ' + err.message);
      }
    } finally {
      setVerificando(false);
    }
  }, [carreraModalidad, cargarPlameExistente]);

  // Verificar existencia al cargar
  useEffect(() => {
    if (carreraModalidad) {
      verificarExistencia();
    }
  }, [carreraModalidad, verificarExistencia]);

  const handleCrearNuevaMatriz = async () => {
    try {
      setMostrandoConfirmacion(false);
      await cargarPlameExistente(); // Esto creará la matriz automáticamente
    } catch (err) {
      console.error('Error al crear nueva matriz:', err);
      setError('Error al crear nueva matriz PLAME: ' + err.message);
    }
  };

  const handleCancelarCreacion = () => {
    setMostrandoConfirmacion(false);
    onClose();
  };

  const handleEditarCelda = (filaId, columnaId, valorActual) => {
    setEditandoCelda({ filaId, columnaId });
    setValorTemporal(valorActual?.toString() || '');
  };

  const handleGuardarCelda = async () => {
    try {
      setLoading(true);
      
      const valor = parseFloat(valorTemporal) || 0;
      
      await actualizarRelacionPlame(
        plame.id,
        editandoCelda.filaId,
        editandoCelda.columnaId,
        valor
      );
      
      // Recargar datos
      await cargarPlameExistente();
      
      // Limpiar edición
      setEditandoCelda(null);
      setValorTemporal('');
      
    } catch (err) {
      setError('Error al actualizar valor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoCelda(null);
    setValorTemporal('');
  };

  const getValorRelacion = (filaId, columnaId) => {
    if (!plame?.relaciones) return 0;
    
    const relacion = plame.relaciones.find(r => 
      r.id_fila_plame === filaId && r.id_columna_plame === columnaId
    );
    
    return relacion?.valor_relacion_plame || 0;
  };

  const getCeldaColor = (valor) => {
    if (valor === 0) return '#f8f9fa';
    if (valor <= 1) return '#fff3cd';
    if (valor <= 2) return '#ffeaa7';
    if (valor <= 3) return '#fdcb6e';
    if (valor <= 4) return '#e17055';
    return '#d63031';
  };

  const getCeldaTextColor = (valor) => {
    return valor >= 3 ? 'white' : 'black';
  };

  if (!carreraModalidad) return null;

  return (
    <div className="plame-modal-overlay">
      <div className="plame-modal">
        <div className="modal-header">
          <h2>Matriz PLAME - {carreraModalidad?.carrera?.nombre} ({carreraModalidad?.modalidad?.nombre})</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
            {(error.includes('conexión') || error.includes('servidor')) && (
              <button 
                className="btn-retry" 
                onClick={() => {
                  setError(null);
                  verificarExistencia();
                }}
              >
                🔄 Reintentar
              </button>
            )}
          </div>
        )}

        <div className="plame-modal-content">
          {verificando ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Verificando matriz PLAME...</p>
            </div>
          ) : mostrandoConfirmacion ? (
            <div className="confirmation-content">
              <div className="confirmation-icon">📊</div>
              <h3>Matriz PLAME no encontrada</h3>
              <p>
                No existe una matriz PLAME para <strong>{carreraModalidad?.carrera?.nombre}</strong> 
                en modalidad <strong>{carreraModalidad?.modalidad?.nombre}</strong>.
              </p>
              <p>¿Desea crear una nueva matriz PLAME?</p>
              <div className="confirmation-buttons">
                <button 
                  className="btn-primary" 
                  onClick={handleCrearNuevaMatriz}
                >
                  ✅ Crear Matriz PLAME
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={handleCancelarCreacion}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando matriz PLAME...</p>
            </div>
          ) : plame ? (
            <>
              <div className="plame-info">
                <h3>{plame.nombre_plame}</h3>
                <p>{plame.descripcion_plame}</p>
              </div>

              {estadisticas && (
                <div className="estadisticas-panel">
                  <h4>Estadísticas de la Matriz</h4>
                  <div className="estadisticas-grid">
                    <div className="estadistica-item">
                      <span className="label">Total Relaciones:</span>
                      <span className="valor">{estadisticas.total_relaciones}</span>
                    </div>
                    <div className="estadistica-item">
                      <span className="label">Promedio:</span>
                      <span className="valor">{estadisticas.promedio}</span>
                    </div>
                    <div className="estadistica-item">
                      <span className="label">Máximo:</span>
                      <span className="valor">{estadisticas.maximo}</span>
                    </div>
                    <div className="estadistica-item">
                      <span className="label">Mínimo:</span>
                      <span className="valor">{estadisticas.minimo}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="matriz-container">
                <div className="matriz-scroll">
                  <table className="plame-matriz">
                    <thead>
                      <tr>
                        <th className="header-esquina">PLAME</th>
                        {plame.columnas?.map(columna => (
                          <th key={columna.id} className="header-columna">
                            <div className="columna-content">
                              <div className="columna-codigo">COL-{columna.id}</div>
                              <div className="columna-nombre">{columna.nombre_columna_plame}</div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {plame.filas?.map(fila => (
                        <tr key={fila.id}>
                          <td className="header-fila">
                            <div className="fila-content">
                              <div className="fila-codigo">FILA-{fila.id}</div>
                              <div className="fila-nombre">{fila.nombre_fila_plame}</div>
                            </div>
                          </td>
                          {plame.columnas?.map(columna => {
                            const valor = getValorRelacion(fila.id, columna.id);
                            const estaEditando = editandoCelda?.filaId === fila.id && 
                                               editandoCelda?.columnaId === columna.id;
                            
                            return (
                              <td 
                                key={`${fila.id}-${columna.id}`}
                                className="celda-valor"
                                style={{ 
                                  backgroundColor: getCeldaColor(valor),
                                  color: getCeldaTextColor(valor)
                                }}
                              >
                                {estaEditando ? (
                                  <div className="celda-edicion">
                                    <input
                                      type="number"
                                      min="0"
                                      max="5"
                                      step="0.1"
                                      value={valorTemporal}
                                      onChange={(e) => setValorTemporal(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleGuardarCelda();
                                        if (e.key === 'Escape') handleCancelarEdicion();
                                      }}
                                      autoFocus
                                    />
                                    <div className="celda-acciones">
                                      <button 
                                        className="btn-guardar"
                                        onClick={handleGuardarCelda}
                                      >
                                        ✓
                                      </button>
                                      <button 
                                        className="btn-cancelar"
                                        onClick={handleCancelarEdicion}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="celda-display"
                                    onClick={() => handleEditarCelda(fila.id, columna.id, valor)}
                                  >
                                    {valor.toFixed(1)}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="leyenda-colores">
                <h4>Leyenda de Valores</h4>
                <div className="leyenda-items">
                  <div className="leyenda-item">
                    <div className="color-box" style={{ backgroundColor: '#f8f9fa' }}></div>
                    <span>0 - Sin relación</span>
                  </div>
                  <div className="leyenda-item">
                    <div className="color-box" style={{ backgroundColor: '#fff3cd' }}></div>
                    <span>0.1-1.0 - Relación débil</span>
                  </div>
                  <div className="leyenda-item">
                    <div className="color-box" style={{ backgroundColor: '#ffeaa7' }}></div>
                    <span>1.1-2.0 - Relación moderada</span>
                  </div>
                  <div className="leyenda-item">
                    <div className="color-box" style={{ backgroundColor: '#fdcb6e' }}></div>
                    <span>2.1-3.0 - Relación fuerte</span>
                  </div>
                  <div className="leyenda-item">
                    <div className="color-box" style={{ backgroundColor: '#e17055', color: 'white' }}></div>
                    <span>3.1-4.0 - Relación muy fuerte</span>
                  </div>
                  <div className="leyenda-item">
                    <div className="color-box" style={{ backgroundColor: '#d63031', color: 'white' }}></div>
                    <span>4.1-5.0 - Relación crítica</span>
                  </div>
                </div>
              </div>

              <div className="instrucciones">
                <h4>Instrucciones</h4>
                <ul>
                  <li>Haga clic en cualquier celda para editar el valor de la relación</li>
                  <li>Los valores van de 0 (sin relación) a 5 (relación crítica)</li>
                  <li>Use valores decimales para mayor precisión (ej: 2.5)</li>
                  <li>Presione Enter para guardar o Escape para cancelar</li>
                  <li>Los colores indican la intensidad de la relación</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="no-data">
              No se pudo cargar la matriz PLAME
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlameModal;
