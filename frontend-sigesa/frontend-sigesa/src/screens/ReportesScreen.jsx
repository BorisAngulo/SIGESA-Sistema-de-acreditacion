import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Treemap,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const API_URL = "http://127.0.0.1:8000/api";

const getAuthToken = () => {
  return null; 
};

const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

const fetchWithErrorHandling = async (url, options = {}) => {
  return [];
};

const ReportesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    facultades: [],
    carreras: [],
    modalidades: [],
    carreraModalidades: [],
    fases: [],
    subfases: []
  });

  const [filters, setFilters] = useState({
    selectedYear: '2024',
    selectedFacultad: 'todas',
    selectedCarrera: 'todas',
    selectedModalidad: 'todas',
    comparisonMode: false,
    comparisonYear: '2023'
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      setData({
        facultades: [
          { id: 1, nombre_facultad: 'Ingeniería', codigo_facultad: 'ING' },
          { id: 2, nombre_facultad: 'Medicina', codigo_facultad: 'MED' },
          { id: 3, nombre_facultad: 'Derecho', codigo_facultad: 'DER' },
          { id: 4, nombre_facultad: 'Economía', codigo_facultad: 'ECO' },
          { id: 5, nombre_facultad: 'Humanidades', codigo_facultad: 'HUM' },
          { id: 6, nombre_facultad: 'Ciencias Puras', codigo_facultad: 'CIE' }
        ],
        carreras: [
          { id: 1, nombre_carrera: 'Ing. Sistemas', facultad_id: 1 },
          { id: 2, nombre_carrera: 'Ing. Civil', facultad_id: 1 },
          { id: 3, nombre_carrera: 'Ing. Industrial', facultad_id: 1 },
          { id: 4, nombre_carrera: 'Medicina General', facultad_id: 2 },
          { id: 5, nombre_carrera: 'Odontología', facultad_id: 2 },
          { id: 6, nombre_carrera: 'Derecho', facultad_id: 3 },
          { id: 7, nombre_carrera: 'Ciencias Jurídicas', facultad_id: 3 },
          { id: 8, nombre_carrera: 'Economía', facultad_id: 4 },
          { id: 9, nombre_carrera: 'Administración', facultad_id: 4 },
          { id: 10, nombre_carrera: 'Contaduría', facultad_id: 4 },
          { id: 11, nombre_carrera: 'Psicología', facultad_id: 5 },
          { id: 12, nombre_carrera: 'Filosofía', facultad_id: 5 },
          { id: 13, nombre_carrera: 'Matemáticas', facultad_id: 6 },
          { id: 14, nombre_carrera: 'Física', facultad_id: 6 },
          { id: 15, nombre_carrera: 'Química', facultad_id: 6 }
        ],
        modalidades: [
          { id: 1, nombre_modalidad: 'CEUB', descripcion: 'Comité Ejecutivo Universidad Boliviana' },
          { id: 2, nombre_modalidad: 'ARCU-SUR', descripcion: 'Acreditación MERCOSUR' }
        ],
        carreraModalidades: [
          { id: 1, carrera_id: 1, modalidad_id: 1, estado: 'activa', year: 2024 },
          { id: 2, carrera_id: 2, modalidad_id: 1, estado: 'activa', year: 2024 },
          { id: 3, carrera_id: 3, modalidad_id: 1, estado: 'en_proceso', year: 2024 },
          { id: 4, carrera_id: 4, modalidad_id: 2, estado: 'activa', year: 2024 },
          { id: 5, carrera_id: 5, modalidad_id: 2, estado: 'en_proceso', year: 2024 },
          { id: 6, carrera_id: 6, modalidad_id: 1, estado: 'activa', year: 2023 },
          { id: 7, carrera_id: 7, modalidad_id: 1, estado: 'activa', year: 2023 },
          { id: 8, carrera_id: 8, modalidad_id: 2, estado: 'en_proceso', year: 2023 },
          { id: 9, carrera_id: 9, modalidad_id: 1, estado: 'activa', year: 2022 },
          { id: 10, carrera_id: 10, modalidad_id: 2, estado: 'activa', year: 2022 }
        ],
        fases: [],
        subfases: []
      });
      
      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Usando datos de ejemplo.');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      selectedYear: '2024',
      selectedFacultad: 'todas',
      selectedCarrera: 'todas',
      selectedModalidad: 'todas',
      comparisonMode: false,
      comparisonYear: '2023'
    });
  };

  const getFilteredCarreras = () => {
    let filtered = data.carreras;
    
    if (filters.selectedFacultad !== 'todas') {
      filtered = filtered.filter(c => c.facultad_id === parseInt(filters.selectedFacultad));
    }
    
    if (filters.selectedCarrera !== 'todas') {
      filtered = filtered.filter(c => c.id === parseInt(filters.selectedCarrera));
    }
    
    return filtered;
  };

  const getFilteredCarreraModalidades = () => {
    let filtered = data.carreraModalidades;
    
    filtered = filtered.filter(cm => cm.year === parseInt(filters.selectedYear));
    
    if (filters.selectedModalidad !== 'todas') {
      filtered = filtered.filter(cm => cm.modalidad_id === parseInt(filters.selectedModalidad));
    }
    
    const carrerasFiltradas = getFilteredCarreras();
    const idsCarrerasFiltradas = carrerasFiltradas.map(c => c.id);
    filtered = filtered.filter(cm => idsCarrerasFiltradas.includes(cm.carrera_id));
    
    return filtered;
  };

  const getModalidadStats = () => {
    const stats = data.modalidades.map(modalidad => {
      const carrerasConModalidad = getFilteredCarreraModalidades().filter(cm => cm.modalidad_id === modalidad.id);
      const carrerasActivas = carrerasConModalidad.filter(cm => cm.estado === 'activa' || !cm.estado);
      const carrerasEnProceso = carrerasConModalidad.filter(cm => cm.estado === 'en_proceso');
      
      const facultadDistribution = {};
      carrerasConModalidad.forEach(cm => {
        const carrera = data.carreras.find(c => c.id === cm.carrera_id);
        if (carrera) {
          const facultad = data.facultades.find(f => f.id === carrera.facultad_id);
          if (facultad) {
            facultadDistribution[facultad.nombre_facultad] = (facultadDistribution[facultad.nombre_facultad] || 0) + 1;
          }
        }
      });

      return {
        modalidad: modalidad.nombre_modalidad,
        descripcion: modalidad.descripcion,
        totalCarreras: carrerasConModalidad.length,
        carrerasActivas: carrerasActivas.length,
        carrerasEnProceso: carrerasEnProceso.length,
        porcentajeCompletado: carrerasConModalidad.length > 0 ? 
          Math.round((carrerasActivas.length / carrerasConModalidad.length) * 100) : 0,
        facultades: facultadDistribution,
        id: modalidad.id
      };
    });

    return stats.sort((a, b) => b.totalCarreras - a.totalCarreras);
  };

  const getFacultadAnalysis = () => {
    const carrerasFiltradas = getFilteredCarreras();
    const facultadesConCarreras = data.facultades.filter(f => 
      carrerasFiltradas.some(c => c.facultad_id === f.id)
    );

    return facultadesConCarreras.map(facultad => {
      const carrerasFacultad = carrerasFiltradas.filter(c => c.facultad_id === facultad.id);
      const acreditacionesTotales = getFilteredCarreraModalidades().filter(cm => 
        carrerasFacultad.some(c => c.id === cm.carrera_id)
      );

      const modalidadBreakdown = {};
      acreditacionesTotales.forEach(cm => {
        const modalidad = data.modalidades.find(m => m.id === cm.modalidad_id);
        if (modalidad) {
          const key = modalidad.nombre_modalidad;
          modalidadBreakdown[key] = (modalidadBreakdown[key] || 0) + 1;
        }
      });

      return {
        facultad: facultad.nombre_facultad,
        codigo: facultad.codigo_facultad || facultad.nombre_facultad.substr(0, 3).toUpperCase(),
        totalCarreras: carrerasFacultad.length,
        carrerasAcreditadas: acreditacionesTotales.length,
        porcentajeAcreditacion: carrerasFacultad.length > 0 ? 
          Math.round((acreditacionesTotales.length / carrerasFacultad.length) * 100) : 0,
        modalidades: modalidadBreakdown,
        ceub: modalidadBreakdown.CEUB || 0,
        arcusur: modalidadBreakdown['ARCU-SUR'] || 0,
        id: facultad.id
      };
    });
  };

  const getComparativaAnual = () => {
    const baseYear = parseInt(filters.selectedYear);
    const years = [baseYear - 3, baseYear - 2, baseYear - 1, baseYear];
    
    return years.map(year => {
      const yearData = data.carreraModalidades.filter(cm => cm.year === year);
      const ceubCount = yearData.filter(cm => cm.modalidad_id === 1).length;
      const arcusurCount = yearData.filter(cm => cm.modalidad_id === 2).length;
      
      return {
        año: year.toString(),
        totalCarreras: yearData.length,
        ceub: ceubCount,
        arcusur: arcusurCount
      };
    });
  };

  const getEstadisticasComparativas = () => {
    if (!filters.comparisonMode) return null;
    
    const currentYearData = data.carreraModalidades.filter(cm => cm.year === parseInt(filters.selectedYear));
    const comparisonYearData = data.carreraModalidades.filter(cm => cm.year === parseInt(filters.comparisonYear));
    
    const currentCeub = currentYearData.filter(cm => cm.modalidad_id === 1).length;
    const comparisonCeub = comparisonYearData.filter(cm => cm.modalidad_id === 1).length;
    const currentArcusur = currentYearData.filter(cm => cm.modalidad_id === 2).length;
    const comparisonArcusur = comparisonYearData.filter(cm => cm.modalidad_id === 2).length;
    
    return {
      ceubGrowth: comparisonCeub > 0 ? ((currentCeub - comparisonCeub) / comparisonCeub * 100) : 0,
      arcusurGrowth: comparisonArcusur > 0 ? ((currentArcusur - comparisonArcusur) / comparisonArcusur * 100) : 0,
      totalGrowth: (comparisonYearData.length > 0 ? ((currentYearData.length - comparisonYearData.length) / comparisonYearData.length * 100) : 0)
    };
  };

  const getAvailableCarreras = () => {
    if (filters.selectedFacultad === 'todas') return data.carreras;
    return data.carreras.filter(c => c.facultad_id === parseInt(filters.selectedFacultad));
  };

  const getProgresoModalidades = () => {
    const modalidadStats = getModalidadStats();
    return modalidadStats.map(stat => ({
      modalidad: stat.modalidad,
      activas: stat.carrerasActivas,
      enProceso: stat.carrerasEnProceso,
      total: stat.totalCarreras,
      progreso: stat.porcentajeCompletado
    }));
  };

  const getDistribucionEstados = () => {
    const filtered = getFilteredCarreraModalidades();
    const estados = {
      activa: filtered.filter(cm => cm.estado === 'activa').length,
      en_proceso: filtered.filter(cm => cm.estado === 'en_proceso').length,
      total: filtered.length
    };
    
    return [
      { name: 'Activas', value: estados.activa, color: '#10b981' },
      { name: 'En Proceso', value: estados.en_proceso, color: '#f59e0b' }
    ];
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '4px solid rgba(255,255,255,0.3)', 
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Cargando Dashboard de Reportes...</h2>
        <p>Conectando con el sistema de acreditación</p>
      </div>
    );
  }

  const modalidadStats = getModalidadStats();
  const facultadAnalysis = getFacultadAnalysis();
  const comparativaAnual = getComparativaAnual();
  const estadisticasComparativas = getEstadisticasComparativas();
  const progresoModalidades = getProgresoModalidades();
  const distribucionEstados = getDistribucionEstados();

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
          📊 Dashboard de Acreditación Universitaria
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
          Análisis integral de modalidades CEUB y ARCU-SUR
        </p>
        
        {error && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '10px', 
            borderRadius: '8px', 
            marginTop: '15px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <div style={{ 
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#374151' }}>🔍 Filtros de Análisis</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={filters.comparisonMode}
                onChange={(e) => updateFilter('comparisonMode', e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 'bold', color: '#374151' }}>Modo Comparativo</span>
            </label>
            <button 
              onClick={clearFilters}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              🗑️ Limpiar Filtros
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
              📅 Año Principal:
            </label>
            <select 
              value={filters.selectedYear} 
              onChange={(e) => updateFilter('selectedYear', e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px', 
                borderRadius: '8px', 
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
          
          {filters.comparisonMode && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                📊 Año Comparación:
              </label>
              <select 
                value={filters.comparisonYear} 
                onChange={(e) => updateFilter('comparisonYear', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '2px solid #fbbf24',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
              🏛️ Facultad:
            </label>
            <select 
              value={filters.selectedFacultad} 
              onChange={(e) => updateFilter('selectedFacultad', e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px', 
                borderRadius: '8px', 
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="todas">Todas las Facultades</option>
              {data.facultades.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_facultad}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
              📚 Carrera:
            </label>
            <select 
              value={filters.selectedCarrera} 
              onChange={(e) => updateFilter('selectedCarrera', e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px', 
                borderRadius: '8px', 
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="todas">Todas las Carreras</option>
              {getAvailableCarreras().map(c => (
                <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
              🎯 Modalidad:
            </label>
            <select 
              value={filters.selectedModalidad} 
              onChange={(e) => updateFilter('selectedModalidad', e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px', 
                borderRadius: '8px', 
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="todas">Todas las Modalidades</option>
              {data.modalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre_modalidad}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button 
              onClick={loadData}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      {filters.comparisonMode && estadisticasComparativas && (
        <div style={{ 
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '2px solid #fbbf24'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>📊 Análisis Comparativo {filters.selectedYear} vs {filters.comparisonYear}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                {estadisticasComparativas.ceubGrowth > 0 ? '↗️' : estadisticasComparativas.ceubGrowth < 0 ? '↘️' : '➡️'}
                {Math.abs(estadisticasComparativas.ceubGrowth).toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#78350f' }}>Crecimiento CEUB</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#fee2e2', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
                {estadisticasComparativas.arcusurGrowth > 0 ? '↗️' : estadisticasComparativas.arcusurGrowth < 0 ? '↘️' : '➡️'}
                {Math.abs(estadisticasComparativas.arcusurGrowth).toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#7f1d1d' }}>Crecimiento ARCU-SUR</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                {estadisticasComparativas.totalGrowth > 0 ? '↗️' : estadisticasComparativas.totalGrowth < 0 ? '↘️' : '➡️'}
                {Math.abs(estadisticasComparativas.totalGrowth).toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', color: '#1e3a8a' }}>Crecimiento Total</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: '🏛️ Facultades Activas', value: facultadAnalysis.length, color: '#3b82f6', change: '+2 vs año anterior' },
          { title: '📚 Carreras Filtradas', value: getFilteredCarreras().length, color: '#10b981', change: `Año ${filters.selectedYear}` },
          { title: '🏆 CEUB Activas', value: modalidadStats.find(m => m.modalidad === 'CEUB')?.totalCarreras || 0, color: '#f59e0b', change: `${modalidadStats.find(m => m.modalidad === 'CEUB')?.carrerasActivas || 0} completadas` },
          { title: '🌎 ARCU-SUR', value: modalidadStats.find(m => m.modalidad === 'ARCU-SUR')?.totalCarreras || 0, color: '#ef4444', change: `${modalidadStats.find(m => m.modalidad === 'ARCU-SUR')?.carrerasActivas || 0} completadas` }
        ].map((kpi, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            borderLeft: `5px solid ${kpi.color}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: `${kpi.color}15`,
              borderRadius: '0 12px 0 60px'
            }}></div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: kpi.color, marginBottom: '5px' }}>
              {kpi.value}
            </div>
            <div style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '8px' }}>{kpi.title}</div>
            <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{kpi.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>📈 Progreso por Modalidad</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {progresoModalidades.map((prog, index) => (
              <div key={index} style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{prog.modalidad}</span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{prog.activas}/{prog.total}</span>
                </div>
                <div style={{ position: 'relative', height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${prog.progreso}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${COLORS[index]}, ${COLORS[index]}cc)`,
                    transition: 'width 0.3s ease'
                  }}></div>
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {prog.progreso}%
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  {prog.enProceso > 0 && `${prog.enProceso} en proceso`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>🎯 Estado de Acreditaciones</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distribucionEstados}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={30}
                label={({name, value}) => `${name}: ${value}`}
              >
                {distribucionEstados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
            {distribucionEstados.map((estado, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: estado.color }}></div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{estado.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>📊 Tendencias Temporales - Acreditaciones por Año</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={comparativaAnual}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="año" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="ceub" fill="#f59e0b" name="CEUB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="arcusur" fill="#ef4444" name="ARCU-SUR" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="totalCarreras" stroke="#8b5cf6" strokeWidth={3} name="Total" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>🏆 Matriz de Rendimiento por Facultad</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {facultadAnalysis.map((facultad, index) => (
            <div key={facultad.id} style={{
              padding: '20px',
              border: '2px solid #f1f5f9',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}15, ${COLORS[index % COLORS.length]}05)`,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {facultad.codigo}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{facultad.facultad}</h4>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{facultad.totalCarreras} carreras registradas</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{facultad.ceub}</div>
                  <div style={{ fontSize: '12px', color: '#92400e' }}>CEUB</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{facultad.arcusur}</div>
                  <div style={{ fontSize: '12px', color: '#991b1b' }}>ARCU-SUR</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Cobertura de Acreditación: {facultad.porcentajeAcreditacion}%
                </div>
                <div style={{ 
                  height: '6px', 
                  background: '#e5e7eb', 
                  borderRadius: '3px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{
                    width: `${facultad.porcentajeAcreditacion}%`,
                    height: '100%',
                    background: facultad.porcentajeAcreditacion >= 70 ? '#10b981' : 
                               facultad.porcentajeAcreditacion >= 40 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ 
                position: 'absolute', 
                top: '15px', 
                right: '15px',
                padding: '4px 8px',
                background: facultad.porcentajeAcreditacion >= 70 ? '#d1fae5' : 
                           facultad.porcentajeAcreditacion >= 40 ? '#fef3c7' : '#fee2e2',
                color: facultad.porcentajeAcreditacion >= 70 ? '#065f46' : 
                       facultad.porcentajeAcreditacion >= 40 ? '#92400e' : '#991b1b',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                {facultad.porcentajeAcreditacion >= 70 ? '🟢 Excelente' : 
                 facultad.porcentajeAcreditacion >= 40 ? '🟡 Bueno' : '🔴 Bajo'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#1f2937', margin: 0 }}>🏆 Análisis Detallado por Modalidad de Acreditación</h3>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Filtros aplicados - Año: {filters.selectedYear}
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Modalidad</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Total Carreras</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Activas</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>En Proceso</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>% Completado</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Facultades Participantes</th>
                <th style={{ padding: '15px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {modalidadStats.map((stat, index) => (
                <tr key={stat.id} style={{ 
                  background: index % 2 === 0 ? '#f9fafb' : 'white',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <td style={{ padding: '15px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{stat.modalidad}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{stat.descripcion}</div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                    {stat.totalCarreras}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{ 
                      background: '#d1fae5', 
                      color: '#065f46', 
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      fontWeight: 'bold'
                    }}>
                      {stat.carrerasActivas}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      padding: '4px 12px', 
                      borderRadius: '20px',
                      fontWeight: 'bold'
                    }}>
                      {stat.carrerasEnProceso}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        background: '#e5e7eb',
                        height: '20px',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: stat.porcentajeCompletado >= 75 ? '#10b981' : 
                                   stat.porcentajeCompletado >= 50 ? '#f59e0b' : '#ef4444',
                          width: `${stat.porcentajeCompletado}%`,
                          height: '100%',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{ 
                        position: 'absolute', 
                        top: '0', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                      }}>
                        {stat.porcentajeCompletado}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Object.entries(stat.facultades).map(([facultad, count]) => (
                        <span key={facultad} style={{
                          background: COLORS[Math.abs(facultad.length) % COLORS.length],
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {facultad}: {count}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: stat.porcentajeCompletado >= 75 ? '#d1fae5' :
                                 stat.porcentajeCompletado >= 50 ? '#fef3c7' : '#fee2e2',
                      color: stat.porcentajeCompletado >= 75 ? '#065f46' :
                             stat.porcentajeCompletado >= 50 ? '#92400e' : '#991b1b'
                    }}>
                      {stat.porcentajeCompletado >= 75 ? '🟢 Excelente' :
                       stat.porcentajeCompletado >= 50 ? '🟡 Bueno' : '🔴 En Desarrollo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#1f2937', margin: 0 }}>🏛️ Análisis Comparativo por Facultad - Año {filters.selectedYear}</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }}></div>
              CEUB
            </span>
            <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
              ARCU-SUR
            </span>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Facultad</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Total Carreras</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>🏆 CEUB</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>🌎 ARCU-SUR</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Total Acreditadas</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>% Cobertura</th>
                <th style={{ padding: '15px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>Ranking</th>
              </tr>
            </thead>
            <tbody>
              {facultadAnalysis
                .sort((a, b) => b.porcentajeAcreditacion - a.porcentajeAcreditacion)
                .map((facultad, index) => (
                <tr key={facultad.id} style={{ 
                  background: index % 2 === 0 ? '#f9fafb' : 'white',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {facultad.codigo}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{facultad.facultad}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Código: {facultad.codigo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                    {facultad.totalCarreras}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold',
                        color: '#f59e0b'
                      }}>
                        {facultad.ceub}
                      </span>
                      <div style={{
                        width: '30px',
                        height: '4px',
                        background: '#fef3c7',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${facultad.totalCarreras > 0 ? (facultad.ceub / facultad.totalCarreras * 100) : 0}%`,
                          height: '100%',
                          background: '#f59e0b'
                        }}></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold',
                        color: '#ef4444'
                      }}>
                        {facultad.arcusur}
                      </span>
                      <div style={{
                        width: '30px',
                        height: '4px',
                        background: '#fee2e2',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${facultad.totalCarreras > 0 ? (facultad.arcusur / facultad.totalCarreras * 100) : 0}%`,
                          height: '100%',
                          background: '#ef4444'
                        }}></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {facultad.carrerasAcreditadas}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '80px', margin: '0 auto' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: `conic-gradient(${
                          facultad.porcentajeAcreditacion >= 75 ? '#10b981' :
                          facultad.porcentajeAcreditacion >= 50 ? '#f59e0b' : '#ef4444'
                        } ${facultad.porcentajeAcreditacion * 3.6}deg, #e5e7eb 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          background: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#1f2937'
                        }}>
                          {facultad.porcentajeAcreditacion}%
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                   index === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                                   index === 2 ? 'linear-gradient(135deg, #cd7c0f, #92400e)' : '#e5e7eb',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        #{index + 1}
                      </span>
                      <span style={{ fontSize: '20px' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: '#6b7280',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p>📊 Dashboard generado el {new Date().toLocaleDateString('es-BO')} • Sistema de Acreditación Universitaria</p>
        <p style={{ fontSize: '12px' }}>
          Datos filtrados • {facultadAnalysis.length} facultades y {getFilteredCarreras().length} carreras en análisis
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportesScreen;