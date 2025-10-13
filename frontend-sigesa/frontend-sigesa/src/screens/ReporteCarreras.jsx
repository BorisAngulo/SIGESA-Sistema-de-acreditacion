import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getFacultades, getCarreras, getModalidades } from '../services/api';

const ReporteCarreras = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('todos');
  const [selectedFacultad, setSelectedFacultad] = useState('todas');
  const [selectedModalidad, setSelectedModalidad] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [modalidades, setModalidades] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facultadesData, carrerasData, modalidadesData] = await Promise.all([
        getFacultades(),
        getCarreras(),
        getModalidades()
      ]);
      
      setFacultades(facultadesData || []);
      setCarreras(carrerasData || []);
      setModalidades(modalidadesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCarrerasConAcreditacion = () => {
    return carreras
      .filter(c => {
        if (selectedFacultad !== 'todas' && c.facultad_id?.toString() !== selectedFacultad) return false;
        if (searchTerm && !c.nombre_carrera.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .map(carrera => {
        // Simular estado de acreditación
        const tieneCeub = Math.random() > 0.5;
        const tieneArcusur = Math.random() > 0.7;
        
        return {
          ...carrera,
          facultad: facultades.find(f => f.id === carrera.facultad_id)?.nombre_facultad || 'N/A',
          acreditaciones: {
            ceub: tieneCeub ? {
              estado: 'activa',
              fecha_inicio: '2023-01-15',
              fecha_vencimiento: '2026-01-15',
              fase_actual: `Fase ${Math.floor(Math.random() * 4) + 1}`
            } : null,
            arcusur: tieneArcusur ? {
              estado: 'activa',
              fecha_inicio: '2023-06-01',
              fecha_vencimiento: '2026-06-01',
              fase_actual: `Fase ${Math.floor(Math.random() * 3) + 1}`
            } : null
          }
        };
      });
  };

  const getEstadisticas = () => {
    const carrerasConData = getCarrerasConAcreditacion();
    const conCeub = carrerasConData.filter(c => c.acreditaciones.ceub).length;
    const conArcusur = carrerasConData.filter(c => c.acreditaciones.arcusur).length;
    const sinAcreditacion = carrerasConData.filter(c => !c.acreditaciones.ceub && !c.acreditaciones.arcusur).length;
    
    return {
      total: carrerasConData.length,
      conCeub,
      conArcusur,
      sinAcreditacion,
      porcentajeAcreditadas: carrerasConData.length > 0 ? 
        Math.round(((conCeub + conArcusur) / carrerasConData.length) * 100) : 0
    };
  };

  const getDistribucionPorFacultad = () => {
    const carrerasConData = getCarrerasConAcreditacion();
    const distribucion = {};
    
    carrerasConData.forEach(carrera => {
      const facultad = carrera.facultad;
      if (!distribucion[facultad]) {
        distribucion[facultad] = { total: 0, ceub: 0, arcusur: 0 };
      }
      distribucion[facultad].total++;
      if (carrera.acreditaciones.ceub) distribucion[facultad].ceub++;
      if (carrera.acreditaciones.arcusur) distribucion[facultad].arcusur++;
    });
    
    return Object.entries(distribucion).map(([facultad, data]) => ({
      facultad,
      ...data
    }));
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const carrerasData = getCarrerasConAcreditacion();
      
      const headers = ['Carrera', 'Facultad', 'CEUB', 'Fase CEUB', 'ARCU-SUR', 'Fase ARCU-SUR', 'Estado'];
      const data = carrerasData.map(c => [
        c.nombre_carrera,
        c.facultad,
        c.acreditaciones.ceub ? 'Sí' : 'No',
        c.acreditaciones.ceub?.fase_actual || 'N/A',
        c.acreditaciones.arcusur ? 'Sí' : 'No',
        c.acreditaciones.arcusur?.fase_actual || 'N/A',
        (c.acreditaciones.ceub || c.acreditaciones.arcusur) ? 'Acreditada' : 'Sin acreditación'
      ]);
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      XLSX.utils.book_append_sheet(wb, ws, 'Carreras');
      
      // Hoja de estadísticas
      const stats = getEstadisticas();
      const statsData = [
        ['Indicador', 'Valor'],
        ['Total Carreras', stats.total],
        ['Con CEUB', stats.conCeub],
        ['Con ARCU-SUR', stats.conArcusur],
        ['Sin Acreditación', stats.sinAcreditacion],
        ['% Acreditadas', stats.porcentajeAcreditadas + '%']
      ];
      const wsStats = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
      
      XLSX.writeFile(wb, `Reporte_Carreras_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.xlsx`);
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
      pdf.save(`Reporte_Carreras_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      alert('Error al exportar a PDF');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2>Cargando Reporte de Carreras...</h2>
      </div>
    );
  }

  const carrerasConAcreditacion = getCarrerasConAcreditacion();
  const estadisticas = getEstadisticas();
  const distribucionPorFacultad = getDistribucionPorFacultad();

  return (
    <div className="reporte-container" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>Reporte de Carreras</h1>
        <p style={styles.subtitle}>Análisis Detallado de Acreditación por Carrera</p>
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

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>🎯 Modalidad</label>
            <select 
              value={selectedModalidad} 
              onChange={(e) => setSelectedModalidad(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="todas">Todas las Modalidades</option>
              {modalidades.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nombre_modalidad}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>🔍 Buscar Carrera</label>
            <input
              type="text"
              placeholder="Nombre de carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
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

      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeft: '4px solid #3b82f6'}}>
          <div style={styles.statValue}>{estadisticas.total}</div>
          <div style={styles.statLabel}>Total Carreras</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #f59e0b'}}>
          <div style={styles.statValue}>{estadisticas.conCeub}</div>
          <div style={styles.statLabel}>Con CEUB</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #ef4444'}}>
          <div style={styles.statValue}>{estadisticas.conArcusur}</div>
          <div style={styles.statLabel}>Con ARCU-SUR</div>
        </div>
        <div style={{...styles.statCard, borderLeft: '4px solid #64748b'}}>
          <div style={styles.statValue}>{estadisticas.sinAcreditacion}</div>
          <div style={styles.statLabel}>Sin Acreditación</div>
        </div>
      </div>

      <div style={styles.chartSection}>
        <h3 style={styles.sectionTitle}>Distribución por Facultad</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distribucionPorFacultad}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="facultad" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ceub" fill="#f59e0b" name="CEUB" />
            <Bar dataKey="arcusur" fill="#ef4444" name="ARCU-SUR" />
            <Bar dataKey="total" fill="#94a3b8" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>
          Listado de Carreras ({carrerasConAcreditacion.length})
        </h3>
        
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Carrera</th>
                <th style={styles.th}>Facultad</th>
                <th style={styles.th}>CEUB</th>
                <th style={styles.th}>ARCU-SUR</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {carrerasConAcreditacion.map((carrera, index) => (
                <tr key={carrera.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                  <td style={styles.td}>
                    <div style={styles.carreraCell}>
                      <span style={styles.carreraIcon}>📚</span>
                      <div>
                        <div style={styles.carreraNombre}>{carrera.nombre_carrera}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{carrera.facultad}</td>
                  <td style={styles.tdCenter}>
                    {carrera.acreditaciones.ceub ? (
                      <div style={styles.acredInfo}>
                        <span style={{...styles.badge, ...styles.ceubBadge}}>Activa</span>
                        <small style={styles.faseText}>{carrera.acreditaciones.ceub.fase_actual}</small>
                        <small style={styles.dateText}>
                          Vence: {new Date(carrera.acreditaciones.ceub.fecha_vencimiento).toLocaleDateString('es-BO')}
                        </small>
                      </div>
                    ) : (
                      <span style={{...styles.badge, ...styles.inactiveBadge}}>No</span>
                    )}
                  </td>
                  <td style={styles.tdCenter}>
                    {carrera.acreditaciones.arcusur ? (
                      <div style={styles.acredInfo}>
                        <span style={{...styles.badge, ...styles.arcusurBadge}}>Activa</span>
                        <small style={styles.faseText}>{carrera.acreditaciones.arcusur.fase_actual}</small>
                        <small style={styles.dateText}>
                          Vence: {new Date(carrera.acreditaciones.arcusur.fecha_vencimiento).toLocaleDateString('es-BO')}
                        </small>
                      </div>
                    ) : (
                      <span style={{...styles.badge, ...styles.inactiveBadge}}>No</span>
                    )}
                  </td>
                  <td style={styles.tdCenter}>
                    {(carrera.acreditaciones.ceub || carrera.acreditaciones.arcusur) ? (
                      <span style={{...styles.statusBadge, ...styles.activaStatus}}>Acreditada</span>
                    ) : (
                      <span style={{...styles.statusBadge, ...styles.inactivaStatus}}>Sin Acreditación</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.footer}>
        <p>Reporte generado el {new Date().toLocaleDateString('es-BO')}</p>
        <p style={styles.footerDetails}>
          Total de carreras analizadas: {carrerasConAcreditacion.length}
        </p>
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
    gap: '16px',
    marginBottom: '16px'
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
  searchInput: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '16px',
    color: '#475569'
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
  tableSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569'
  },
  evenRow: {
    backgroundColor: '#ffffff'
  },
  oddRow: {
    backgroundColor: '#f8fafc'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #e5e7eb'
  },
  tdCenter: {
    padding: '12px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  carreraCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  carreraIcon: {
    fontSize: '18px'
  },
  carreraNombre: {
    fontWeight: '500',
    color: '#1e293b'
  },
  acredInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'center'
  },
  faseText: {
    fontSize: '12px',
    color: '#64748b'
  },
  dateText: {
    fontSize: '11px',
    color: '#94a3b8'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  ceubBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  arcusurBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  inactiveBadge: {
    backgroundColor: '#f1f5f9',
    color: '#64748b'
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500'
  },
  activaStatus: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  inactivaStatus: {
    backgroundColor: '#f1f5f9',
    color: '#475569'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    fontSize: '14px'
  },
  footerDetails: {
    marginTop: '8px',
    fontSize: '12px'
  }
};

export default ReporteCarreras;