import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Eye } from 'lucide-react';
import { 
  getFodaBySubfase, 
  crearElementoFoda, 
  actualizarElementoFoda, 
  eliminarElementoFoda,
  getTiposEstrategiasFoda,
  crearEstrategiaCruzada,
  getEstrategiasCruzadas 
} from '../services/api.jsx';
import '../styles/FodaModal.css';

const FodaModal = ({ isOpen, onClose, subfase }) => {
  const [loading, setLoading] = useState(false);
  const [analisisFoda, setAnalisisFoda] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [elementosPorCategoria, setElementosPorCategoria] = useState({});
  const [nuevoElemento, setNuevoElemento] = useState({
    categoria: '',
    descripcion: ''
  });
  const [editandoElemento, setEditandoElemento] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('elementos'); // 'elementos' | 'matriz'
  
  // Estados para matriz cruzada
  const [tiposEstrategias, setTiposEstrategias] = useState([]);
  const [estrategiasCruzadas, setEstrategiasCruzadas] = useState([]);
  const [nuevaEstrategia, setNuevaEstrategia] = useState({
    elementoA: '',
    elementoB: '',
    tipoEstrategia: '',
    analisis: '',
    accion: '',
    prioridad: 3
  });

  useEffect(() => {
    if (isOpen && subfase) {
      cargarAnalisisFoda();
    }
  }, [isOpen, subfase]);

  useEffect(() => {
    if (vistaActiva === 'matriz') {
      cargarTiposEstrategias();
      cargarEstrategiasCruzadas();
    }
  }, [vistaActiva, analisisFoda]);

  const cargarAnalisisFoda = async () => {
    setLoading(true);
    try {
      const respuesta = await getFodaBySubfase(subfase.id);
      setAnalisisFoda(respuesta.analisis);
      setCategorias(respuesta.categorias);
      setElementosPorCategoria(respuesta.elementos_por_categoria);
    } catch (error) {
      console.error('Error al cargar FODA:', error);
      alert('Error al cargar el análisis FODA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarTiposEstrategias = async () => {
    try {
      const respuesta = await getTiposEstrategiasFoda();
      setTiposEstrategias(respuesta.datos || respuesta);
    } catch (error) {
      console.error('Error al cargar tipos de estrategias:', error);
    }
  };

  const cargarEstrategiasCruzadas = async () => {
    if (!analisisFoda?.id) return;
    
    try {
      const respuesta = await getEstrategiasCruzadas(analisisFoda.id);
      setEstrategiasCruzadas(respuesta || []);
    } catch (error) {
      console.error('Error al cargar estrategias cruzadas:', error);
      setEstrategiasCruzadas([]);
    }
  };

  const handleCrearEstrategiaCruzada = async () => {
    if (!nuevaEstrategia.elementoA || !nuevaEstrategia.elementoB || 
        !nuevaEstrategia.tipoEstrategia || !nuevaEstrategia.analisis.trim()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const estrategiaData = {
        id_elemento_foda_a: nuevaEstrategia.elementoA,
        id_elemento_foda_b: nuevaEstrategia.elementoB,
        id_estrategia_foda: nuevaEstrategia.tipoEstrategia,
        analisis_relacion_cruzada_foda: nuevaEstrategia.analisis.trim(),
        accion_recomendada_relacion_cruzada_foda: nuevaEstrategia.accion.trim() || null,
        prioridad_relacion_cruzada_foda: nuevaEstrategia.prioridad
      };

      const nuevaEstrategiaCreada = await crearEstrategiaCruzada(estrategiaData);
      
      // Actualizar lista local
      setEstrategiasCruzadas(prev => [...prev, nuevaEstrategiaCreada]);
      
      // Limpiar formulario
      setNuevaEstrategia({
        elementoA: '',
        elementoB: '',
        tipoEstrategia: '',
        analisis: '',
        accion: '',
        prioridad: 3
      });
      
      alert('Estrategia cruzada creada exitosamente');
    } catch (error) {
      console.error('Error al crear estrategia cruzada:', error);
      alert('Error al crear estrategia cruzada: ' + error.message);
    }
  };

  const handleAgregarElemento = async () => {
    if (!nuevoElemento.categoria || !nuevoElemento.descripcion.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      const categoriaSeleccionada = categorias.find(c => c.codigo_categoria_foda === nuevoElemento.categoria);
      
      const elementoData = {
        id_foda_analisis: analisisFoda.id,
        id_categoria_foda: categoriaSeleccionada.id,
        descripcion_elemento_foda: nuevoElemento.descripcion.trim(),
        orden: (elementosPorCategoria[nuevoElemento.categoria]?.length || 0) + 1
      };

      const nuevoElementoCreado = await crearElementoFoda(elementoData);
      
      // Actualizar la lista local
      setElementosPorCategoria(prev => ({
        ...prev,
        [nuevoElemento.categoria]: [
          ...(prev[nuevoElemento.categoria] || []),
          nuevoElementoCreado
        ]
      }));

      // Limpiar formulario
      setNuevoElemento({ categoria: '', descripcion: '' });
      
    } catch (error) {
      console.error('Error al crear elemento:', error);
      alert('Error al crear elemento: ' + error.message);
    }
  };

  const handleEliminarElemento = async (elemento, categoriaKey) => {
    if (!window.confirm('¿Está seguro de eliminar este elemento?')) return;

    try {
      await eliminarElementoFoda(elemento.id);
      
      // Actualizar la lista local
      setElementosPorCategoria(prev => ({
        ...prev,
        [categoriaKey]: prev[categoriaKey].filter(el => el.id !== elemento.id)
      }));
      
    } catch (error) {
      console.error('Error al eliminar elemento:', error);
      alert('Error al eliminar elemento: ' + error.message);
    }
  };

  const getCategoriaColor = (codigo) => {
    const colores = {
      'F': '#22c55e', // Verde - Fortalezas
      'O': '#3b82f6', // Azul - Oportunidades  
      'D': '#f59e0b', // Amarillo - Debilidades
      'A': '#ef4444'  // Rojo - Amenazas
    };
    return colores[codigo] || '#6b7280';
  };

  const getCategoriaIcon = (codigo) => {
    const iconos = {
      'F': '💪', // Fortalezas
      'O': '🎯', // Oportunidades
      'D': '⚠️', // Debilidades
      'A': '🚨'  // Amenazas
    };
    return iconos[codigo] || '📋';
  };

  if (!isOpen) return null;

  return (
    <div className="foda-modal-overlay">
      <div className="foda-modal-container">
        {/* Header */}
        <div className="foda-modal-header">
          <div className="foda-modal-title">
            <span className="foda-icon">📊</span>
            <h2>Análisis FODA - {subfase?.nombre_subfase}</h2>
          </div>
          <button className="foda-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="foda-nav-tabs">
          <button 
            className={`foda-nav-tab ${vistaActiva === 'elementos' ? 'active' : ''}`}
            onClick={() => setVistaActiva('elementos')}
          >
            📝 Elementos FODA
          </button>
          <button 
            className={`foda-nav-tab ${vistaActiva === 'matriz' ? 'active' : ''}`}
            onClick={() => setVistaActiva('matriz')}
          >
            📊 Matriz Cruzada
          </button>
        </div>

        {/* Content */}
        <div className="foda-modal-content">
          {loading ? (
            <div className="foda-loading">
              <div className="spinner"></div>
              <span>Cargando análisis FODA...</span>
            </div>
          ) : vistaActiva === 'elementos' ? (
            <div className="foda-elementos-view">
              {/* Formulario para agregar elementos */}
              <div className="foda-add-element">
                <h3>Agregar Nuevo Elemento</h3>
                <div className="foda-add-form">
                  <select 
                    value={nuevoElemento.categoria}
                    onChange={(e) => setNuevoElemento(prev => ({ ...prev, categoria: e.target.value }))}
                    className="foda-category-select"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.codigo_categoria_foda}>
                        {getCategoriaIcon(categoria.codigo_categoria_foda)} {categoria.nombre_categoria_foda}
                      </option>
                    ))}
                  </select>
                  
                  <textarea
                    value={nuevoElemento.descripcion}
                    onChange={(e) => setNuevoElemento(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Descripción del elemento..."
                    className="foda-description-input"
                    rows={3}
                  />
                  
                  <button 
                    onClick={handleAgregarElemento}
                    className="foda-add-button"
                    disabled={!nuevoElemento.categoria || !nuevoElemento.descripcion.trim()}
                  >
                    <Plus size={16} />
                    Agregar Elemento
                  </button>
                </div>
              </div>

              {/* Lista de elementos por categoría */}
              <div className="foda-categories-grid">
                {categorias.map(categoria => (
                  <div key={categoria.id} className="foda-category-section">
                    <div 
                      className="foda-category-header"
                      style={{ backgroundColor: getCategoriaColor(categoria.codigo_categoria_foda) }}
                    >
                      <span className="foda-category-icon">
                        {getCategoriaIcon(categoria.codigo_categoria_foda)}
                      </span>
                      <h4>{categoria.nombre_categoria_foda}</h4>
                      <span className="foda-elements-count">
                        {elementosPorCategoria[categoria.codigo_categoria_foda]?.length || 0}
                      </span>
                    </div>
                    
                    <div className="foda-elements-list">
                      {elementosPorCategoria[categoria.codigo_categoria_foda]?.map((elemento, index) => (
                        <div key={elemento.id} className="foda-element-item">
                          <div className="foda-element-number">{index + 1}</div>
                          <div className="foda-element-content">
                            <p>{elemento.descripcion_elemento_foda}</p>
                          </div>
                          <div className="foda-element-actions">
                            <button 
                              className="foda-delete-button"
                              onClick={() => handleEliminarElemento(elemento, categoria.codigo_categoria_foda)}
                              title="Eliminar elemento"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {(!elementosPorCategoria[categoria.codigo_categoria_foda] || 
                        elementosPorCategoria[categoria.codigo_categoria_foda].length === 0) && (
                        <div className="foda-empty-category">
                          <span>No hay elementos en esta categoría</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="foda-matriz-view">
              <div className="foda-matriz-header">
                <h3>Matriz de Estrategias Cruzadas</h3>
                <p>Combina elementos de diferentes categorías para crear estrategias</p>
              </div>

              {/* Formulario para crear nueva estrategia cruzada */}
              <div className="foda-estrategia-form">
                <h4>Crear Nueva Estrategia Cruzada</h4>
                
                <div className="foda-estrategia-selectors">
                  <div className="foda-selector-group">
                    <label>Primer Elemento (F/D)</label>
                    <select 
                      value={nuevaEstrategia.elementoA}
                      onChange={(e) => setNuevaEstrategia(prev => ({ ...prev, elementoA: e.target.value }))}
                      className="foda-elemento-select"
                    >
                      <option value="">Seleccionar fortaleza o debilidad...</option>
                      {elementosPorCategoria['F']?.map(elemento => (
                        <option key={elemento.id} value={elemento.id}>
                          💪 {elemento.descripcion_elemento_foda}
                        </option>
                      ))}
                      {elementosPorCategoria['D']?.map(elemento => (
                        <option key={elemento.id} value={elemento.id}>
                          ⚠️ {elemento.descripcion_elemento_foda}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="foda-selector-group">
                    <label>Segundo Elemento (O/A)</label>
                    <select 
                      value={nuevaEstrategia.elementoB}
                      onChange={(e) => setNuevaEstrategia(prev => ({ ...prev, elementoB: e.target.value }))}
                      className="foda-elemento-select"
                    >
                      <option value="">Seleccionar oportunidad o amenaza...</option>
                      {elementosPorCategoria['O']?.map(elemento => (
                        <option key={elemento.id} value={elemento.id}>
                          🌟 {elemento.descripcion_elemento_foda}
                        </option>
                      ))}
                      {elementosPorCategoria['A']?.map(elemento => (
                        <option key={elemento.id} value={elemento.id}>
                          ⚡ {elemento.descripcion_elemento_foda}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="foda-selector-group">
                    <label>Tipo de Estrategia</label>
                    <select 
                      value={nuevaEstrategia.tipoEstrategia}
                      onChange={(e) => setNuevaEstrategia(prev => ({ ...prev, tipoEstrategia: e.target.value }))}
                      className="foda-tipo-select"
                    >
                      <option value="">Seleccionar tipo...</option>
                      {tiposEstrategias.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.codigo_estrategia_foda} - {tipo.nombre_estrategia_foda}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="foda-estrategia-inputs">
                  <div className="foda-input-group">
                    <label>Análisis de la Relación *</label>
                    <textarea
                      value={nuevaEstrategia.analisis}
                      onChange={(e) => setNuevaEstrategia(prev => ({ ...prev, analisis: e.target.value }))}
                      placeholder="Describe cómo se relacionan estos elementos y qué estrategia surge..."
                      className="foda-analisis-input"
                      rows={3}
                    />
                  </div>

                  <div className="foda-input-group">
                    <label>Acción Recomendada</label>
                    <textarea
                      value={nuevaEstrategia.accion}
                      onChange={(e) => setNuevaEstrategia(prev => ({ ...prev, accion: e.target.value }))}
                      placeholder="Qué acciones específicas se deben tomar..."
                      className="foda-accion-input"
                      rows={2}
                    />
                  </div>

                  <div className="foda-input-group">
                    <label>Prioridad</label>
                    <select 
                      value={nuevaEstrategia.prioridad}
                      onChange={(e) => setNuevaEstrategia(prev => ({ ...prev, prioridad: parseInt(e.target.value) }))}
                      className="foda-prioridad-select"
                    >
                      <option value={1}>1 - Muy Baja</option>
                      <option value={2}>2 - Baja</option>
                      <option value={3}>3 - Media</option>
                      <option value={4}>4 - Alta</option>
                      <option value={5}>5 - Muy Alta</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleCrearEstrategiaCruzada}
                  className="foda-crear-estrategia-btn"
                  disabled={!nuevaEstrategia.elementoA || !nuevaEstrategia.elementoB || !nuevaEstrategia.tipoEstrategia || !nuevaEstrategia.analisis.trim()}
                >
                  <Plus size={16} />
                  Crear Estrategia Cruzada
                </button>
              </div>

              {/* Lista de estrategias cruzadas */}
              <div className="foda-estrategias-lista">
                <h4>Estrategias Cruzadas Creadas</h4>
                {estrategiasCruzadas.length === 0 ? (
                  <div className="foda-empty-estrategias">
                    <span>No hay estrategias cruzadas creadas aún</span>
                  </div>
                ) : (
                  <div className="foda-estrategias-grid">
                    {estrategiasCruzadas.map((estrategia, index) => (
                      <div key={estrategia.id || index} className="foda-estrategia-card">
                        <div className="foda-estrategia-header">
                          <span className="foda-estrategia-tipo">
                            {estrategia.tipoEstrategia?.codigo_estrategia_foda || 'N/A'}
                          </span>
                          <span className={`foda-estrategia-prioridad prioridad-${estrategia.prioridad_relacion_cruzada_foda}`}>
                            Prioridad: {estrategia.prioridad_relacion_cruzada_foda || 3}
                          </span>
                        </div>
                        <div className="foda-estrategia-elementos">
                          <div className="foda-elemento-referencia">
                            <strong>Elemento A:</strong> {estrategia.elementoA?.descripcion_elemento_foda || 'N/A'}
                          </div>
                          <div className="foda-elemento-referencia">
                            <strong>Elemento B:</strong> {estrategia.elementoB?.descripcion_elemento_foda || 'N/A'}
                          </div>
                        </div>
                        <div className="foda-estrategia-content">
                          <div className="foda-analisis-content">
                            <strong>Análisis:</strong>
                            <p>{estrategia.analisis_relacion_cruzada_foda}</p>
                          </div>
                          {estrategia.accion_recomendada_relacion_cruzada_foda && (
                            <div className="foda-accion-content">
                              <strong>Acción Recomendada:</strong>
                              <p>{estrategia.accion_recomendada_relacion_cruzada_foda}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="foda-modal-footer">
          <div className="foda-status">
            {analisisFoda && (
              <span className={`foda-status-badge ${analisisFoda.estado ? 'completed' : 'draft'}`}>
                {analisisFoda.estado ? '✅ Completado' : '📝 Borrador'}
              </span>
            )}
          </div>
          
          <div className="foda-actions">
            <button className="foda-cancel-button" onClick={onClose}>
              Cerrar
            </button>
            <button className="foda-save-button">
              <Save size={16} />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FodaModal;
