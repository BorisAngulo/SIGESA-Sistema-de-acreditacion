import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getFacultades, getCarreras, getModalidades } from '../services/api';

const ReporteCarreras = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('todos');
  const [selectedFacultad, setSelectedFacultad] = useState('todas');
  const [selectedModalidad, setSelectedModalidad] = useState('todas');
  const [selectedTipoAcreditacion, setSelectedTipoAcreditacion] = useState('todas');
  const [selectedEstadoAcreditacion, setSelectedEstadoAcreditacion] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
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

  const getEstadoGeneral = (carrera) => {
    const tieneCeub = carrera.acreditaciones.ceub;
    const tieneArcusur = carrera.acreditaciones.arcusur;

    if (!tieneCeub && !tieneArcusur) return 'nunca_acreditada';
    
    // Si tiene alguna acreditación activa
    if ((tieneCeub && tieneCeub.estado === 'acreditada') || 
        (tieneArcusur && tieneArcusur.estado === 'acreditada')) {
      return 'acreditada';
    }
    
    // Si tiene alguna en reacreditación
    if ((tieneCeub && tieneCeub.estado === 'reacreditacion') || 
        (tieneArcusur && tieneArcusur.estado === 'reacreditacion')) {
      return 'reacreditacion';
    }
    
    // Si tiene alguna en proceso
    if ((tieneCeub && tieneCeub.estado === 'en_proceso') || 
        (tieneArcusur && tieneArcusur.estado === 'en_proceso')) {
      return 'en_proceso';
    }

    return 'nunca_acreditada';
  };

  const getCarrerasConAcreditacion = () => {
    return carreras
      .filter(c => {
        if (selectedFacultad !== 'todas' && c.facultad_id?.toString() !== selectedFacultad) return false;
        if (searchTerm && !c.nombre_carrera.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .map(carrera => {
        // Simular estado de acreditación más detallado
        const rand = Math.random();
        const tieneCeub = rand > 0.3;
        const tieneArcusur = rand > 0.6;
        
        // Determinar estados de acreditación de forma más realista
        let estadoCeub = null;
        let estadoArcusur = null;
        
        if (tieneCeub) {
          const r = Math.random();
          if (r > 0.7) estadoCeub = 'acreditada';
          else if (r > 0.4) estadoCeub = 'reacreditacion';
          else estadoCeub = 'en_proceso';
        }
        
        if (tieneArcusur) {
          const r = Math.random();
          if (r > 0.7) estadoArcusur = 'acreditada';
          else if (r > 0.4) estadoArcusur = 'reacreditacion';
          else estadoArcusur = 'en_proceso';
        }
        
        const carreraConAcreditacion = {
          ...carrera,
          facultad: facultades.find(f => f.id === carrera.facultad_id)?.nombre_facultad || 'N/A',
          acreditaciones: {
            ceub: tieneCeub ? {
              estado: estadoCeub,
              fecha_inicio: '2023-01-15',
              fecha_vencimiento: '2026-01-15',
              fase_actual: `Fase ${Math.floor(Math.random() * 4) + 1}`,
              porcentaje_avance: Math.floor(Math.random() * 100)
            } : null,
            arcusur: tieneArcusur ? {
              estado: estadoArcusur,
              fecha_inicio: '2023-06-01',
              fecha_vencimiento: '2026-06-01',
              fase_actual: `Fase ${Math.floor(Math.random() * 3) + 1}`,
              porcentaje_avance: Math.floor(Math.random() * 100)
            } : null
          }
        };

        return carreraConAcreditacion;
      })
      .filter(carrera => {
        // Filtro por tipo de acreditación (CEUB, ARCU-SUR o todas)
        if (selectedTipoAcreditacion === 'ceub' && !carrera.acreditaciones.ceub) return false;
        if (selectedTipoAcreditacion === 'arcusur' && !carrera.acreditaciones.arcusur) return false;
        if (selectedTipoAcreditacion === 'ambas') {
          if (!carrera.acreditaciones.ceub || !carrera.acreditaciones.arcusur) return false;
        }
        
        // Filtro por estado de acreditación
        if (selectedEstadoAcreditacion !== 'todos') {
          const estadoGeneral = getEstadoGeneral(carrera);
          if (estadoGeneral !== selectedEstadoAcreditacion) return false;
        }
        
        return true;
      });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCarreras = () => {
    const carrerasConData = getCarrerasConAcreditacion();
    
    if (!sortConfig.key) return carrerasConData;

    return [...carrerasConData].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'carrera':
          aValue = a.nombre_carrera.toLowerCase();
          bValue = b.nombre_carrera.toLowerCase();
          break;
        case 'facultad':
          aValue = a.facultad.toLowerCase();
          bValue = b.facultad.toLowerCase();
          break;
        case 'estado':
          aValue = getEstadoGeneral(a);
          bValue = getEstadoGeneral(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getEstadisticas = () => {
    const carrerasConData = getCarrerasConAcreditacion();
    const conCeub = carrerasConData.filter(c => c.acreditaciones.ceub).length;
    const conArcusur = carrerasConData.filter(c => c.acreditaciones.arcusur).length;
    const conAmbas = carrerasConData.filter(c => c.acreditaciones.ceub && c.acreditaciones.arcusur).length;
    const sinAcreditacion = carrerasConData.filter(c => !c.acreditaciones.ceub && !c.acreditaciones.arcusur).length;
    const acreditadas = carrerasConData.filter(c => getEstadoGeneral(c) === 'acreditada').length;
    const enProceso = carrerasConData.filter(c => getEstadoGeneral(c) === 'en_proceso').length;
    const enReacreditacion = carrerasConData.filter(c => getEstadoGeneral(c) === 'reacreditacion').length;
    
    return {
      total: carrerasConData.length,
      conCeub,
      conArcusur,
      conAmbas,
      sinAcreditacion,
      acreditadas,
      enProceso,
      enReacreditacion,
      porcentajeAcreditadas: carrerasConData.length > 0 ? 
        Math.round((acreditadas / carrerasConData.length) * 100) : 0,
      porcentajeCeub: carrerasConData.length > 0 ? 
        Math.round((conCeub / carrerasConData.length) * 100) : 0,
      porcentajeArcusur: carrerasConData.length > 0 ? 
        Math.round((conArcusur / carrerasConData.length) * 100) : 0
    };
  };

  const getDistribucionPorFacultad = () => {
    const carrerasConData = getCarrerasConAcreditacion();
    const distribucion = {};
    
    carrerasConData.forEach(carrera => {
      const facultad = carrera.facultad;
      if (!distribucion[facultad]) {
        distribucion[facultad] = { 
          total: 0, 
          ceub: 0, 
          arcusur: 0,
          acreditadas: 0,
          enProceso: 0,
          reacreditacion: 0
        };
      }
      distribucion[facultad].total++;
      if (carrera.acreditaciones.ceub) distribucion[facultad].ceub++;
      if (carrera.acreditaciones.arcusur) distribucion[facultad].arcusur++;
      
      const estado = getEstadoGeneral(carrera);
      if (estado === 'acreditada') distribucion[facultad].acreditadas++;
      if (estado === 'en_proceso') distribucion[facultad].enProceso++;
      if (estado === 'reacreditacion') distribucion[facultad].reacreditacion++;
    });
    
    return Object.entries(distribucion)
      .map(([facultad, data]) => ({
        facultad: facultad.length > 20 ? facultad.substring(0, 20) + '...' : facultad,
        ...data
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getDistribucionEstados = () => {
    const carrerasConData = getCarrerasConAcreditacion();
    
    return [
      { 
        name: 'Acreditadas', 
        value: carrerasConData.filter(c => getEstadoGeneral(c) === 'acreditada').length,
        color: '#10b981'
      },
      { 
        name: 'En Reacreditación', 
        value: carrerasConData.filter(c => getEstadoGeneral(c) === 'reacreditacion').length,
        color: '#8b5cf6'
      },
      { 
        name: 'En Proceso', 
        value: carrerasConData.filter(c => getEstadoGeneral(c) === 'en_proceso').length,
        color: '#3b82f6'
      },
      { 
        name: 'Sin Acreditación', 
        value: carrerasConData.filter(c => getEstadoGeneral(c) === 'nunca_acreditada').length,
        color: '#94a3b8'
      }
    ].filter(item => item.value > 0);
  };

  const limpiarFiltros = () => {
    setSelectedYear('todos');
    setSelectedFacultad('todas');
    setSelectedModalidad('todas');
    setSelectedTipoAcreditacion('todas');
    setSelectedEstadoAcreditacion('todos');
    setSearchTerm('');
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const carrerasData = getSortedCarreras();
      
      // Hoja principal de carreras
      const headers = ['Carrera', 'Facultad', 'CEUB', 'Estado CEUB', 'Fase CEUB', '% Avance CEUB', 
                      'ARCU-SUR', 'Estado ARCU-SUR', 'Fase ARCU-SUR', '% Avance ARCU-SUR', 'Estado General'];
      const data = carrerasData.map(c => [
        c.nombre_carrera,
        c.facultad,
        c.acreditaciones.ceub ? 'Sí' : 'No',
        c.acreditaciones.ceub ? (c.acreditaciones.ceub.estado === 'acreditada' ? 'Acreditada' :
                                 c.acreditaciones.ceub.estado === 'en_proceso' ? 'En Proceso' : 'Reacreditación') : 'N/A',
        c.acreditaciones.ceub?.fase_actual || 'N/A',
        c.acreditaciones.ceub?.porcentaje_avance || 'N/A',
        c.acreditaciones.arcusur ? 'Sí' : 'No',
        c.acreditaciones.arcusur ? (c.acreditaciones.arcusur.estado === 'acreditada' ? 'Acreditada' :
                                    c.acreditaciones.arcusur.estado === 'en_proceso' ? 'En Proceso' : 'Reacreditación') : 'N/A',
        c.acreditaciones.arcusur?.fase_actual || 'N/A',
        c.acreditaciones.arcusur?.porcentaje_avance || 'N/A',
        getEstadoGeneral(c) === 'acreditada' ? 'Acreditada' :
        getEstadoGeneral(c) === 'en_proceso' ? 'En Proceso' :
        getEstadoGeneral(c) === 'reacreditacion' ? 'Reacreditación' : 'Sin Acreditación'
      ]);
      
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      
      // Ajustar ancho de columnas
      ws['!cols'] = [
        { wch: 30 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 18 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Carreras');
      
      // Hoja de estadísticas
      const stats = getEstadisticas();
      const statsData = [
        ['ESTADÍSTICAS GENERALES', ''],
        ['Indicador', 'Valor'],
        ['Total Carreras', stats.total],
        ['Carreras Acreditadas', stats.acreditadas],
        ['Carreras en Proceso', stats.enProceso],
        ['Carreras en Reacreditación', stats.enReacreditacion],
        ['Sin Acreditación', stats.sinAcreditacion],
        ['', ''],
        ['POR TIPO DE ACREDITACIÓN', ''],
        ['Con CEUB', stats.conCeub],
        ['Con ARCU-SUR', stats.conArcusur],
        ['Con Ambas', stats.conAmbas],
        ['', ''],
        ['PORCENTAJES', ''],
        ['% Acreditadas', stats.porcentajeAcreditadas + '%'],
        ['% con CEUB', stats.porcentajeCeub + '%'],
        ['% con ARCU-SUR', stats.porcentajeArcusur + '%']
      ];
      const wsStats = XLSX.utils.aoa_to_sheet(statsData);
      wsStats['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
      
      // Hoja de distribución por facultad
      const distFacultad = getDistribucionPorFacultad();
      const facultadHeaders = ['Facultad', 'Total', 'Con CEUB', 'Con ARCU-SUR', 'Acreditadas', 'En Proceso', 'Reacreditación'];
      const facultadData = distFacultad.map(f => [
        f.facultad, f.total, f.ceub, f.arcusur, f.acreditadas, f.enProceso, f.reacreditacion
      ]);
      const wsFacultad = XLSX.utils.aoa_to_sheet([facultadHeaders, ...facultadData]);
      wsFacultad['!cols'] = [{ wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsFacultad, 'Por Facultad');
      
      XLSX.writeFile(wb, `Reporte_Carreras_Detallado_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.xlsx`);
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
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Reporte_Carreras_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      alert('Error al exportar a PDF');
    }
  };

  const getEstadoBadgeStyle = (estado) => {
    switch(estado) {
      case 'acreditada':
        return { backgroundColor: '#dcfce7', color: '#166534', icon: '✓' };
      case 'en_proceso':
        return { backgroundColor: '#dbeafe', color: '#1e40af', icon: '⏳' };
      case 'reacreditacion':
        return { backgroundColor: '#e0e7ff', color: '#4338ca', icon: '↻' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b', icon: '○' };
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'acreditada': return 'Acreditada';
      case 'en_proceso': return 'En Proceso';
      case 'reacreditacion': return 'Reacreditación';
      default: return 'Sin Acreditación';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h2 style={{color: '#475569'}}>Cargando Reporte de Carreras...</h2>
      </div>
    );
  }

  const carrerasConAcreditacion = getSortedCarreras();
  const estadisticas = getEstadisticas();
  const distribucionPorFacultad = getDistribucionPorFacultad();
  const distribucionEstados = getDistribucionEstados();
  const hayFiltrosActivos = selectedFacultad !== 'todas' || selectedTipoAcreditacion !== 'todas' || 
                           selectedEstadoAcreditacion !== 'todos' || searchTerm !== '';

  return (
    <div className="reporte-container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>📊 Reporte de Carreras</h1>
        <p style={styles.subtitle}>Sistema Integral de Seguimiento y Análisis de Acreditaciones</p>
        <div style={styles.headerStats}>
          <span style={styles.headerStat}>
            <strong>{estadisticas.total}</strong> Carreras Registradas
          </span>
          <span style={styles.headerStat}>•</span>
          <span style={styles.headerStat}>
            <strong>{estadisticas.porcentajeAcreditadas}%</strong> Acreditadas
          </span>
          <span style={styles.headerStat}>•</span>
          <span style={styles.headerStat}>
            Actualizado: {new Date().toLocaleDateString('es-BO')}
          </span>
        </div>
      </div>

      {/* Sección de Filtros */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersSectionHeader}>
          <h3 style={styles.filtersSectionTitle}>🔍 Filtros de Búsqueda</h3>
          {hayFiltrosActivos && (
            <button onClick={limpiarFiltros} style={styles.clearFiltersBtn}>
              ✕ Limpiar Filtros
            </button>
          )}
        </div>
        
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <span style={styles.filterIcon}>🏛️</span>
              Facultad
            </label>
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
            <label style={styles.filterLabel}>
              <span style={styles.filterIcon}>🏆</span>
              Tipo de Acreditación
            </label>
            <select 
              value={selectedTipoAcreditacion} 
              onChange={(e) => setSelectedTipoAcreditacion(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="todas">Todas</option>
              <option value="ceub">Solo CEUB</option>
              <option value="arcusur">Solo ARCU-SUR</option>
              <option value="ambas">Ambas (CEUB y ARCU-SUR)</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <span style={styles.filterIcon}>📊</span>
              Estado de Acreditación
            </label>
            <select 
              value={selectedEstadoAcreditacion} 
              onChange={(e) => setSelectedEstadoAcreditacion(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="todos">Todos los Estados</option>
              <option value="acreditada">✓ Acreditada</option>
              <option value="en_proceso">⏳ En Proceso</option>
              <option value="reacreditacion">↻ En Reacreditación</option>
              <option value="nunca_acreditada">○ Sin Acreditación</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <span style={styles.filterIcon}>🔍</span>
              Buscar Carrera
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.actionButtons}>
          <button onClick={exportToExcel} style={{...styles.actionBtn, ...styles.excelBtn}}>
            <span style={{fontSize: '18px'}}>📊</span>
            Exportar a Excel
          </button>
          <button onClick={exportToPDF} style={{...styles.actionBtn, ...styles.pdfBtn}}>
            <span style={{fontSize: '18px'}}>📄</span>
            Exportar a PDF
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, ...styles.statCardBlue}}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{estadisticas.total}</div>
            <div style={styles.statLabel}>Total Carreras</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, ...styles.statCardGreen}}>
          <div style={styles.statIcon}>✓</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{estadisticas.acreditadas}</div>
            <div style={styles.statLabel}>Acreditadas</div>
            <div style={styles.statPercentage}>{estadisticas.porcentajeAcreditadas}%</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, ...styles.statCardOrange}}>
          <div style={styles.statIcon}>🎓</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{estadisticas.conCeub}</div>
            <div style={styles.statLabel}>Con CEUB</div>
            <div style={styles.statPercentage}>{estadisticas.porcentajeCeub}%</div>
          </div>
        </div>
        
        <div style={{...styles.statCard, ...styles.statCardRed}}>
          <div style={styles.statIcon}>🌎</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{estadisticas.conArcusur}</div>
            <div style={styles.statLabel}>Con ARCU-SUR</div>
            <div style={styles.statPercentage}>{estadisticas.porcentajeArcusur}%</div>
          </div>
        </div>

        <div style={{...styles.statCard, ...styles.statCardPurple}}>
          <div style={styles.statIcon}>↻</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{estadisticas.enReacreditacion}</div>
            <div style={styles.statLabel}>En Reacreditación</div>
          </div>
        </div>

        <div style={{...styles.statCard, ...styles.statCardLightBlue}}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{estadisticas.enProceso}</div>
            <div style={styles.statLabel}>En Proceso</div>
          </div>
        </div>
      </div>

      {/* Sección de Gráficos */}
      <div style={styles.chartsContainer}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 Distribución por Facultad</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={distribucionPorFacultad} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="facultad" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{fontSize: 11}}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="ceub" fill="#f59e0b" name="CEUB" radius={[8, 8, 0, 0]} />
              <Bar dataKey="arcusur" fill="#ef4444" name="ARCU-SUR" radius={[8, 8, 0, 0]} />
              <Bar dataKey="acreditadas" fill="#10b981" name="Acreditadas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Estados de Acreditación</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={distribucionEstados}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distribucionEstados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.legendContainer}>
            {distribucionEstados.map((item, index) => (
              <div key={index} style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: item.color}}></div>
                <span style={styles.legendText}>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Carreras */}
      <div style={styles.tableSection}>
        <div style={styles.tableSectionHeader}>
          <h3 style={styles.sectionTitle}>
            📋 Listado Detallado de Carreras
          </h3>
          <span style={styles.resultCount}>
            Mostrando {carrerasConAcreditacion.length} {carrerasConAcreditacion.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
        
        {carrerasConAcreditacion.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>🔍</div>
            <h3 style={styles.emptyStateTitle}>No se encontraron resultados</h3>
            <p style={styles.emptyStateText}>
              Intenta ajustar los filtros de búsqueda para ver más resultados
            </p>
            <button onClick={limpiarFiltros} style={styles.emptyStateButton}>
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{...styles.th, ...styles.thSortable}} onClick={() => handleSort('carrera')}>
                    <div style={styles.thContent}>
                      Carrera
                      {sortConfig.key === 'carrera' && (
                        <span style={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th style={{...styles.th, ...styles.thSortable}} onClick={() => handleSort('facultad')}>
                    <div style={styles.thContent}>
                      Facultad
                      {sortConfig.key === 'facultad' && (
                        <span style={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th style={{...styles.th, textAlign: 'center'}}>
                    CEUB
                  </th>
                  <th style={{...styles.th, textAlign: 'center'}}>
                    ARCU-SUR
                  </th>
                  <th style={{...styles.th, ...styles.thSortable, textAlign: 'center'}} onClick={() => handleSort('estado')}>
                    <div style={styles.thContent}>
                      Estado General
                      {sortConfig.key === 'estado' && (
                        <span style={styles.sortIcon}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {carrerasConAcreditacion.map((carrera, index) => {
                  const estadoGeneral = getEstadoGeneral(carrera);
                  const estadoBadge = getEstadoBadgeStyle(estadoGeneral);
                  
                  return (
                    <tr key={carrera.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      <td style={styles.td}>
                        <div style={styles.carreraCell}>
                          <span style={styles.carreraIcon}>📚</span>
                          <div>
                            <div style={styles.carreraNombre}>{carrera.nombre_carrera}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.facultadCell}>
                          <span style={styles.facultadIcon}>🏛️</span>
                          {carrera.facultad}
                        </div>
                      </td>
                      <td style={styles.tdCenter}>
                        {carrera.acreditaciones.ceub ? (
                          <div style={styles.acredInfo}>
                            <span style={{
                              ...styles.acredBadge,
                              backgroundColor: carrera.acreditaciones.ceub.estado === 'acreditada' ? '#fef3c7' :
                                             carrera.acreditaciones.ceub.estado === 'en_proceso' ? '#dbeafe' : '#e0e7ff',
                              color: carrera.acreditaciones.ceub.estado === 'acreditada' ? '#92400e' :
                                     carrera.acreditaciones.ceub.estado === 'en_proceso' ? '#1e40af' : '#4338ca'
                            }}>
                              {getEstadoTexto(carrera.acreditaciones.ceub.estado)}
                            </span>
                            <small style={styles.faseText}>{carrera.acreditaciones.ceub.fase_actual}</small>
                            <div style={styles.progressBar}>
                              <div style={{
                                ...styles.progressFill,
                                width: `${carrera.acreditaciones.ceub.porcentaje_avance}%`,
                                backgroundColor: carrera.acreditaciones.ceub.estado === 'acreditada' ? '#f59e0b' :
                                               carrera.acreditaciones.ceub.estado === 'en_proceso' ? '#3b82f6' : '#8b5cf6'
                              }}></div>
                            </div>
                            <small style={styles.percentText}>{carrera.acreditaciones.ceub.porcentaje_avance}% Completado</small>
                            <small style={styles.dateText}>
                              Vence: {new Date(carrera.acreditaciones.ceub.fecha_vencimiento).toLocaleDateString('es-BO')}
                            </small>
                          </div>
                        ) : (
                          <span style={styles.noBadge}>Sin acreditación</span>
                        )}
                      </td>
                      <td style={styles.tdCenter}>
                        {carrera.acreditaciones.arcusur ? (
                          <div style={styles.acredInfo}>
                            <span style={{
                              ...styles.acredBadge,
                              backgroundColor: carrera.acreditaciones.arcusur.estado === 'acreditada' ? '#fee2e2' :
                                             carrera.acreditaciones.arcusur.estado === 'en_proceso' ? '#dbeafe' : '#e0e7ff',
                              color: carrera.acreditaciones.arcusur.estado === 'acreditada' ? '#991b1b' :
                                     carrera.acreditaciones.arcusur.estado === 'en_proceso' ? '#1e40af' : '#4338ca'
                            }}>
                              {getEstadoTexto(carrera.acreditaciones.arcusur.estado)}
                            </span>
                            <small style={styles.faseText}>{carrera.acreditaciones.arcusur.fase_actual}</small>
                            <div style={styles.progressBar}>
                              <div style={{
                                ...styles.progressFill,
                                width: `${carrera.acreditaciones.arcusur.porcentaje_avance}%`,
                                backgroundColor: carrera.acreditaciones.arcusur.estado === 'acreditada' ? '#ef4444' :
                                               carrera.acreditaciones.arcusur.estado === 'en_proceso' ? '#3b82f6' : '#8b5cf6'
                              }}></div>
                            </div>
                            <small style={styles.percentText}>{carrera.acreditaciones.arcusur.porcentaje_avance}% Completado</small>
                            <small style={styles.dateText}>
                              Vence: {new Date(carrera.acreditaciones.arcusur.fecha_vencimiento).toLocaleDateString('es-BO')}
                            </small>
                          </div>
                        ) : (
                          <span style={styles.noBadge}>Sin acreditación</span>
                        )}
                      </td>
                      <td style={styles.tdCenter}>
                        <div style={styles.estadoGeneralCell}>
                          <span style={{
                            ...styles.estadoGeneralBadge,
                            backgroundColor: estadoBadge.backgroundColor,
                            color: estadoBadge.color
                          }}>
                            <span style={styles.estadoIcon}>{estadoBadge.icon}</span>
                            {getEstadoTexto(estadoGeneral)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <strong>Reporte Generado:</strong> {new Date().toLocaleDateString('es-BO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div style={styles.footerSection}>
            <strong>Carreras Analizadas:</strong> {carrerasConAcreditacion.length} de {estadisticas.total}
          </div>
          <div style={styles.footerSection}>
            <strong>Filtros Activos:</strong> {hayFiltrosActivos ? 'Sí' : 'No'}
          </div>
        </div>
        <div style={styles.footerCopyright}>
          © 2024 Sistema de Acreditación Universitaria - Todos los derechos reservados
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px 20px',
    maxWidth: '1600px',
    margin: '0 auto',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    gap: '20px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '5px solid #e2e8f0',
    borderTop: '5px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '40px 30px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  mainTitle: {
    fontSize: '42px',
    fontWeight: '800',
    margin: '0 0 12px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '18px',
    margin: '0 0 20px 0',
    opacity: 0.95,
    fontWeight: '400',
  },
  headerStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginTop: '20px',
    fontSize: '14px',
    opacity: 0.9,
  },
  headerStat: {
    display: 'inline-block',
  },
  filtersSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  },
  filtersSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  filtersSectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  clearFiltersBtn: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '25px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterIcon: {
    fontSize: '18px',
  },
  filterSelect: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    fontWeight: '500',
  },
  searchInput: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    padding: '14px 24px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  excelBtn: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  pdfBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  statCardBlue: {
    borderLeft: '5px solid #3b82f6',
  },
  statCardGreen: {
    borderLeft: '5px solid #10b981',
  },
  statCardOrange: {
    borderLeft: '5px solid #f59e0b',
  },
  statCardRed: {
    borderLeft: '5px solid #ef4444',
  },
  statCardPurple: {
    borderLeft: '5px solid #8b5cf6',
  },
  statCardLightBlue: {
    borderLeft: '5px solid #06b6d4',
  },
  statIcon: {
    fontSize: '40px',
    lineHeight: 1,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '5px',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statPercentage: {
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '700',
    marginTop: '5px',
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '25px',
    marginBottom: '30px',
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px',
  },
  legendContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
  },
  legendText: {
    fontSize: '13px',
    color: '#475569',
    fontWeight: '600',
  },
  tableSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    marginBottom: '30px',
  },
  tableSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  resultCount: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    padding: '8px 16px',
    borderRadius: '20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyStateIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '10px',
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '25px',
  },
  emptyStateButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '18px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  thSortable: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'space-between',
  },
  sortIcon: {
    fontSize: '16px',
    color: '#3b82f6',
  },
  td: {
    padding: '18px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#334155',
  },
  tdCenter: {
    padding: '18px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#334155',
    textAlign: 'center',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f9fafb',
  },
  carreraCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  carreraIcon: {
    fontSize: '24px',
  },
  carreraNombre: {
    fontWeight: '700',
    color: '#1e293b',
    fontSize: '15px',
  },
  facultadCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#475569',
  },
  facultadIcon: {
    fontSize: '18px',
  },
  acredInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
  },
  acredBadge: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  noBadge: {
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    display: 'inline-block',
  },
  faseText: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
  },
  progressBar: {
    width: '100px',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '4px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s ease',
  },
  percentText: {
    fontSize: '10px',
    color: '#475569',
    fontWeight: '700',
  },
  dateText: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  estadoGeneralCell: {
    display: 'flex',
    justifyContent: 'center',
  },
  estadoGeneralBadge: {
    padding: '10px 18px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  estadoIcon: {
    fontSize: '16px',
  },
  footer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px',
    padding: '20px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  footerSection: {
    fontSize: '14px',
    color: '#64748b',
  },
  footerCopyright: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500',
  },
};

export default ReporteCarreras;