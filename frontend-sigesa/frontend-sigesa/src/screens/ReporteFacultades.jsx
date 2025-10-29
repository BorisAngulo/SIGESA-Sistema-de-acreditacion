import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, ComposedChart } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getFacultades, getCarrerasByFacultad, getReporteFacultades, getEstadisticasFacultad } from '../services/api';

const styles_css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  .stat-card {
    animation: fadeIn 0.5s ease-out;
  }
  
  .stat-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  }
  
  .faculty-card {
    animation: slideIn 0.4s ease-out;
  }
  
  .faculty-card:hover {
    border-color: #667eea;
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(102, 126, 234, 0.2);
  }
  
  .action-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }
  
  .chart-card {
    animation: fadeIn 0.6s ease-out;
  }
  
  .metric-badge {
    transition: all 0.3s ease;
  }
  
  .metric-badge:hover {
    transform: scale(1.15);
  }
  
  .ranking-item:hover {
    transform: translateX(8px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  }
  
  .carrera-item:hover {
    transform: translateX(4px);
    border-color: #667eea;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles_css;
  if (!document.head.querySelector('style[data-component="ReporteFacultades"]')) {
    styleElement.setAttribute('data-component', 'ReporteFacultades');
    document.head.appendChild(styleElement);
  }
}

const ReporteFacultades = () => {
  const [loading, setLoading] = useState(true);
  // Estados para filtros temporales (antes de aplicar)
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempSelectedFacultad, setTempSelectedFacultad] = useState('todas');
  const [tempSelectedModalidad, setTempSelectedModalidad] = useState('todas');
  
  // Estados para filtros aplicados (los que realmente afectan los datos)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFacultad, setSelectedFacultad] = useState('todas');
  const [selectedModalidad, setSelectedModalidad] = useState('todas');
  
  const [expandedFaculties, setExpandedFaculties] = useState(new Set());
  const [facultades, setFacultades] = useState([]);
  const [reporteData, setReporteData] = useState(null);
  const [facultyCarreras, setFacultyCarreras] = useState(new Map());
  const [loadingCarreras, setLoadingCarreras] = useState(new Set());
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [applyingFilters, setApplyingFilters] = useState(false);

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#0ea5e9', '#10b981', '#6366f1'];
  const CHART_COLORS = {
    ceub: '#0ea5e9',
    arcusur: '#8b5cf6',
    primary: '#3b82f6',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#0ea5e9',
    danger: '#8b5cf6'
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Solo recargar cuando se apliquen filtros manualmente
  useEffect(() => {
    if (!loading) { // No recargar durante la carga inicial
      loadReporteData();
    }
  }, [selectedDate, selectedModalidad, selectedFacultad]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const facultadesData = await getFacultades();
      setFacultades(facultadesData || []);
      await loadReporteData();
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos iniciales');
      setFacultades([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReporteData = async () => {
    try {
      const filters = {};
      if (selectedDate) filters.fecha = selectedDate;
      if (selectedModalidad && selectedModalidad !== 'todas') filters.modalidad_tipo = selectedModalidad;
      if (selectedFacultad && selectedFacultad !== 'todas') filters.facultad_id = selectedFacultad;
      const reporteResponse = await getReporteFacultades(filters);
      setReporteData(reporteResponse);
    } catch (error) {
      console.error('Error cargando reporte:', error);
      setError('Error al cargar el reporte de facultades');
    }
  };

  // Función para aplicar filtros
  const applyFilters = async () => {
    setApplyingFilters(true);
    try {
      // Aplicar los filtros temporales a los filtros activos
      setSelectedDate(tempSelectedDate);
      setSelectedFacultad(tempSelectedFacultad);
      setSelectedModalidad(tempSelectedModalidad);
      
      // Limpiar datos de carreras cargadas para recargar con nuevos filtros
      setFacultyCarreras(new Map());
      setExpandedFaculties(new Set());
    } catch (error) {
      console.error('Error aplicando filtros:', error);
      setError('Error al aplicar filtros');
    } finally {
      setApplyingFilters(false);
    }
  };

  // Función para limpiar filtros
  const clearFilters = async () => {
    setApplyingFilters(true);
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      // Resetear tanto filtros temporales como aplicados
      setTempSelectedDate(currentDate);
      setTempSelectedFacultad('todas');
      setTempSelectedModalidad('todas');
      setSelectedDate(currentDate);
      setSelectedFacultad('todas');
      setSelectedModalidad('todas');
      
      // Limpiar datos de carreras cargadas
      setFacultyCarreras(new Map());
      setExpandedFaculties(new Set());
    } catch (error) {
      console.error('Error limpiando filtros:', error);
      setError('Error al limpiar filtros');
    } finally {
      setApplyingFilters(false);
    }
  };

  // Verificar si hay cambios pendientes en los filtros
  const hasFilterChanges = () => {
    return tempSelectedDate !== selectedDate || 
           tempSelectedFacultad !== selectedFacultad || 
           tempSelectedModalidad !== selectedModalidad;
  };

  const loadCarrerasByFacultad = async (facultadId) => {
    if (facultyCarreras.has(facultadId) || loadingCarreras.has(facultadId)) return;
    setLoadingCarreras(prev => new Set([...prev, facultadId]));
    try {
      const filters = {};
      if (selectedDate) filters.fecha = selectedDate;
      if (selectedModalidad && selectedModalidad !== 'todas') filters.modalidad_tipo = selectedModalidad;
      if (selectedFacultad && selectedFacultad !== 'todas') filters.facultad_id = selectedFacultad;
      const estadisticas = await getEstadisticasFacultad(facultadId, filters);
      const carrerasDetalladas = estadisticas?.carreras || [];
      setFacultyCarreras(prev => new Map([...prev, [facultadId, carrerasDetalladas]]));
    } catch (error) {
      console.error(`Error cargando estadísticas de facultad ${facultadId}:`, error);
      try {
        const carreras = await getCarrerasByFacultad(facultadId);
        const carrerasBasicas = carreras.map(carrera => ({
          ...carrera,
          acreditaciones: { ceub: null, arcusur: null }
        }));
        setFacultyCarreras(prev => new Map([...prev, [facultadId, carrerasBasicas]]));
      } catch (fallbackError) {
        setFacultyCarreras(prev => new Map([...prev, [facultadId, []]]));
      }
    } finally {
      setLoadingCarreras(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(facultadId);
        return newSet;
      });
    }
  };

  const toggleFacultyExpansion = async (facultadId) => {
    const newExpanded = new Set(expandedFaculties);
    if (newExpanded.has(facultadId)) {
      newExpanded.delete(facultadId);
    } else {
      newExpanded.add(facultadId);
      await loadCarrerasByFacultad(facultadId);
    }
    setExpandedFaculties(newExpanded);
  };

  const getAnalisisFacultades = () => {
    if (!reporteData || !reporteData.facultades) return [];
    return reporteData.facultades
      .filter(f => selectedFacultad === 'todas' || f.id.toString() === selectedFacultad)
      .map(facultad => ({
        ...facultad,
        total_carreras: facultad.total_carreras || 0,
        carreras_acreditadas: (facultad.ceub_total || 0) + (facultad.arcusur_total || 0),
        ceub: facultad.ceub_total || 0,
        arcusur: facultad.arcusur_total || 0,
        porcentaje_acreditacion: facultad.porcentaje_cobertura || 0,
        sin_acreditar: (facultad.total_carreras || 0) - (facultad.total_acreditadas || 0)
      }));
  };

  const getPieChartData = () => {
    const analisis = getAnalisisFacultades();
    const totalCeub = analisis.reduce((sum, f) => sum + f.ceub, 0);
    const totalArcusur = analisis.reduce((sum, f) => sum + f.arcusur, 0);
    const totalCarreras = analisis.reduce((sum, f) => sum + f.total_carreras, 0);
    const sinAcreditar = totalCarreras - totalCeub - totalArcusur;
    return [
      { name: 'CEUB', value: totalCeub, color: CHART_COLORS.ceub },
      { name: 'ARCU-SUR', value: totalArcusur, color: CHART_COLORS.arcusur },
      { name: 'Sin Acreditar', value: sinAcreditar, color: '#94a3b8' }
    ];
  };

  const getRadarChartData = () => {
    return getAnalisisFacultades().slice(0, 6).map(f => ({
      facultad: f.codigo_facultad,
      cobertura: f.porcentaje_acreditacion,
      ceub: (f.ceub / (f.total_carreras || 1)) * 100,
      arcusur: (f.arcusur / (f.total_carreras || 1)) * 100
    }));
  };

  const getTopFacultades = () => {
    return getAnalisisFacultades()
      .sort((a, b) => b.porcentaje_acreditacion - a.porcentaje_acreditacion)
      .slice(0, 5);
  };

  const getComparativaData = () => {
    return getAnalisisFacultades().map(f => ({
      nombre: f.codigo_facultad,
      acreditadas: f.carreras_acreditadas,
      sin_acreditar: f.sin_acreditar,
      porcentaje: f.porcentaje_acreditacion
    }));
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const analisis = getAnalisisFacultades();
      const headers = ['Facultad', 'Código', 'Total Carreras', 'Acreditadas', 'CEUB', 'ARCU-SUR', '% Cobertura'];
      const data = analisis.map(f => [
        f.nombre_facultad,
        f.codigo_facultad,
        f.total_carreras,
        f.carreras_acreditadas,
        f.ceub,
        f.arcusur,
        f.porcentaje_acreditacion + '%'
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      XLSX.utils.book_append_sheet(wb, ws, 'Análisis Facultades');
      XLSX.writeFile(wb, `Reporte_Facultades_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.xlsx`);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('Error al exportar a Excel');
    }
  };

  const exportToPDF = async () => {
    try {
      const element = document.querySelector('.reporte-container');
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Reporte_Facultades_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      alert('Error al exportar a PDF');
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>{payload[0].payload.nombre_facultad || payload[0].payload.nombre}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{...styles.tooltipValue, color: entry.color}}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CarrerasList = ({ facultadId }) => {
    const carreras = facultyCarreras.get(facultadId) || [];
    const isLoading = loadingCarreras.has(facultadId);

    if (isLoading) {
      return (
        <div style={styles.carrerasLoading}>
          <div className="spinner" style={styles.spinner}></div>
          <span>Cargando carreras...</span>
        </div>
      );
    }

    if (carreras.length === 0) {
      return <div style={styles.carrerasEmpty}><span>No se encontraron carreras</span></div>;
    }

    return (
      <div style={styles.carrerasList}>
        {carreras.map(carrera => (
          <div key={carrera.id} style={styles.carreraItem} className="carrera-item">
            <div style={styles.carreraHeader}>
              <div style={styles.carreraName}>
                <span style={styles.carreraIcon}>📚</span>
                {carrera.nombre_carrera}
              </div>
              <div style={styles.carreraBadges}>
                {carrera.ceub_activa && (
                  <div style={{...styles.acredBadge, ...styles.ceubBadge}}>
                    <span>CEUB</span>
                    <div style={styles.badgeDetails}>
                      {carrera.ceub_fecha_vencimiento && (
                        <small>Hasta: {new Date(carrera.ceub_fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      )}
                    </div>
                  </div>
                )}
                {carrera.arcusur_activa && (
                  <div style={{...styles.acredBadge, ...styles.arcusurBadge}}>
                    <span>ARCU-SUR</span>
                    <div style={styles.badgeDetails}>
                      {carrera.arcusur_fecha_vencimiento && (
                        <small>Hasta: {new Date(carrera.arcusur_fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      )}
                    </div>
                  </div>
                )}
                {!carrera.ceub_activa && !carrera.arcusur_activa && (
                  <div style={{...styles.acredBadge, ...styles.noneBadge}}>
                    <span>Sin acreditación</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={styles.spinner}></div>
        <h2 style={styles.loadingText}>Cargando Reporte de Facultades...</h2>
        <p style={styles.loadingSubtext}>Por favor espere</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Error al cargar el reporte</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={loadInitialData} style={styles.retryButton}>🔄 Reintentar</button>
      </div>
    );
  }

  const analisisFacultades = getAnalisisFacultades();
  const pieData = getPieChartData();
  const radarData = getRadarChartData();
  const topFacultades = getTopFacultades();
  const comparativaData = getComparativaData();

  return (
    <div className="reporte-container" style={styles.container}>
      {/* Header con gradiente y efecto glassmorphism */}
      <div style={styles.header}>
        <div style={styles.headerOverlay}></div>
        <div style={styles.headerContent}>
          <h1 style={styles.mainTitle}>📊 Reporte Integral de Facultades</h1>
          <p style={styles.subtitle}>Sistema de Análisis de Acreditación Académica</p>
          <div style={styles.headerStats}>
            <div style={styles.headerStatItem}>
              <span style={styles.headerStatValue}>
                {reporteData?.estadisticas_generales?.total_facultades || 0}
              </span>
              <span style={styles.headerStatLabel}>Facultades</span>
            </div>
            <div style={styles.headerStatDivider}></div>
            <div style={styles.headerStatItem}>
              <span style={styles.headerStatValue}>
                {reporteData?.estadisticas_generales?.total_carreras || 0}
              </span>
              <span style={styles.headerStatLabel}>Carreras</span>
            </div>
            <div style={styles.headerStatDivider}></div>
            <div style={styles.headerStatItem}>
              <span style={styles.headerStatValue}>
                {reporteData?.estadisticas_generales?.total_acreditadas || 0}
              </span>
              <span style={styles.headerStatLabel}>Acreditadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros mejorados con diseño moderno */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>⚙️ Panel de Control</h3>
          <div style={styles.actionButtonsContainer}>
            <button onClick={exportToExcel} style={{...styles.actionBtn, ...styles.excelBtn}} className="action-btn">
              📊 Exportar Excel
            </button>
            <button onClick={exportToPDF} style={{...styles.actionBtn, ...styles.pdfBtn}} className="action-btn">
              📄 Exportar PDF
            </button>
          </div>
        </div>
        <div style={styles.filtersGrid}>
          <div style={styles.filterCard}>
            <label style={styles.filterLabel}>📅 Fecha de Referencia</label>
            <input 
              type="date" 
              value={tempSelectedDate} 
              onChange={(e) => setTempSelectedDate(e.target.value)} 
              style={{
                ...styles.filterSelect,
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <small style={{
              display: 'block',
              marginTop: '8px',
              color: '#6b7280',
              fontSize: '12px'
            }}>
              Las acreditaciones se evalúan a esta fecha
            </small>
          </div>

          <div style={styles.filterCard}>
            <label style={styles.filterLabel}>🎯 Modalidad de Estudio</label>
            <select value={tempSelectedModalidad} onChange={(e) => setTempSelectedModalidad(e.target.value)} style={styles.filterSelect}>
              <option value="todas">Todas las Modalidades</option>
              <option value="ceub">CEUB</option>
              <option value="arcusur">ARCUSUR</option>
            </select>
          </div>

          <div style={styles.filterCard}>
            <label style={styles.filterLabel}>🏛️ Facultad Específica</label>
            <select value={tempSelectedFacultad} onChange={(e) => setTempSelectedFacultad(e.target.value)} style={styles.filterSelect}>
              <option value="todas">Todas las Facultades</option>
              {facultades.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_facultad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de control de filtros */}
        <div style={styles.filterButtonsContainer}>
          <button 
            onClick={applyFilters}
            disabled={applyingFilters || !hasFilterChanges()}
            style={{
              ...styles.filterBtn,
              ...styles.applyBtn,
              opacity: (!hasFilterChanges() || applyingFilters) ? 0.6 : 1,
              cursor: (!hasFilterChanges() || applyingFilters) ? 'not-allowed' : 'pointer'
            }}
            className="action-btn"
          >
            {applyingFilters ? (
              <>
                <span className="spinner" style={{display: 'inline-block', marginRight: '8px'}}>⏳</span>
                Aplicando...
              </>
            ) : (
              <>
                🔍 Aplicar Filtros
                {hasFilterChanges() && <span style={{marginLeft: '8px', fontSize: '12px'}}>•</span>}
              </>
            )}
          </button>
          
          <button 
            onClick={clearFilters}
            disabled={applyingFilters}
            style={{
              ...styles.filterBtn,
              ...styles.clearBtn,
              opacity: applyingFilters ? 0.6 : 1,
              cursor: applyingFilters ? 'not-allowed' : 'pointer'
            }}
            className="action-btn"
          >
            {applyingFilters ? 'Limpiando...' : '🧹 Limpiar Filtros'}
          </button>
          
          {hasFilterChanges() && (
            <div style={styles.filterIndicator}>
              <span style={styles.filterIndicatorText}>
                📝 Hay cambios sin aplicar
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPIs Principales con gradientes únicos */}
      {reporteData?.estadisticas_generales && (
        <div style={styles.kpiSection}>
          <h3 style={styles.sectionTitle}>📈 Indicadores Clave de Desempeño</h3>
          <div style={styles.kpiGrid}>
            <div style={{...styles.kpiCard, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}} className="stat-card">
              <div style={styles.kpiIcon}>🏛️</div>
              <div style={styles.kpiContent}>
                <div style={styles.kpiValue}>{reporteData.estadisticas_generales.total_facultades}</div>
                <div style={styles.kpiLabel}>Facultades Totales</div>
                <div style={styles.kpiSubtext}>En el sistema</div>
              </div>
            </div>
            
            <div style={{...styles.kpiCard, background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'}} className="stat-card">
              <div style={styles.kpiIcon}>📚</div>
              <div style={styles.kpiContent}>
                <div style={styles.kpiValue}>{reporteData.estadisticas_generales.total_carreras}</div>
                <div style={styles.kpiLabel}>Carreras Totales</div>
                <div style={styles.kpiSubtext}>Programas académicos</div>
              </div>
            </div>
            
            <div style={{...styles.kpiCard, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}} className="stat-card">
              <div style={styles.kpiIcon}>✅</div>
              <div style={styles.kpiContent}>
                <div style={styles.kpiValue}>{reporteData.estadisticas_generales.total_acreditadas}</div>
                <div style={styles.kpiLabel}>Carreras Acreditadas</div>
                <div style={styles.kpiSubtext}>Con certificación</div>
              </div>
            </div>
            
            <div style={{...styles.kpiCard, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}} className="stat-card">
              <div style={styles.kpiIcon}>🔄</div>
              <div style={styles.kpiContent}>
                <div style={styles.kpiValue}>{reporteData.estadisticas_generales.procesos_activos}</div>
                <div style={styles.kpiLabel}>Procesos Activos</div>
                <div style={styles.kpiSubtext}>En evaluación</div>
              </div>
            </div>
            
            <div style={{...styles.kpiCard, background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'}} className="stat-card">
              <div style={styles.kpiIcon}>🏆</div>
              <div style={styles.kpiContent}>
                <div style={styles.kpiValue}>{reporteData.estadisticas_generales.procesos_completados}</div>
                <div style={styles.kpiLabel}>Completados</div>
                <div style={styles.kpiSubtext}>Con éxito</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Gráficos Analíticos */}
      <div style={styles.chartsSection}>
        <h3 style={styles.sectionTitle}>📊 Análisis Visual de Datos</h3>
        <div style={styles.chartsGrid}>
          {/* Gráfico de Barras Comparativo */}
          <div style={styles.chartCard} className="chart-card">
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>📊 Comparativa de Acreditaciones</h3>
                <p style={styles.chartSubtitle}>Distribución por facultad</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analisisFacultades}>
                <defs>
                  <linearGradient id="colorCeub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="colorArcusur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="codigo_facultad" stroke="#64748b" style={{fontSize: '12px'}} />
                <YAxis stroke="#64748b" style={{fontSize: '12px'}} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: '13px', fontWeight: '600'}} />
                <Bar dataKey="ceub" fill="url(#colorCeub)" name="CEUB" radius={[8, 8, 0, 0]} />
                <Bar dataKey="arcusur" fill="url(#colorArcusur)" name="ARCU-SUR" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pastel */}
          <div style={styles.chartCard} className="chart-card">
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>🎯 Distribución Global</h3>
                <p style={styles.chartSubtitle}>Porcentaje de acreditaciones</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={styles.pieChartLegend}>
              {pieData.map((entry, index) => (
                <div key={index} style={styles.legendItem}>
                  <div style={{...styles.legendDot, backgroundColor: entry.color}}></div>
                  <span style={styles.legendText}>{entry.name}: <strong>{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Radar */}
          <div style={styles.chartCard} className="chart-card">
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>🕸️ Análisis Multidimensional</h3>
                <p style={styles.chartSubtitle}>Top 6 facultades</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="facultad" style={{fontSize: '11px'}} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Cobertura" dataKey="cobertura" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="CEUB" dataKey="ceub" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                <Radar name="ARCU-SUR" dataKey="arcusur" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Legend wrapperStyle={{fontSize: '13px'}} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico Compuesto - Comparativa Avanzada */}
          <div style={styles.chartCard} className="chart-card">
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>📈 Análisis Comparativo</h3>
                <p style={styles.chartSubtitle}>Acreditadas vs Sin acreditar</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={comparativaData}>
                <defs>
                  <linearGradient id="colorAcreditadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nombre" stroke="#64748b" style={{fontSize: '11px'}} />
                <YAxis stroke="#64748b" style={{fontSize: '12px'}} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: '13px'}} />
                <Bar dataKey="acreditadas" fill="url(#colorAcreditadas)" name="Acreditadas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sin_acreditar" fill="#cbd5e1" name="Sin Acreditar" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="porcentaje" stroke="#3b82f6" strokeWidth={3} name="% Cobertura" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Ranking Top 5 */}
          <div style={{...styles.chartCard, gridColumn: 'span 2'}} className="chart-card">
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.chartTitle}>🏆 Ranking de Excelencia</h3>
                <p style={styles.chartSubtitle}>Top 5 facultades por cobertura de acreditación</p>
              </div>
            </div>
            <div style={styles.rankingList}>
              {topFacultades.map((facultad, index) => (
                <div key={facultad.id} style={styles.rankingItem} className="ranking-item">
                  <div style={styles.rankingPosition}>
                    <span style={{
                      ...styles.rankingNumber,
                      background: index === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                                 index === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' :
                                 index === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #daa06d 100%)' :
                                 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      color: index <= 2 ? '#1e293b' : '#64748b'
                    }}>
                      {index + 1}
                    </span>
                    {index === 0 && <span style={styles.crownIcon}>👑</span>}
                  </div>
                  <div style={styles.rankingInfo}>
                    <div style={styles.rankingName}>{facultad.nombre_facultad}</div>
                    <div style={styles.rankingCode}>Código: {facultad.codigo_facultad}</div>
                    <div style={styles.rankingStats}>
                      <span className="metric-badge" style={styles.metricBadge}>
                        📚 {facultad.total_carreras} carreras
                      </span>
                      <span className="metric-badge" style={{...styles.metricBadge, backgroundColor: '#dbeafe', color: '#1e40af'}}>
                        🏅 CEUB: {facultad.ceub}
                      </span>
                      <span className="metric-badge" style={{...styles.metricBadge, backgroundColor: '#ede9fe', color: '#6b21a8'}}>
                        🎖️ ARCU-SUR: {facultad.arcusur}
                      </span>
                      <span className="metric-badge" style={{...styles.metricBadge, backgroundColor: '#d1fae5', color: '#065f46'}}>
                        ✅ Total: {facultad.carreras_acreditadas}
                      </span>
                    </div>
                  </div>
                  <div style={styles.rankingScore}>
                    <div style={{
                      ...styles.scoreCircle,
                      background: facultad.porcentaje_acreditacion >= 70 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                 facultad.porcentaje_acreditacion >= 40 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    }}>
                      <div style={styles.scoreValue}>{facultad.porcentaje_acreditacion}%</div>
                      <div style={styles.scoreLabel}>Cobertura</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matriz de Facultades */}
      <div style={styles.facultyMatrix}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>🏛️ Análisis Detallado por Facultad</h3>
            <p style={styles.sectionSubtitle}>Exploración completa de cada unidad académica</p>
          </div>
          <div style={styles.viewToggle}>
            <button 
              style={{...styles.toggleBtn, ...(activeTab === 'overview' ? styles.toggleBtnActive : {})}}
              onClick={() => setActiveTab('overview')}
            >
              📋 Vista General
            </button>
            <button 
              style={{...styles.toggleBtn, ...(activeTab === 'detailed' ? styles.toggleBtnActive : {})}}
              onClick={() => setActiveTab('detailed')}
            >
              🔍 Vista Detallada
            </button>
          </div>
        </div>

        <div style={styles.facultyGrid}>
          {analisisFacultades
            .sort((a, b) => b.porcentaje_acreditacion - a.porcentaje_acreditacion)
            .map((facultad, index) => (
            <div key={facultad.id} style={styles.facultyCard} className="faculty-card">
              <div style={styles.facultyRank}>#{index + 1}</div>
              
              <div style={styles.facultyHeader} onClick={() => toggleFacultyExpansion(facultad.id)}>
                <div style={styles.facultyInfo}>
                  <h4 style={styles.facultyName}>
                    <span style={styles.facultyIcon}>🏛️</span>
                    {facultad.nombre_facultad}
                  </h4>
                  <div style={styles.facultyMeta}>
                    <span style={styles.facultyCode}>📌 Código: {facultad.codigo_facultad}</span>
                    <span style={styles.facultyCarreras}>📚 {facultad.total_carreras} {facultad.total_carreras === 1 ? 'carrera' : 'carreras'}</span>
                  </div>
                </div>
                <div style={styles.expandIndicator}>
                  {expandedFaculties.has(facultad.id) ? '▼' : '▶'}
                </div>
              </div>
              
              <div style={styles.facultyStatsRow}>
                <div style={styles.statItemInline}>
                  <span style={styles.statBadge}>
                    <span style={styles.ceubColor}>●</span> CEUB
                  </span>
                  <strong style={styles.statNumber}>{facultad.ceub}</strong>
                </div>
                
                <div style={styles.statDivider}></div>
                
                <div style={styles.statItemInline}>
                  <span style={styles.statBadge}>
                    <span style={styles.arcusurColor}>●</span> ARCU-SUR
                  </span>
                  <strong style={styles.statNumber}>{facultad.arcusur}</strong>
                </div>
                
                <div style={styles.statDivider}></div>
                
                <div style={styles.statItemInline}>
                  <span style={styles.statBadge}>✅ Total</span>
                  <strong style={styles.statNumber}>{facultad.carreras_acreditadas}</strong>
                </div>
              </div>
              
              <div style={styles.coverageSection}>
                <div style={styles.coverageHeader}>
                  <span style={styles.coverageLabel}>Cobertura de Acreditación</span>
                  <span style={{
                    ...styles.coveragePercent,
                    color: facultad.porcentaje_acreditacion >= 70 ? '#10b981' : 
                           facultad.porcentaje_acreditacion >= 40 ? '#f59e0b' : '#ef4444'
                  }}>
                    {facultad.porcentaje_acreditacion}%
                  </span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${facultad.porcentaje_acreditacion}%`,
                    background: facultad.porcentaje_acreditacion >= 70 ? 
                      'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 
                      facultad.porcentaje_acreditacion >= 40 ? 
                      'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 
                      'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  }}></div>
                </div>
                <div style={styles.progressLabels}>
                  <span style={styles.progressLabel}>0%</span>
                  <span style={styles.progressLabel}>50%</span>
                  <span style={styles.progressLabel}>100%</span>
                </div>
              </div>

              {/* Mini gráfico de pastel para cada facultad */}
              <div style={styles.facultyMiniChart}>
                <div style={styles.miniChartHeader}>📊 Distribución Interna</div>
                <div style={styles.miniChartGrid}>
                  <div style={styles.miniChartItem}>
                    <div style={{...styles.miniChartBar, width: `${(facultad.ceub / facultad.total_carreras) * 100}%`, backgroundColor: '#0ea5e9'}}></div>
                    <span style={styles.miniChartLabel}>CEUB: {facultad.ceub}</span>
                  </div>
                  <div style={styles.miniChartItem}>
                    <div style={{...styles.miniChartBar, width: `${(facultad.arcusur / facultad.total_carreras) * 100}%`, backgroundColor: '#8b5cf6'}}></div>
                    <span style={styles.miniChartLabel}>ARCU-SUR: {facultad.arcusur}</span>
                  </div>
                  <div style={styles.miniChartItem}>
                    <div style={{...styles.miniChartBar, width: `${(facultad.sin_acreditar / facultad.total_carreras) * 100}%`, backgroundColor: '#94a3b8'}}></div>
                    <span style={styles.miniChartLabel}>Sin Acred.: {facultad.sin_acreditar}</span>
                  </div>
                </div>
              </div>

              {expandedFaculties.has(facultad.id) && (
                <div style={styles.carrerasSection}>
                  <div style={styles.carrerasSectionHeader}>
                    <h5 style={styles.carrerasTitle}>📋 Carreras de la Facultad</h5>
                    <span style={styles.carrerasCount}>
                      {facultyCarreras.get(facultad.id)?.length || 0} carreras
                    </span>
                  </div>
                  <CarrerasList facultadId={facultad.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer mejorado */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerMain}>
            <div style={styles.footerLogo}>
              <div style={styles.footerLogoIcon}>🎓</div>
              <div>
                <div style={styles.footerLogoText}>Sistema de Acreditación</div>
                <div style={styles.footerLogoSubtext}>Gestión Académica</div>
              </div>
            </div>
            <div style={styles.footerInfo}>
              <p style={styles.footerText}>
                📅 Reporte generado el {new Date().toLocaleDateString('es-BO', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p style={styles.footerSubtext}>
                Datos actualizados en tiempo real • Sistema de Gestión de Calidad Académica
              </p>
            </div>
          </div>
          <div style={styles.footerStats}>
            <div style={styles.footerStatItem}>
              <span style={styles.footerStatValue}>{analisisFacultades.length}</span>
              <span style={styles.footerStatLabel}>Facultades analizadas</span>
            </div>
            <div style={styles.footerStatItem}>
              <span style={styles.footerStatValue}>
                {analisisFacultades.reduce((sum, f) => sum + f.total_carreras, 0)}
              </span>
              <span style={styles.footerStatLabel}>Carreras totales</span>
            </div>
            <div style={styles.footerStatItem}>
              <span style={styles.footerStatValue}>
                {analisisFacultades.reduce((sum, f) => sum + f.carreras_acreditadas, 0)}
              </span>
              <span style={styles.footerStatLabel}>Acreditaciones activas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos completos del componente
const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    position: 'relative',
    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    borderRadius: '24px',
    padding: '56px 40px',
    marginBottom: '32px',
    boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)',
    overflow: 'hidden'
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
    pointerEvents: 'none'
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center'
  },
  mainTitle: {
    fontSize: '48px',
    fontWeight: '900',
    margin: '0 0 16px 0',
    color: 'white',
    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
    letterSpacing: '-1px'
  },
  subtitle: {
    fontSize: '20px',
    margin: '0 0 32px 0',
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
    letterSpacing: '0.5px'
  },
  headerStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    marginTop: '32px'
  },
  headerStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  headerStatValue: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'white',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
  },
  headerStatLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  headerStatDivider: {
    width: '2px',
    height: '60px',
    background: 'rgba(255,255,255,0.3)'
  },
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  filtersTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px'
  },
  filterCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '4px'
  },
  filterSelect: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    fontWeight: '600',
    color: '#334155'
  },
  actionButtonsContainer: {
    display: 'flex',
    gap: '12px'
  },
  actionBtn: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    color: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
  },
  excelBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  pdfBtn: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  kpiSection: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 20px 0',
    paddingLeft: '4px'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '8px 0 0 0',
    fontWeight: '500'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px'
  },
  kpiCard: {
    borderRadius: '20px',
    padding: '32px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    border: 'none'
  },
  kpiIcon: {
    fontSize: '56px',
    lineHeight: 1,
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
  },
  kpiContent: {
    flex: 1
  },
  kpiValue: {
    fontSize: '42px',
    fontWeight: '900',
    color: 'white',
    lineHeight: 1,
    marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
  },
  kpiLabel: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    letterSpacing: '0.3px',
    marginBottom: '4px'
  },
  kpiSubtext: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500'
  },
  chartsSection: {
    marginBottom: '32px'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '28px'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },
  chartHeader: {
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f1f5f9'
  },
  chartTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0'
  },
  chartSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    fontWeight: '500'
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: '14px 18px',
    borderRadius: '12px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
    border: '2px solid #e2e8f0'
  },
  tooltipLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 10px 0'
  },
  tooltipValue: {
    fontSize: '13px',
    fontWeight: '600',
    margin: '4px 0'
  },
  pieChartLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginTop: '24px',
    flexWrap: 'wrap'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  legendDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  legendText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569'
  },
  rankingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rankingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  rankingPosition: {
    flexShrink: 0,
    position: 'relative'
  },
  rankingNumber: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '900',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
  },
  crownIcon: {
    position: 'absolute',
    top: '-16px',
    right: '-12px',
    fontSize: '24px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
  },
  rankingInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  rankingName: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1e293b'
  },
  rankingCode: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },
  rankingStats: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  metricBadge: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: '#dbeafe',
    color: '#1e40af'
  },
  rankingScore: {
    flexShrink: 0
  },
  scoreCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
  },
  scoreValue: {
    fontSize: '22px',
    fontWeight: '900',
    color: 'white',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  scoreLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  facultyMatrix: {
    marginBottom: '32px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  viewToggle: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#f1f5f9',
    padding: '6px',
    borderRadius: '12px'
  },
  toggleBtn: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    color: '#64748b'
  },
  toggleBtnActive: {
    backgroundColor: 'white',
    color: '#3b82f6',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  facultyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '28px'
  },
  facultyCard: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  facultyRank: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '900',
    padding: '8px 16px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
  },
  facultyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingRight: '60px'
  },
  facultyInfo: {
    flex: 1
  },
  facultyName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  facultyIcon: {
    fontSize: '26px'
  },
  facultyMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  facultyCode: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },
  facultyCarreras: {
    fontSize: '15px',
    color: '#475569',
    fontWeight: '700'
  },
  expandIndicator: {
    fontSize: '20px',
    color: '#94a3b8',
    fontWeight: '700',
    padding: '8px',
    minWidth: '32px',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  facultyStatsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '14px',
    marginBottom: '24px'
  },
  statItemInline: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  statBadge: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  ceubColor: {
    color: '#0ea5e9',
    fontSize: '18px'
  },
  arcusurColor: {
    color: '#8b5cf6',
    fontSize: '18px'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#1e293b'
  },
  statDivider: {
    width: '2px',
    height: '60px',
    background: 'linear-gradient(180deg, transparent 0%, #cbd5e1 50%, transparent 100%)'
  },
  coverageSection: {
    marginTop: '20px'
  },
  coverageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  coverageLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '700'
  },
  coveragePercent: {
    fontSize: '26px',
    fontWeight: '900'
  },
  progressTrack: {
    width: '100%',
    height: '16px',
    backgroundColor: '#e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    transition: 'width 1s ease',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px'
  },
  progressLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '600'
  },
  facultyMiniChart: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  miniChartHeader: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '16px'
  },
  miniChartGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  miniChartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  miniChartBar: {
    height: '24px',
    borderRadius: '6px',
    transition: 'width 0.8s ease',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    minWidth: '20px'
  },
  miniChartLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    minWidth: '100px'
  },
  carrerasSection: {
    marginTop: '28px',
    paddingTop: '28px',
    borderTop: '2px solid #f1f5f9'
  },
  carrerasSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  carrerasTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  carrerasCount: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)',
    padding: '8px 14px',
    borderRadius: '10px'
  },
  carrerasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  carreraItem: {
    padding: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s'
  },
  carreraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  carreraName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  carreraIcon: {
    fontSize: '20px'
  },
  carreraBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'flex-start'
  },
  acredBadge: {
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '100px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  ceubBadge: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    color: '#1e40af',
    border: '2px solid #60a5fa'
  },
  arcusurBadge: {
    background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
    color: '#6b21a8',
    border: '2px solid #a78bfa'
  },
  noneBadge: {
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    color: '#475569',
    border: '2px solid #cbd5e1'
  },
  badgeDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '4px',
    fontSize: '10px',
    opacity: 0.9,
    fontWeight: '600'
  },
  carrerasLoading: {
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    color: '#64748b'
  },
  carrerasEmpty: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '15px',
    fontWeight: '600'
  },
  spinner: {
    width: '56px',
    height: '56px',
    border: '5px solid #f1f5f9',
    borderTop: '5px solid #667eea',
    borderRadius: '50%'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '600px',
    gap: '24px'
  },
  loadingText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  loadingSubtext: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '600px',
    gap: '24px',
    padding: '60px'
  },
  errorIcon: {
    fontSize: '80px'
  },
  errorTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  errorMessage: {
    fontSize: '18px',
    color: '#64748b',
    margin: 0,
    textAlign: 'center'
  },
  retryButton: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '16px',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
  },
  footer: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    borderTop: '2px solid #e2e8f0',
    marginTop: '48px',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.06)'
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  footerMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '32px'
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  footerLogoIcon: {
    fontSize: '48px',
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
  },
  footerLogoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 1.2
  },
  footerLogoSubtext: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  footerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  footerText: {
    color: '#475569',
    fontSize: '15px',
    fontWeight: '600',
    margin: 0
  },
  footerSubtext: {
    color: '#94a3b8',
    fontSize: '13px',
    margin: 0,
    fontWeight: '500'
  },
  footerStats: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '32px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    flexWrap: 'wrap'
  },
  footerStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  footerStatValue: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#3b82f6'
  },
  footerStatLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  // Nuevos estilos para los botones de filtros
  filterButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  applyBtn: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  clearBtn: {
    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
  },
  filterIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    marginLeft: 'auto'
  },
  filterIndicatorText: {
    fontSize: '12px',
    color: '#d97706',
    fontWeight: '600'
  }
};

export default ReporteFacultades;