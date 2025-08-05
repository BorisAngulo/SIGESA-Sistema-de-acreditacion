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
  Area
} from 'recharts';
import {
  getFacultades,
  getCarreras,
  getModalidades,
  getCarreraModalidades,
  getFases,
  getSubfases
} from '../services/api';
import '../styles/ReportesScreen.css';

const ReportesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    facultades: [],
    carreras: [],
    modalidades: [],
    carreraModalidades: [],
    fases: [],
    subfases: []
  });

  const [selectedPeriod, setSelectedPeriod] = useState('anual');
  const [selectedFacultad, setSelectedFacultad] = useState('todas');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [
        facultadesData,
        carrerasData,
        modalidadesData,
        carreraModalidadesData,
        fasesData,
        subfasesData
      ] = await Promise.all([
        getFacultades(),
        getCarreras(),
        getModalidades(),
        getCarreraModalidades(),
        getFases(),
        getSubfases()
      ]);

      setReportData({
        facultades: facultadesData || [],
        carreras: carrerasData || [],
        modalidades: modalidadesData || [],
        carreraModalidades: carreraModalidadesData || [],
        fases: fasesData || [],
        subfases: subfasesData || []
      });

      setError(null);
    } catch (err) {
      console.error('Error cargando datos de reportes:', err);
      setError('Error al cargar los datos de reportes');
    } finally {
      setLoading(false);
    }
  };

  const getCarrerasPorFacultad = () => {
    const facultadCarreras = {};
    
    reportData.facultades.forEach(facultad => {
      facultadCarreras[facultad.nombre_facultad] = 0;
    });

    reportData.carreras.forEach(carrera => {
      const facultad = reportData.facultades.find(f => f.id === carrera.facultad_id);
      if (facultad) {
        facultadCarreras[facultad.nombre_facultad]++;
      }
    });

    return Object.entries(facultadCarreras).map(([name, value]) => ({
      name,
      carreras: value
    }));
  };

  const getModalidadStats = () => {
    const modalidadCount = {};
    
    reportData.modalidades.forEach(modalidad => {
      modalidadCount[modalidad.nombre_modalidad] = 0;
    });

    reportData.carreraModalidades.forEach(cm => {
      const modalidad = reportData.modalidades.find(m => m.id === cm.modalidad_id);
      if (modalidad) {
        modalidadCount[modalidad.nombre_modalidad]++;
      }
    });

    return Object.entries(modalidadCount).map(([name, value]) => ({
      name,
      value,
      carreras: value
    }));
  };

  const getProgresoAcreditacion = () => {
    return [
      { mes: 'Ene', completadas: 2, enProceso: 3, pendientes: 5 },
      { mes: 'Feb', completadas: 4, enProceso: 4, pendientes: 4 },
      { mes: 'Mar', completadas: 6, enProceso: 3, pendientes: 3 },
      { mes: 'Abr', completadas: 8, enProceso: 5, pendientes: 2 },
      { mes: 'May', completadas: 10, enProceso: 4, pendientes: 1 },
      { mes: 'Jun', completadas: 12, enProceso: 3, pendientes: 1 }
    ];
  };

  const getEstadisticasGenerales = () => {
    return {
      totalFacultades: reportData.facultades.length,
      totalCarreras: reportData.carreras.length,
      totalModalidades: reportData.modalidades.length,
      acreditacionesActivas: reportData.carreraModalidades.length,
      porcentajeCompletado: Math.round((reportData.carreraModalidades.length / reportData.carreras.length) * 100) || 0
    };
  };

  if (loading) {
    return (
      <div className="reportes-container">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-inner"></div>
          </div>
          <h2 className="loading-title">Cargando Reportes</h2>
          <p className="loading-subtitle">Por favor espera un momento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reportes-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadReportData} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const stats = getEstadisticasGenerales();
  const carrerasPorFacultad = getCarrerasPorFacultad();
  const modalidadStats = getModalidadStats();
  const progresoData = getProgresoAcreditacion();

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h1>Reportes y Estadísticas</h1>
        <div className="controls">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="anual">Anual</option>
          </select>
          
          <select 
            value={selectedFacultad} 
            onChange={(e) => setSelectedFacultad(e.target.value)}
            className="facultad-select"
          >
            <option value="todas">Todas las Facultades</option>
            {reportData.facultades.map(facultad => (
              <option key={facultad.id} value={facultad.id}>
                {facultad.nombre_facultad}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">🏛️</div>
          <div className="stat-content">
            <h3>{stats.totalFacultades}</h3>
            <p>Facultades</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{stats.totalCarreras}</h3>
            <p>Carreras</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalModalidades}</h3>
            <p>Modalidades</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.acreditacionesActivas}</h3>
            <p>Acreditaciones Activas</p>
          </div>
        </div>
        
        <div className="stat-card progress">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.porcentajeCompletado}%</h3>
            <p>Progreso General</p>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="charts-grid">
        {/* Gráfico de barras - Carreras por Facultad */}
        <div className="chart-card">
          <h3>Carreras por Facultad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carrerasPorFacultad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="carreras" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico circular - Modalidades */}
        <div className="chart-card">
          <h3>Distribución por Modalidad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modalidadStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {modalidadStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de líneas - Progreso de Acreditación */}
        <div className="chart-card full-width">
          <h3>Progreso de Acreditación por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progresoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completadas" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Completadas"
              />
              <Line 
                type="monotone" 
                dataKey="enProceso" 
                stroke="#FFBB28" 
                strokeWidth={2}
                name="En Proceso"
              />
              <Line 
                type="monotone" 
                dataKey="pendientes" 
                stroke="#FF8042" 
                strokeWidth={2}
                name="Pendientes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de área - Evolución temporal */}
        <div className="chart-card full-width">
          <h3>Evolución de Acreditaciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={progresoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="completadas" 
                stackId="1"
                stroke="#00C49F" 
                fill="#00C49F"
                name="Completadas"
              />
              <Area 
                type="monotone" 
                dataKey="enProceso" 
                stackId="1"
                stroke="#FFBB28" 
                fill="#FFBB28"
                name="En Proceso"
              />
              <Area 
                type="monotone" 
                dataKey="pendientes" 
                stackId="1"
                stroke="#FF8042" 
                fill="#FF8042"
                name="Pendientes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="summary-table">
        <h3>Resumen por Facultad</h3>
        <table>
          <thead>
            <tr>
              <th>Facultad</th>
              <th>Carreras</th>
              <th>Acreditaciones</th>
              <th>Progreso</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reportData.facultades.map(facultad => {
              const carrerasFacultad = reportData.carreras.filter(c => c.facultad_id === facultad.id);
              const acreditaciones = reportData.carreraModalidades.filter(cm => 
                carrerasFacultad.some(c => c.id === cm.carrera_id)
              );
              const progreso = carrerasFacultad.length > 0 ? 
                Math.round((acreditaciones.length / carrerasFacultad.length) * 100) : 0;
              
              return (
                <tr key={facultad.id}>
                  <td>{facultad.nombre_facultad}</td>
                  <td>{carrerasFacultad.length}</td>
                  <td>{acreditaciones.length}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progreso}%` }}
                      ></div>
                      <span>{progreso}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status ${progreso >= 75 ? 'active' : progreso >= 25 ? 'warning' : 'inactive'}`}>
                      {progreso >= 75 ? 'Excelente' : progreso >= 25 ? 'En Progreso' : 'Inicial'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesScreen;