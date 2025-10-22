
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getModalidades, getFacultades, getCarreras } from '../services/api';

const ReporteModalidades = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('todos');
  const [selectedModalidad, setSelectedModalidad] = useState('todas');
  
  const [modalidades, setModalidades] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [carreras, setCarreras] = useState([]);

  const COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modalidadesData, facultadesData, carrerasData] = await Promise.all([
        getModalidades(),
        getFacultades(),
        getCarreras()
      ]);
      
      console.log('Modalidades cargadas:', modalidadesData);
      console.log('Facultades cargadas:', facultadesData);
      console.log('Carreras cargadas:', carrerasData);
      
      setModalidades(modalidadesData || []);
      setFacultades(facultadesData || []);
      setCarreras(carrerasData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgresoModalidades = () => {
    const baseMultiplier = selectedYear === 'todos' ? 2.5 : 1;
    const totalCarreras = carreras.length || 15;
    
    const modalidadesFiltradas = modalidades.filter(m => {
      if (selectedModalidad === 'todas') return true;
      return m.id.toString() === selectedModalidad;
    });
    
    return modalidadesFiltradas.map(modalidad => {
      let factorModalidad = 1;
      const nombreUpper = modalidad.nombre_modalidad.toUpperCase();
      
      if (nombreUpper.includes('CEUB')) {
        factorModalidad = 0.65;
      } else if (nombreUpper.includes('ARCU')) {
        factorModalidad = 0.45;
      }
      
      const totalCarrerasModalidad = Math.max(Math.floor(totalCarreras * baseMultiplier * factorModalidad), 1);
      const carrerasActivas = Math.floor(totalCarrerasModalidad * 0.7);
      const carrerasEnProceso = Math.floor(totalCarrerasModalidad * 0.2);
      const carrerasPausadas = totalCarrerasModalidad - carrerasActivas - carrerasEnProceso;
      const porcentajeCompletado = Math.round((carrerasActivas / totalCarrerasModalidad) * 100);
      
      return {
        ...modalidad,
        total_carreras: totalCarrerasModalidad,
        carreras_activas: carrerasActivas,
        carreras_en_proceso: carrerasEnProceso,
        carreras_pausadas: carrerasPausadas,
        porcentaje_completado: porcentajeCompletado
      };
    });
  };

  const getDistribucionEstados = () => {
    const progreso = getProgresoModalidades();
    const totales = progreso.reduce((acc, m) => {
      acc.activas += m.carreras_activas;
      acc.enProceso += m.carreras_en_proceso;
      acc.pausadas += m.carreras_pausadas;
      return acc;
    }, { activas: 0, enProceso: 0, pausadas: 0 });
    
    return [
      { name: 'Activas', value: totales.activas, color: '#10b981' },
      { name: 'En Proceso', value: totales.enProceso, color: '#f59e0b' },
      { name: 'Pausadas', value: totales.pausadas, color: '#ef4444' }
    ];
  };

  const getTendenciasTemporales = () => {
    const years = [
      { año: '2021', CEUB: 5, 'ARCU-SUR': 3, total: 8 },
      { año: '2022', CEUB: 7, 'ARCU-SUR': 5, total: 12 },
      { año: '2023', CEUB: 9, 'ARCU-SUR': 6, total: 15 },
      { año: '2024', CEUB: 12, 'ARCU-SUR': 8, total: 20 }
    ];
    
    if (selectedYear !== 'todos') {
      return years.filter(y => y.año === selectedYear);
    }
    
    if (selectedModalidad !== 'todas') {
      const modalidadSeleccionada = modalidades.find(m => m.id.toString() === selectedModalidad);
      if (modalidadSeleccionada) {
        const nombreUpper = modalidadSeleccionada.nombre_modalidad.toUpperCase();
        
        return years.map(y => {
          const result = { año: y.año };
          
          if (nombreUpper.includes('CEUB')) {
            result[modalidadSeleccionada.nombre_modalidad] = y.CEUB;
            result.total = y.CEUB;
          } else if (nombreUpper.includes('ARCU')) {
            result[modalidadSeleccionada.nombre_modalidad] = y['ARCU-SUR'];
            result.total = y['ARCU-SUR'];
          } else {
            result[modalidadSeleccionada.nombre_modalidad] = Math.floor(y.total / 2);
            result.total = Math.floor(y.total / 2);
          }
          
          return result;
        });
      }
    }
    
    return years;
  };

  const getComparativaFacultades = () => {
    const progreso = getProgresoModalidades();
    
    if (!facultades || facultades.length === 0) {
      return [];
    }
    
    return facultades.slice(0, 6).map((facultad, index) => {
      const nombreFacultad = facultad.codigo_facultad || 
                            facultad.nombre_facultad?.substring(0, 3).toUpperCase() ||
                            `FAC${index + 1}`;
      
      const result = { facultad: nombreFacultad };
      
      progreso.forEach(modalidad => {
        const factor = [0.8, 0.6, 0.5, 0.75, 0.4, 0.65][index % 6];
        result[modalidad.nombre_modalidad] = Math.floor(modalidad.total_carreras * factor / 5);
      });
      
      return result;
    });
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const progreso = getProgresoModalidades();
      
      const headers = ['Modalidad', 'Total Carreras', 'Activas', 'En Proceso', 'Pausadas', '% Completado'];
      const data = progreso.map(m => [
        m.nombre_modalidad,
        m.total_carreras,
        m.carreras_activas,
        m.carreras_en_proceso,
        m.carreras_pausadas,
        m.porcentaje_completado + '%'
      ]);
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      XLSX.utils.book_append_sheet(wb, ws, 'Progreso Modalidades');
      
      XLSX.writeFile(wb, `Reporte_Modalidades_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.xlsx`);
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
      pdf.save(`Reporte_Modalidades_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      alert('Error al exportar a PDF');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2>Cargando Reporte de Modalidades...</h2>
      </div>
    );
  }

  const progresoModalidades = getProgresoModalidades();
  const distribucionEstados = getDistribucionEstados();
  const tendencias = getTendenciasTemporales();
  const comparativaFacultades = getComparativaFacultades();

  return (
    <div className="reporte-container" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>Reporte de Modalidades de Acreditación</h1>
        <p style={styles.subtitle}>Análisis de Progreso y Distribución por Modalidad</p>
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

      <div style={styles.progresoSection}>
        <h3 style={styles.sectionTitle}>Progreso por Modalidad</h3>
        <div style={styles.progressList}>
          {progresoModalidades.map((modalidad, index) => (
            <div key={modalidad.id} style={styles.progressItem}>
              <div style={styles.progressHeader}>
                <div style={styles.modalidadInfo}>
                  <span style={styles.modalidadIcon}>🏆</span>
                  <div>
                    <div style={styles.modalidadName}>{modalidad.nombre_modalidad}</div>
                    {modalidad.descripcion && (
                      <div style={styles.modalidadDesc}>{modalidad.descripcion}</div>
                    )}
                  </div>
                </div>
                <div style={styles.progressCount}>
                  {modalidad.carreras_activas}/{modalidad.total_carreras}
                </div>
              </div>
              
              <div style={styles.progressBarContainer}>
                <div 
                  style={{
                    ...styles.progressBar,
                    width: `${modalidad.porcentaje_completado}%`,
                    background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[index % COLORS.length]}cc)`
                  }}
                ></div>
                <span style={styles.progressPercentage}>{modalidad.porcentaje_completado}%</span>
              </div>
              
              <div style={styles.progressDetails}>
                <div style={styles.detailItem}>
                  <span style={{...styles.detailBadge, ...styles.activaBadge}}>
                    ✓ {modalidad.carreras_activas} Activas
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={{...styles.detailBadge, ...styles.procesoBadge}}>
                    ⏳ {modalidad.carreras_en_proceso} En Proceso
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={{...styles.detailBadge, ...styles.pausadaBadge}}>
                    ⏸ {modalidad.carreras_pausadas} Pausadas
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartContainer}>
          <h3 style={styles.sectionTitle}>Distribución de Estados</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={distribucionEstados}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                label={({name, value}) => `${name}: ${value}`}
                labelLine={false}
              >
                {distribucionEstados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.chartLegend}>
            {distribucionEstados.map((estado, index) => (
              <div key={index} style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: estado.color}}></div>
                <span>{estado.name}: {estado.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.chartContainer}>
          <h3 style={styles.sectionTitle}>Comparativa por Modalidad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progresoModalidades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre_modalidad" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="carreras_activas" fill="#10b981" name="Activas" />
              <Bar dataKey="carreras_en_proceso" fill="#f59e0b" name="En Proceso" />
              <Bar dataKey="carreras_pausadas" fill="#ef4444" name="Pausadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.chartFullWidth}>
        <h3 style={styles.sectionTitle}>Tendencias Temporales de Acreditación</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={tendencias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="año" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedModalidad === 'todas' ? (
              <>
                <Bar dataKey="CEUB" fill="#f59e0b" name="CEUB" />
                <Bar dataKey="ARCU-SUR" fill="#ef4444" name="ARCU-SUR" />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total" />
              </>
            ) : (
              progresoModalidades.map((modalidad, index) => (
                <Bar 
                  key={modalidad.id}
                  dataKey={modalidad.nombre_modalidad} 
                  fill={COLORS[index % COLORS.length]} 
                  name={modalidad.nombre_modalidad}
                />
              ))
            )}
            {selectedModalidad !== 'todas' && (
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {comparativaFacultades.length > 0 && (
        <div style={styles.chartFullWidth}>
          <h3 style={styles.sectionTitle}>Distribución por Facultad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparativaFacultades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="facultad" />
              <YAxis />
              <Tooltip />
              <Legend />
              {progresoModalidades.map((modalidad, index) => (
                <Bar 
                  key={modalidad.id}
                  dataKey={modalidad.nombre_modalidad} 
                  fill={COLORS[index % COLORS.length]} 
                  name={modalidad.nombre_modalidad}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>Análisis Detallado por Modalidad</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Modalidad</th>
                <th style={styles.thCenter}>Total Carreras</th>
                <th style={styles.thCenter}>Activas</th>
                <th style={styles.thCenter}>En Proceso</th>
                <th style={styles.thCenter}>Pausadas</th>
                <th style={styles.thCenter}>% Completado</th>
                <th style={styles.thCenter}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {progresoModalidades.map((modalidad, index) => (
                <tr key={modalidad.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                  <td style={styles.td}>
                    <div style={styles.modalidadCell}>
                      <div style={{...styles.modalidadIndicator, backgroundColor: COLORS[index % COLORS.length]}}></div>
                      <div>
                        <div style={styles.modalidadNameTable}>{modalidad.nombre_modalidad}</div>
                        {modalidad.descripcion && (
                          <div style={styles.modalidadDescTable}>{modalidad.descripcion}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={styles.tdCenter}>
                    <span style={styles.totalValue}>{modalidad.total_carreras}</span>
                  </td>
                  <td style={styles.tdCenter}>
                    <span style={{...styles.tableBadge, ...styles.activaBadge}}>
                      {modalidad.carreras_activas}
                    </span>
                  </td>
                  <td style={styles.tdCenter}>
                    <span style={{...styles.tableBadge, ...styles.procesoBadge}}>
                      {modalidad.carreras_en_proceso}
                    </span>
                  </td>
                  <td style={styles.tdCenter}>
                    <span style={{...styles.tableBadge, ...styles.pausadaBadge}}>
                      {modalidad.carreras_pausadas}
                    </span>
                  </td>
                  <td style={styles.tdCenter}>
                    <div style={styles.progressCell}>
                      <div style={styles.circularProgress}>
                        <svg width="50" height="50" viewBox="0 0 50 50">
                          <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                          <circle
                            cx="25" cy="25" r="20" fill="none"
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth="5"
                            strokeDasharray={`${modalidad.porcentaje_completado * 1.257} ${125.7 - modalidad.porcentaje_completado * 1.257}`}
                            strokeDashoffset="31.4"
                            transform="rotate(-90 25 25)"
                          />
                          <text x="25" y="25" textAnchor="middle" dy="5" fontSize="12" fontWeight="bold" fill="#1e293b">
                            {modalidad.porcentaje_completado}%
                          </text>
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td style={styles.tdCenter}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(modalidad.porcentaje_completado >= 75 ? styles.excelenteBadge :
                          modalidad.porcentaje_completado >= 50 ? styles.buenoSta : styles.desarrolloBadge)
                    }}>
                      {modalidad.porcentaje_completado >= 75 ? 'Excelente' :
                       modalidad.porcentaje_completado >= 50 ? 'Bueno' : 'En Desarrollo'}
                    </span>
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
          {selectedYear === 'todos' ? 'Vista General - Todos los años' : `Año ${selectedYear}`} • {progresoModalidades.length} modalidades analizadas
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  header: { textAlign: 'center', marginBottom: '32px' },
  mainTitle: { fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' },
  subtitle: { fontSize: '16px', color: '#64748b' },
  filtersSection: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  filtersContent: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filterLabel: { fontSize: '14px', fontWeight: '500', color: '#334155' },
  filterSelect: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' },
  actionButtons: { display: 'flex', gap: '12px' },
  actionBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  excelBtn: { backgroundColor: '#10b981', color: 'white' },
  pdfBtn: { backgroundColor: '#ef4444', color: 'white' },
  progresoSection: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' },
  progressList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  progressItem: { padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  modalidadInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  modalidadIcon: { fontSize: '24px' },
  modalidadName: { fontSize: '18px', fontWeight: '600', color: '#1e293b' },
  modalidadDesc: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  progressCount: { fontSize: '20px', fontWeight: 'bold', color: '#475569' },
  progressBarContainer: { position: 'relative', height: '30px', backgroundColor: '#e5e7eb', borderRadius: '15px', overflow: 'hidden', marginBottom: '12px' },
  progressBar: { height: '100%', transition: 'width 0.3s ease', borderRadius: '15px' },
  progressPercentage: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' },
  progressDetails: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  detailItem: { display: 'flex', alignItems: 'center' },
  detailBadge: { padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' },
  activaBadge: { backgroundColor: '#d1fae5', color: '#065f46' },
  procesoBadge: { backgroundColor: '#fef3c7', color: '#92400e' },
  pausadaBadge: { backgroundColor: '#fee2e2', color: '#991b1b' },
  chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' },
  chartContainer: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  chartFullWidth: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  chartLegend: { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  legendColor: { width: '16px', height: '16px', borderRadius: '4px' },
  tableSection: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' },
  thCenter: { padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#475569' },
  evenRow: { backgroundColor: '#ffffff' },
  oddRow: { backgroundColor: '#f8fafc' },
  td: { padding: '12px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e5e7eb' },
  tdCenter: { padding: '12px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e5e7eb', textAlign: 'center' },
  modalidadCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  modalidadIndicator: { width: '4px', height: '40px', borderRadius: '2px' },
  modalidadNameTable: { fontWeight: '600', color: '#1e293b', fontSize: '15px' },
  modalidadDescTable: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  totalValue: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b' },
  tableBadge: { padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '500' },
  progressCell: { display: 'flex', justifyContent: 'center' },
  circularProgress: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: '500' },
  excelenteBadge: { backgroundColor: '#d1fae5', color: '#065f46' },
  buenoSta: { backgroundColor: '#fef3c7', color: '#92400e' },
  desarrolloBadge: { backgroundColor: '#fee2e2', color: '#991b1b' },
  footer: { textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '14px' },
  footerDetails: { marginTop: '8px', fontSize: '12px' }
};

export default ReporteModalidades;