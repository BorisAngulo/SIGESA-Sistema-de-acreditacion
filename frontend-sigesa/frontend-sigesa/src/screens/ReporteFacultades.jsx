import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getFacultades, getCarrerasByFacultad, getReporteFacultades, getEstadisticasFacultad } from '../services/api';

// Estilos CSS para animaciones
const styles_css = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .faculty-card:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
  }
  
  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`;

// Inyectar estilos CSS
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
  const [selectedYear, setSelectedYear] = useState('todos');
  const [selectedFacultad, setSelectedFacultad] = useState('todas');
  const [selectedModalidad, setSelectedModalidad] = useState('todas');

  const [expandedFaculties, setExpandedFaculties] = useState(new Set());
  const [facultades, setFacultades] = useState([]);
  const [reporteData, setReporteData] = useState(null);
  const [facultyCarreras, setFacultyCarreras] = useState(new Map());
  const [loadingCarreras, setLoadingCarreras] = useState(new Set());
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadReporteData();
  }, [selectedYear, selectedModalidad]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar facultades
      const facultadesData = await getFacultades();
      setFacultades(facultadesData || []);
      
      // Cargar reporte inicial
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
      
      if (selectedYear && selectedYear !== 'todos') {
        filters.year = selectedYear;
      }
      
      if (selectedModalidad && selectedModalidad !== 'todas') {
        filters.modalidad_id = selectedModalidad;
      }

      console.log('🔍 Cargando reporte con filtros:', filters);
      
      const reporteResponse = await getReporteFacultades(filters);
      console.log('✅ Reporte cargado:', reporteResponse);
      
      setReporteData(reporteResponse);
    } catch (error) {
      console.error('❌ Error cargando reporte:', error);
      setError('Error al cargar el reporte de facultades');
    }
  };

  const loadCarrerasByFacultad = async (facultadId) => {
    if (facultyCarreras.has(facultadId) || loadingCarreras.has(facultadId)) {
      return;
    }

    setLoadingCarreras(prev => new Set([...prev, facultadId]));
    
    try {
      // Obtener estadísticas detalladas de la facultad
      const filters = {};
      if (selectedYear && selectedYear !== 'todos') {
        filters.year = selectedYear;
      }
      if (selectedModalidad && selectedModalidad !== 'todas') {
        filters.modalidad_id = selectedModalidad;
      }

      const estadisticas = await getEstadisticasFacultad(facultadId, filters);
      console.log(`📊 Estadísticas para facultad ${facultadId}:`, estadisticas);
      
      // Usar las carreras del reporte con estadísticas detalladas
      const carrerasDetalladas = estadisticas?.carreras || [];
      
      setFacultyCarreras(prev => new Map([...prev, [facultadId, carrerasDetalladas]]));
    } catch (error) {
      console.error(`Error cargando estadísticas de facultad ${facultadId}:`, error);
      
      // Fallback: intentar cargar carreras básicas
      try {
        const carreras = await getCarrerasByFacultad(facultadId);
        const carrerasBasicas = carreras.map(carrera => ({
          ...carrera,
          acreditaciones: {
            ceub: null,
            arcusur: null
          }
        }));
        setFacultyCarreras(prev => new Map([...prev, [facultadId, carrerasBasicas]]));
      } catch (fallbackError) {
        console.error(`Error en fallback para facultad ${facultadId}:`, fallbackError);
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
    if (!reporteData || !reporteData.facultades) {
      console.log('⚠️ No hay datos de reporte disponibles');
      return [];
    }

    const facultadesData = reporteData.facultades
      .filter(f => selectedFacultad === 'todas' || f.id.toString() === selectedFacultad)
      .map(facultad => ({
        ...facultad,
        total_carreras: facultad.total_carreras || 0,
        carreras_acreditadas: (facultad.ceub_total || 0) + (facultad.arcusur_total || 0),
        ceub: facultad.ceub_total || 0,
        arcusur: facultad.arcusur_total || 0,
        porcentaje_acreditacion: facultad.porcentaje_cobertura || 0
      }));

    console.log('📊 Análisis de facultades procesado:', facultadesData);
    return facultadesData;
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
        scale: 1.2,
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
      return (
        <div style={styles.carrerasEmpty}>
          <span>No se encontraron carreras</span>
        </div>
      );
    }

    return (
      <div style={styles.carrerasList}>
        {carreras.map(carrera => (
          <div key={carrera.id} style={styles.carreraItem}>
            <div style={styles.carreraHeader}>
              <div style={styles.carreraName}>
                <span style={styles.carreraIcon}>📚</span>
                {carrera.nombre_carrera}
              </div>
              <div style={styles.carreraBadges}>
                {/* Acreditación CEUB */}
                {carrera.acreditaciones.ceub && (
                  <div style={{...styles.acredBadge, ...styles.ceubBadge}}>
                    <span>CEUB</span>
                    <div style={styles.badgeDetails}>
                      {carrera.acreditaciones.ceub.fecha_vencimiento && (
                        <small>Hasta: {new Date(carrera.acreditaciones.ceub.fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      )}
                      {carrera.acreditaciones.ceub.estado && (
                        <small>{carrera.acreditaciones.ceub.estado}</small>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Acreditación ARCUSUR */}
                {carrera.acreditaciones.arcusur && (
                  <div style={{...styles.acredBadge, ...styles.arcusurBadge}}>
                    <span>ARCU-SUR</span>
                    <div style={styles.badgeDetails}>
                      {carrera.acreditaciones.arcusur.fecha_vencimiento && (
                        <small>Hasta: {new Date(carrera.acreditaciones.arcusur.fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      )}
                      {carrera.acreditaciones.arcusur.estado && (
                        <small>{carrera.acreditaciones.arcusur.estado}</small>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Sin acreditación */}
                {!carrera.ceub_activa && !carrera.arcusur_activa && (
                  <div style={{...styles.acredBadge, ...styles.noneBadge}}>
                    <span>Sin acreditación</span>
                  </div>
                )}
                
                {/* Procesos en curso */}
                {carrera.procesos_en_curso > 0 && (
                  <div style={{...styles.acredBadge, ...styles.procesoBadge}}>
                    <span>En proceso ({carrera.procesos_en_curso})</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Información adicional de la carrera */}
            {carrera.modalidades && carrera.modalidades.length > 0 && (
              <div style={styles.carreraModalidades}>
                <small>Modalidades: {carrera.modalidades.map(m => m.nombre_modalidad).join(', ')}</small>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={styles.spinner}></div>
        <h2>Cargando Reporte de Facultades...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Error al cargar el reporte</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button 
          onClick={loadInitialData} 
          style={styles.retryButton}
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  const analisisFacultades = getAnalisisFacultades();
  
  // Log para depuración
  console.log('🔍 Estado actual del componente:', {
    loading,
    error,
    reporteData,
    analisisFacultades: analisisFacultades.length,
    filtros: { selectedYear, selectedModalidad, selectedFacultad }
  });

  return (
    <div className="reporte-container" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>Reporte de Facultades</h1>
        <p style={styles.subtitle}>Análisis de Acreditación por Facultad</p>
      </div>

      <div style={styles.filtersSection}>
        <div style={styles.filtersContent}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>📅 Año</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="todos">Todos los Años</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>🎯 Modalidad</label>
            <select 
              value={selectedModalidad} 
              onChange={(e) => setSelectedModalidad(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="todas">Todas las Modalidades</option>
              <option value="1">Presencial</option>
              <option value="2">Semipresencial</option>
              <option value="3">A Distancia</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>🏛️ Facultad</label>
            <select 
              value={selectedFacultad} 
              onChange={(e) => setSelectedFacultad(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="todas">Todas las Facultades</option>
              {facultades.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nombre_facultad}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.actionButtons}>
            <button onClick={exportToExcel} style={{...styles.actionBtn, ...styles.excelBtn}} className="action-btn">
              📊 Exportar Excel
            </button>
            <button onClick={exportToPDF} style={{...styles.actionBtn, ...styles.pdfBtn}} className="action-btn">
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      {reporteData && reporteData.estadisticas_generales && (
        <div style={styles.statsSection}>
          <h3 style={styles.sectionTitle}>Resumen General del Sistema</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIcon}>🏛️</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{reporteData.estadisticas_generales.total_facultades}</div>
                <div style={styles.statLabel}>Facultades Totales</div>
              </div>
            </div>
            
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIcon}>📚</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{reporteData.estadisticas_generales.total_carreras}</div>
                <div style={styles.statLabel}>Carreras Totales</div>
              </div>
            </div>
            
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIcon}>✅</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{reporteData.estadisticas_generales.total_acreditadas}</div>
                <div style={styles.statLabel}>Carreras Acreditadas</div>
              </div>
            </div>
            
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIcon}>🔄</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{reporteData.estadisticas_generales.procesos_activos}</div>
                <div style={styles.statLabel}>Procesos en Curso</div>
              </div>
            </div>
            
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIcon}>🏆</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{reporteData.estadisticas_generales.procesos_completados}</div>
                <div style={styles.statLabel}>Procesos Completados</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.chartSection}>
        <h3 style={styles.sectionTitle}>Distribución de Acreditaciones</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analisisFacultades}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="codigo_facultad" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ceub" fill="#f59e0b" name="CEUB" />
            <Bar dataKey="arcusur" fill="#ef4444" name="ARCU-SUR" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.facultyMatrix}>
        <h3 style={styles.sectionTitle}>Análisis Detallado por Facultad</h3>
        <div style={styles.facultyGrid}>
          {analisisFacultades
            .sort((a, b) => b.porcentaje_acreditacion - a.porcentaje_acreditacion)
            .map((facultad, index) => (
            <div key={facultad.id} style={styles.facultyCard}>
              <div 
                style={styles.facultyHeader}
                onClick={() => toggleFacultyExpansion(facultad.id)}
              >
                <div style={styles.facultyInfo}>
                  <h4 style={styles.facultyName}>{facultad.nombre_facultad}</h4>
                  <div style={styles.facultySubtitle}>{facultad.total_carreras} carreras</div>
                </div>
                <div style={styles.expandIndicator}>
                  {expandedFaculties.has(facultad.id) ? '▼' : '▶'}
                </div>
              </div>
              
              <div style={styles.facultyStats}>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{facultad.acreditaciones_ceub}</div>
                  <div style={styles.statLabel}>CEUB</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{facultad.acreditaciones_arcusur}</div>
                  <div style={styles.statLabel}>ARCU-SUR</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{facultad.porcentaje_acreditacion}%</div>
                  <div style={styles.statLabel}>Cobertura</div>
                </div>
              </div>
              
              <div style={styles.facultyProgress}>
                <div style={styles.progressTrack}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${facultad.porcentaje_acreditacion}%`,
                      backgroundColor: facultad.porcentaje_acreditacion >= 70 ? '#10b981' : 
                                     facultad.porcentaje_acreditacion >= 40 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
              </div>

              {expandedFaculties.has(facultad.id) && (
                <div style={styles.carrerasSection}>
                  <h5 style={styles.carrerasTitle}>Carreras de la Facultad</h5>
                  <CarrerasList facultadId={facultad.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <p>Reporte generado el {new Date().toLocaleDateString('es-BO')}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b'
  },
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  filtersContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155'
  },
  filterSelect: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end'
  },
  actionBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  excelBtn: {
    backgroundColor: '#10b981',
    color: 'white'
  },
  pdfBtn: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  chartSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px'
  },
  facultyMatrix: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  facultyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  facultyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid #e2e8f0',
    transition: 'all 0.2s'
  },
  facultyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    cursor: 'pointer'
  },
  facultyInfo: {
    flex: 1
  },
  facultyName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  facultySubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },
  expandIndicator: {
    fontSize: '12px',
    color: '#64748b'
  },
  facultyStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },
  statItem: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  },
  facultyProgress: {
    marginTop: '12px'
  },
  progressTrack: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  carrerasSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  carrerasTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '12px'
  },
  carrerasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  carrerasLoading: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b'
  },
  carrerasEmpty: {
    textAlign: 'center',
    padding: '20px',
    color: '#94a3b8'
  },
  carreraItem: {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },
  carreraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  carreraName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  carreraIcon: {
    fontSize: '16px'
  },
  carreraBadges: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  acredBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  ceubBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fbbf24'
  },
  arcusurBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #f87171'
  },
  noneBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1'
  },
  procesoBadge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    border: '1px solid #3b82f6'
  },
  badgeDetails: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '2px',
    fontSize: '9px'
  },
  carreraModalidades: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0',
    color: '#64748b'
  },
  // Estilos para estadísticas generales
  statsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  statIcon: {
    fontSize: '24px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: '8px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: '1'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  },
  // Estilos para manejo de errores
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    padding: '24px'
  },
  errorIcon: {
    fontSize: '48px'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#dc2626',
    margin: 0
  },
  errorMessage: {
    fontSize: '16px',
    color: '#64748b',
    textAlign: 'center',
    maxWidth: '400px'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    fontSize: '14px'
  }
};

export default ReporteFacultades;