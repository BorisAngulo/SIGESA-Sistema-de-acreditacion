import React, { useState, useEffect } from 'react';
import { 
  getPlameBySubfase, 
  actualizarMatrizPlame, 
  getEstadisticasPlame,
  crearPlameParaSubfase,
  actualizarRelacionPlame
} from '../services/api';
import '../styles/PlameModal.css';

const PlameModal = ({ isOpen, onClose, subfase }) => {
  const [plame, setPlame] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editandoCelda, setEditandoCelda] = useState(null);
  const [valorTemporal, setValorTemporal] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && subfase) {
      cargarDatos();
    }
  }, [isOpen, subfase]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar obtener PLAME existente
      let plameData = await getPlameBySubfase(subfase.id);
      
      // Si no existe, crear uno nuevo
      if (!plameData) {
        console.log('No existe PLAME, creando uno nuevo...');
        plameData = await crearPlameParaSubfase(subfase.id, {
          nombre_plame: `PLAME - ${subfase.nombre_subfase}`,
          descripcion_plame: `Análisis PLAME para ${subfase.nombre_subfase}`
        });
      }
      
      setPlame(plameData);
      
      // Cargar estadísticas si existe el PLAME
      if (plameData?.id) {
        const estadisticasData = await getEstadisticasPlame(plameData.id);
        setEstadisticas(estadisticasData);
      }
    } catch (err) {
      setError('Error al cargar datos PLAME: ' + err.message);
      console.error('Error cargando PLAME:', err);
    } finally {
      setLoading(false);
    }
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
      await cargarDatos();
      
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
      r.fila_plame_id === filaId && r.columna_plame_id === columnaId
    );
    
    return relacion?.valor || 0;
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="plame-modal">
        <div className="modal-header">
          <h2>Matriz PLAME - {subfase?.nombre_subfase}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="modal-content">
          {loading ? (
            <div className="loading">Cargando matriz PLAME...</div>
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
                              <div className="columna-codigo">{columna.codigo_columna}</div>
                              <div className="columna-nombre">{columna.nombre_columna}</div>
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
                              <div className="fila-codigo">{fila.codigo_fila}</div>
                              <div className="fila-nombre">{fila.nombre_fila}</div>
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
