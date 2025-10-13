import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getFacultades, getCarrerasByFacultad } from '../services/api';

const ReporteFacultades = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('todos');
  const [selectedFacultad, setSelectedFacultad] = useState('todas');
  const [expandedFaculties, setExpandedFaculties] = useState(new Set());
  const [facultades, setFacultades] = useState([]);
  const [facultyCarreras, setFacultyCarreras] = useState(new Map());
  const [loadingCarreras, setLoadingCarreras] = useState(new Set());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadFacultades();
  }, []);

  const loadFacultades = async () => {
    try {
      setLoading(true);
      const data = await getFacultades();
      setFacultades(data || []);
    } catch (error) {
      console.error('Error cargando facultades:', error);
      setFacultades([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCarrerasByFacultad = async (facultadId) => {
    if (facultyCarreras.has(facultadId) || loadingCarreras.has(facultadId)) {
      return;
    }

    setLoadingCarreras(prev => new Set([...prev, facultadId]));
    
    try {
      const carreras = await getCarrerasByFacultad(facultadId);
      
      // Simular datos de acreditación para visualización
      const carrerasConAcreditacion = carreras.map(carrera => ({
        ...carrera,
        acreditaciones: {
          ceub: Math.random() > 0.6 ? {
            estado: 'activa',
            fecha_vencimiento: new Date(2025 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
            fase_actual: `Fase ${Math.floor(Math.random() * 4) + 1}`
          } : null,
          arcusur: Math.random() > 0.7 ? {
            estado: 'activa',
            fecha_vencimiento: new Date(2025 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
            fase_actual: `Fase ${Math.floor(Math.random() * 3) + 1}`
          } : null
        }
      }));

      setFacultyCarreras(prev => new Map([...prev, [facultadId, carrerasConAcreditacion]]));
    } catch (error) {
      console.error(`Error cargando carreras de facultad ${facultadId}:`, error);
      setFacultyCarreras(prev => new Map([...prev, [facultadId, []]]));
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
    const baseMultiplier = selectedYear === 'todos' ? 1.5 : 1;
    
    return facultades
      .filter(f => selectedFacultad === 'todas' || f.id.toString() === selectedFacultad)
      .map((facultad, index) => {
        const carreras = facultyCarreras.get(facultad.id) || [];
        const ceub = carreras.filter(c => c.acreditaciones?.ceub).length;
        const arcusur = carreras.filter(c => c.acreditaciones?.arcusur).length;
        const factorRendimiento = [0.7, 0.8, 0.5, 0.75, 0.4, 0.6][index % 6];
        const total = Math.max(Math.floor(carreras.length * baseMultiplier * factorRendimiento), 1);
        const acreditadas = ceub + arcusur;
        
        return {
          ...facultad,
          total_carreras: total,
          carreras_acreditadas: acreditadas,
          ceub: ceub,
          arcusur: arcusur,
          porcentaje_acreditacion: total > 0 ? Math.round((acreditadas / total) * 100) : 0
        };
      });
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
          <div style={styles.spinner}></div>
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
                {carrera.acreditaciones?.ceub && (
                  <div style={{...styles.acredBadge, ...styles.ceubBadge}}>
                    <span>CEUB</span>
                    <div style={styles.badgeDetails}>
                      <small>Hasta: {new Date(carrera.acreditaciones.ceub.fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      <small>{carrera.acreditaciones.ceub.fase_actual}</small>
                    </div>
                  </div>
                )}
                {carrera.acreditaciones?.arcusur && (
                  <div style={{...styles.acredBadge, ...styles.arcusurBadge}}>
                    <span>ARCU-SUR</span>
                    <div style={styles.badgeDetails}>
                      <small>Hasta: {new Date(carrera.acreditaciones.arcusur.fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      <small>{carrera.acreditaciones.arcusur.fase_actual}</small>
                    </div>
                  </div>
                )}
                {!carrera.acreditaciones?.ceub && !carrera.acreditaciones?.arcusur && (
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
        <div style={styles.spinner}></div>
        <h2>Cargando Reporte de Facultades...</h2>
      </div>
    );
  }

  const analisisFacultades = getAnalisisFacultades();

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
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
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
            <button onClick={exportToExcel} style={{...styles.actionBtn, ...styles.excelBtn}}>
              📊 Exportar Excel
            </button>
            <button onClick={exportToPDF} style={{...styles.actionBtn, ...styles.pdfBtn}}>
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </div>

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
                <div style={{...styles.facultyIcon, backgroundColor: COLORS[index % COLORS.length]}}>
                  {facultad.codigo_facultad}
                </div>
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
                  <div style={styles.statValue}>{facultad.ceub}</div>
                  <div style={styles.statLabel}>CEUB</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{facultad.arcusur}</div>
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
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
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
  facultyIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px'
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
  badgeDetails: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '2px',
    fontSize: '9px'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    fontSize: '14px'
  }
};

export default ReporteFacultades;