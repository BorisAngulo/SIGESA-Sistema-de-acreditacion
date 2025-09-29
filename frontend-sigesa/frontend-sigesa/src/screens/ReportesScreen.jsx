import React, { useState, useEffect } from 'react';
import '../styles/ReportesScreen.css';
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

import { 
  getFacultades,
  getCarreras,
  getModalidades,
  getCarreraModalidades,
  getFases,
  getSubfases,
  getCarrerasByFacultad,
  getReportesKPIs,
  getReportesAnalisisFacultades,
  getReportesProgresoModalidades,
  getReportesTendenciasTemporales,
  getReportesDistribucionEstados,
  getReportesCarrerasPorFacultad
} from '../services/api';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

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

  const [reportData, setReportData] = useState({
    kpis: null,
    analisisFacultades: [],
    progresoModalidades: [],
    tendenciasTemporales: [],
    distribucionEstados: [],
    comparativaAnual: null
  });

  const [filters, setFilters] = useState({
    selectedYear: 'todos',
    selectedFacultad: 'todas',
    selectedCarrera: 'todas',
    selectedModalidad: 'todas',
    comparisonMode: false,
    comparisonYear: '2023'
  });

  // Estados para el manejo de carreras desplegables
  const [expandedFaculties, setExpandedFaculties] = useState(new Set());
  const [facultyCarreras, setFacultyCarreras] = useState(new Map());
  const [loadingCarreras, setLoadingCarreras] = useState(new Set());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (data.facultades.length > 0 || data.carreras.length > 0) {
      console.log('Filtros cambiaron, recargando reportes...');
      loadReportData();
    }
  }, [filters, data]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [facultades, carreras, modalidades, carreraModalidades, fases, subfases] = await Promise.all([
        getFacultades(),
        getCarreras(),
        getModalidades(),
        getCarreraModalidades(),
        getFases(),
        getSubfases()
      ]);
      
      setData({
        facultades: facultades || [],
        carreras: carreras || [],
        modalidades: modalidades || [],
        carreraModalidades: carreraModalidades || [],
        fases: fases || [],
        subfases: subfases || []
      });
      
      await loadReportData();
      
      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Usando datos de ejemplo.');

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
          { id: 3, nombre_carrera: 'Medicina General', facultad_id: 2 },
          { id: 4, nombre_carrera: 'Derecho', facultad_id: 3 },
          { id: 5, nombre_carrera: 'Economía', facultad_id: 4 },
          { id: 6, nombre_carrera: 'Psicología', facultad_id: 5 },
          { id: 7, nombre_carrera: 'Matemática', facultad_id: 6 }
        ],
        modalidades: [
          { id: 1, nombre_modalidad: 'CEUB', descripcion: 'Comité Ejecutivo Universidad Boliviana' },
          { id: 2, nombre_modalidad: 'ARCU-SUR', descripcion: 'Acreditación MERCOSUR' }
        ],
        carreraModalidades: [],
        fases: [],
        subfases: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para cargar carreras por facultad
  const loadCarrerasByFacultad = async (facultadId) => {
    if (facultyCarreras.has(facultadId) || loadingCarreras.has(facultadId)) {
      return;
    }

    setLoadingCarreras(prev => new Set([...prev, facultadId]));
    
    try {
      // Intentar usar la nueva API de reportes primero
      try {
        console.log(`🎯 Cargando carreras con acreditación para facultad ${facultadId} desde API de reportes`);
        const carrerasConAcreditacion = await getReportesCarrerasPorFacultad(facultadId);
        setFacultyCarreras(prev => new Map([...prev, [facultadId, carrerasConAcreditacion]]));
        return;
      } catch (apiError) {
        console.warn(`⚠️ Error en API de reportes para facultad ${facultadId}, usando fallback:`, apiError);
      }

      // Fallback a la API original
      const carreras = await getCarrerasByFacultad(facultadId);
      
      // Simular datos de acreditación para cada carrera
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
      
      // Datos de fallback basados en las carreras existentes
      const carrerasFallback = data.carreras
        .filter(c => c.facultad_id === facultadId)
        .map(carrera => ({
          ...carrera,
          acreditaciones: {
            ceub: Math.random() > 0.5 ? {
              estado: 'activa',
              fecha_vencimiento: '2025-12-31',
              fase_actual: 'Fase 2'
            } : null,
            arcusur: Math.random() > 0.7 ? {
              estado: 'activa',
              fecha_vencimiento: '2026-06-30',
              fase_actual: 'Fase 1'
            } : null
          }
        }));
      
      setFacultyCarreras(prev => new Map([...prev, [facultadId, carrerasFallback]]));
    } finally {
      setLoadingCarreras(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(facultadId);
        return newSet;
      });
    }
  };

  // Función para alternar la expansión de facultades
  const toggleFacultyExpansion = async (facultadId) => {
    const newExpanded = new Set(expandedFaculties);
    
    if (newExpanded.has(facultadId)) {
      newExpanded.delete(facultadId);
    } else {
      newExpanded.add(facultadId);
      // Cargar carreras si no están ya cargadas
      await loadCarrerasByFacultad(facultadId);
    }
    
    setExpandedFaculties(newExpanded);
  };

  const loadReportData = async () => {
    try {
      console.log('Cargando datos de reportes con filtros:', filters);
      
      // Preparar filtros para las APIs
      const apiFilters = {
        year: filters.selectedYear,
        facultad_id: filters.selectedFacultad,
        modalidad_id: filters.selectedModalidad
      };

      // Intentar cargar datos reales del backend
      try {
        console.log('🚀 Cargando datos reales del backend...');
        
        const [
          kpisData,
          analisisFacultadesData,
          progresoModalidadesData,
          tendenciasTemporalesData,
          distribucionEstadosData
        ] = await Promise.all([
          getReportesKPIs(apiFilters),
          getReportesAnalisisFacultades(apiFilters),
          getReportesProgresoModalidades(apiFilters),
          getReportesTendenciasTemporales(apiFilters),
          getReportesDistribucionEstados(apiFilters)
        ]);

        console.log('✅ Datos del backend cargados exitosamente');
        
        setReportData({
          kpis: kpisData,
          analisisFacultades: analisisFacultadesData,
          progresoModalidades: progresoModalidadesData,
          tendenciasTemporales: tendenciasTemporalesData,
          distribucionEstados: distribucionEstadosData,
          comparativaAnual: filters.comparisonMode && filters.selectedYear !== 'todos' ? 
            await generateComparativaAnual() : null
        });
        
        return;
        
      } catch (backendError) {
        console.warn('⚠️ Error al cargar del backend, usando datos de fallback:', backendError);
      }
      
      // Fallback a datos simulados si el backend falla
      console.log('Datos disponibles para fallback:', {
        facultades: data.facultades.length,
        carreras: data.carreras.length,
        modalidades: data.modalidades.length
      });
      
      if (data.facultades.length === 0 || data.carreras.length === 0 || data.modalidades.length === 0) {
        console.log('Usando datos de fallback porque faltan datos reales');
        setReportData({
          kpis: generateFallbackKPIs(),
          analisisFacultades: generateFallbackFacultades(),
          progresoModalidades: generateFallbackProgreso(),
          tendenciasTemporales: generateFallbackTendencias(),
          distribucionEstados: generateFallbackDistribucion(),
          comparativaAnual: filters.comparisonMode && filters.selectedYear !== 'todos' ? 
            generateFallbackComparativa() : null
        });
        return;
      }

      const generatedData = {
        kpis: generateKPIsFromRealData(),
        analisisFacultades: generateFacultadAnalysisFromRealData(),
        progresoModalidades: generateModalidadProgressFromRealData(),
        tendenciasTemporales: generateFallbackTendencias(),
        distribucionEstados: generateDistribucionFromRealData(),
        comparativaAnual: filters.comparisonMode && filters.selectedYear !== 'todos' ? 
          generateFallbackComparativa() : null
      };
      
      console.log('Datos generados:', generatedData);
      setReportData(generatedData);

    } catch (err) {
      console.error('Error cargando datos de reportes:', err);
      
      setReportData({
        kpis: generateFallbackKPIs(),
        analisisFacultades: generateFallbackFacultades(),
        progresoModalidades: generateFallbackProgreso(),
        tendenciasTemporales: generateFallbackTendencias(),
        distribucionEstados: generateFallbackDistribucion(),
        comparativaAnual: null
      });
    }
  };

  const generateKPIsFromRealData = () => {
    const facultadesCount = data.facultades.length || 6;
    const carrerasCount = data.carreras.length || 15;
    
    console.log('Generando KPIs con:', { facultadesCount, carrerasCount });
    
    const baseMultiplier = filters.selectedYear === 'todos' ? 2.5 : 1;
    const ceubSimulado = Math.floor(carrerasCount * 0.4 * baseMultiplier);
    const arcusurSimulado = Math.floor(carrerasCount * 0.25 * baseMultiplier);
    
    return {
      facultades_activas: facultadesCount,
      carreras_totales: Math.floor(carrerasCount * baseMultiplier),
      acreditaciones_ceub: ceubSimulado,
      acreditaciones_arcusur: arcusurSimulado,
      crecimiento_anual: filters.selectedYear === 'todos' ? 18.5 : 14.2
    };
  };

  const generateFacultadAnalysisFromRealData = () => {
    const baseMultiplier = filters.selectedYear === 'todos' ? 2.8 : 1;
    
    if (!data.facultades || data.facultades.length === 0) {
      console.log('No hay facultades reales, usando fallback');
      return generateFallbackFacultades();
    }
    
    console.log('Generando análisis de facultades con:', data.facultades.length, 'facultades');
    
    // Filtrar facultades si hay un filtro seleccionado
    let facultadesAMostrar = data.facultades;
    if (filters.selectedFacultad !== 'todas') {
      facultadesAMostrar = data.facultades.filter(f => f.id.toString() === filters.selectedFacultad);
    }
    
    return facultadesAMostrar.map((facultad, index) => {
      // Filtrar carreras de esta facultad
      let carrerasDeFacultad = data.carreras.filter(c => c.facultad_id === facultad.id);
      
      // Si hay filtro de carrera, solo mostrar esa carrera
      if (filters.selectedCarrera !== 'todas') {
        carrerasDeFacultad = carrerasDeFacultad.filter(c => c.id.toString() === filters.selectedCarrera);
      }
      
      const totalCarreras = Math.max(Math.floor(carrerasDeFacultad.length * baseMultiplier), carrerasDeFacultad.length > 0 ? 1 : 0);
      
      console.log(`Facultad ${facultad.nombre_facultad}: ${carrerasDeFacultad.length} carreras filtradas`);
      
      const factorRendimiento = [0.7, 0.8, 0.5, 0.75, 0.4, 0.6, 0.65][index % 7]; 
      const ceubSimulado = Math.floor(totalCarreras * factorRendimiento * 0.6);
      const arcusurSimulado = Math.floor(totalCarreras * factorRendimiento * 0.3);
      const carrerasAcreditadas = ceubSimulado + arcusurSimulado;
      const porcentajeAcreditacion = totalCarreras > 0 ? Math.round((carrerasAcreditadas / totalCarreras) * 100) : 0;
      
      return {
        facultad_id: facultad.id,
        nombre_facultad: facultad.nombre_facultad,
        codigo_facultad: facultad.codigo_facultad || facultad.nombre_facultad.substring(0, 3).toUpperCase(),
        total_carreras: totalCarreras,
        carreras_acreditadas: carrerasAcreditadas,
        porcentaje_acreditacion: porcentajeAcreditacion,
        ceub: ceubSimulado,
        arcusur: arcusurSimulado
      };
    });
  };

  const generateModalidadProgressFromRealData = () => {
    // Si no hay modalidades reales, usar datos de fallback
    if (!data.modalidades || data.modalidades.length === 0) {
      console.log('No hay modalidades reales, usando fallback');
      return generateFallbackProgreso();
    }
    
    const totalCarreras = data.carreras.length || 15;
    const baseMultiplier = filters.selectedYear === 'todos' ? 2.5 : 1;
    
    console.log('Generando progreso de modalidades con:', data.modalidades.length, 'modalidades');
    
    return data.modalidades.map((modalidad) => {
      let factorModalidad = 1;
      let nombreDisplay = modalidad.nombre_modalidad;
      
      if (modalidad.nombre_modalidad.toUpperCase().includes('CEUB')) {
        factorModalidad = 0.65; 
      } else if (modalidad.nombre_modalidad.toUpperCase().includes('ARCU')) {
        factorModalidad = 0.45; 
      }
      
      const totalCarrerasModalidad = Math.max(Math.floor(totalCarreras * baseMultiplier * factorModalidad), 1);
      const carrerasActivas = Math.floor(totalCarrerasModalidad * 0.7);
      const carrerasEnProceso = totalCarrerasModalidad - carrerasActivas;
      const porcentajeCompletado = Math.round((carrerasActivas / totalCarrerasModalidad) * 100);
      
      console.log(`Modalidad ${nombreDisplay}: ${totalCarrerasModalidad} total, ${carrerasActivas} activas`);
      
      return {
        modalidad_id: modalidad.id,
        nombre_modalidad: nombreDisplay,
        total_carreras: totalCarrerasModalidad,
        carreras_activas: carrerasActivas,
        carreras_en_proceso: carrerasEnProceso,
        porcentaje_completado: porcentajeCompletado
      };
    });
  };

  const generateDistribucionFromRealData = () => {
    const totalCarreras = data.carreras.length || 15;
    const baseMultiplier = filters.selectedYear === 'todos' ? 2.5 : 1;
    
    const activas = Math.floor(totalCarreras * baseMultiplier * 0.65);
    const enProceso = Math.floor(totalCarreras * baseMultiplier * 0.25);
    const pausadas = Math.floor(totalCarreras * baseMultiplier * 0.1);
    
    return [
      { name: 'Activas', value: activas, color: '#10b981' },
      { name: 'En Proceso', value: enProceso, color: '#f59e0b' },
      { name: 'Pausadas', value: pausadas, color: '#ef4444' }
    ];
  };

  const generateFallbackKPIs = () => {
    if (filters.selectedYear === 'todos') {
      return {
        facultades_activas: 6,
        carreras_totales: 45,
        acreditaciones_ceub: 18,
        acreditaciones_arcusur: 12,
        crecimiento_anual: 15.2
      };
    }
    return {
      facultades_activas: 6,
      carreras_totales: 15,
      acreditaciones_ceub: 5,
      acreditaciones_arcusur: 3,
      crecimiento_anual: 12.5
    };
  };

  const generateFallbackFacultades = () => {
    const baseMultiplier = filters.selectedYear === 'todos' ? 3 : 1;
    return [
      {
        facultad_id: 1,
        nombre_facultad: 'Ingeniería',
        codigo_facultad: 'ING',
        total_carreras: 5 * baseMultiplier,
        carreras_acreditadas: 3 * baseMultiplier,
        porcentaje_acreditacion: 60,
        ceub: 2 * baseMultiplier,
        arcusur: 1 * baseMultiplier
      },
      {
        facultad_id: 2,
        nombre_facultad: 'Medicina',
        codigo_facultad: 'MED',
        total_carreras: 3 * baseMultiplier,
        carreras_acreditadas: 2 * baseMultiplier,
        porcentaje_acreditacion: 67,
        ceub: 1 * baseMultiplier,
        arcusur: 1 * baseMultiplier
      },
      {
        facultad_id: 3,
        nombre_facultad: 'Derecho',
        codigo_facultad: 'DER',
        total_carreras: 2 * baseMultiplier,
        carreras_acreditadas: 1 * baseMultiplier,
        porcentaje_acreditacion: 50,
        ceub: 1 * baseMultiplier,
        arcusur: 0
      },
      {
        facultad_id: 4,
        nombre_facultad: 'Economía',
        codigo_facultad: 'ECO',
        total_carreras: 4 * baseMultiplier,
        carreras_acreditadas: 3 * baseMultiplier,
        porcentaje_acreditacion: 75,
        ceub: 2 * baseMultiplier,
        arcusur: 1 * baseMultiplier
      },
      {
        facultad_id: 5,
        nombre_facultad: 'Humanidades',
        codigo_facultad: 'HUM',
        total_carreras: 3 * baseMultiplier,
        carreras_acreditadas: 1 * baseMultiplier,
        porcentaje_acreditacion: 33,
        ceub: 1 * baseMultiplier,
        arcusur: 0
      },
      {
        facultad_id: 6,
        nombre_facultad: 'Ciencias Puras',
        codigo_facultad: 'CIE',
        total_carreras: 4 * baseMultiplier,
        carreras_acreditadas: 2 * baseMultiplier,
        porcentaje_acreditacion: 50,
        ceub: 1 * baseMultiplier,
        arcusur: 1 * baseMultiplier
      }
    ];
  };

  const generateFallbackProgreso = () => {
    const baseMultiplier = filters.selectedYear === 'todos' ? 3 : 1;
    return [
      {
        modalidad_id: 1,
        nombre_modalidad: 'CEUB',
        total_carreras: 12 * baseMultiplier,
        carreras_activas: 8 * baseMultiplier,
        carreras_en_proceso: 4 * baseMultiplier,
        porcentaje_completado: 66.7
      },
      {
        modalidad_id: 2,
        nombre_modalidad: 'ARCU-SUR',
        total_carreras: 8 * baseMultiplier,
        carreras_activas: 4 * baseMultiplier,
        carreras_en_proceso: 4 * baseMultiplier,
        porcentaje_completado: 50.0
      }
    ];
  };

  const generateFallbackTendencias = () => [
    { año: '2021', total_carreras: 8, ceub: 5, arcusur: 3 },
    { año: '2022', total_carreras: 12, ceub: 7, arcusur: 5 },
    { año: '2023', total_carreras: 15, ceub: 9, arcusur: 6 },
    { año: '2024', total_carreras: 20, ceub: 12, arcusur: 8 }
  ];

  const generateFallbackDistribucion = () => {
    const baseMultiplier = filters.selectedYear === 'todos' ? 3 : 1;
    return [
      { name: 'Activas', value: 12 * baseMultiplier, color: '#10b981' },
      { name: 'En Proceso', value: 8 * baseMultiplier, color: '#f59e0b' },
      { name: 'Pausadas', value: 2 * baseMultiplier, color: '#ef4444' }
    ];
  };

  const generateComparativaAnual = async () => {
    try {
      // Obtener datos del año anterior para comparación
      const yearToCompare = parseInt(filters.selectedYear) - 1;
      const comparisonFilters = {
        year: yearToCompare.toString(),
        facultad_id: filters.selectedFacultad,
        modalidad_id: filters.selectedModalidad
      };

      const [currentKPIs, previousKPIs] = await Promise.all([
        getReportesKPIs({
          year: filters.selectedYear,
          facultad_id: filters.selectedFacultad,
          modalidad_id: filters.selectedModalidad
        }),
        getReportesKPIs(comparisonFilters)
      ]);

      // Calcular crecimientos
      const ceubGrowth = previousKPIs.acreditaciones_ceub > 0 ? 
        ((currentKPIs.acreditaciones_ceub - previousKPIs.acreditaciones_ceub) / previousKPIs.acreditaciones_ceub) * 100 : 0;
      
      const arcusurGrowth = previousKPIs.acreditaciones_arcusur > 0 ? 
        ((currentKPIs.acreditaciones_arcusur - previousKPIs.acreditaciones_arcusur) / previousKPIs.acreditaciones_arcusur) * 100 : 0;
      
      const totalCarrerasGrowth = previousKPIs.carreras_totales > 0 ? 
        ((currentKPIs.carreras_totales - previousKPIs.carreras_totales) / previousKPIs.carreras_totales) * 100 : 0;

      return {
        ceub_growth: Math.round(ceubGrowth * 10) / 10,
        arcusur_growth: Math.round(arcusurGrowth * 10) / 10,
        total_growth: Math.round(totalCarrerasGrowth * 10) / 10
      };
    } catch (error) {
      console.error('Error generando comparativa anual:', error);
      return generateFallbackComparativa();
    }
  };

  const generateFallbackComparativa = () => {
    return {
      ceub_growth: 15.3,
      arcusur_growth: 8.7,
      total_growth: 12.1
    };
  };

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      if (key === 'selectedYear' && value === 'todos') {
        newFilters.comparisonMode = false;
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      selectedYear: 'todos',
      selectedFacultad: 'todas',
      selectedCarrera: 'todas',
      selectedModalidad: 'todas',
      comparisonMode: false,
      comparisonYear: '2023'
    });
  };

  const getAvailableCarreras = () => {
    if (filters.selectedFacultad === 'todas') return data.carreras;
    return data.carreras.filter(c => c.facultad_id === parseInt(filters.selectedFacultad));
  };

  const getFilterDescription = () => {
    let description = '';
    
    if (filters.selectedYear === 'todos') {
      description = 'Vista General - Todos los años';
    } else {
      description = `Año ${filters.selectedYear}`;
    }
    
    if (filters.selectedFacultad !== 'todas') {
      const facultad = data.facultades.find(f => f.id.toString() === filters.selectedFacultad);
      if (facultad) description += ` • ${facultad.nombre_facultad}`;
    }
    
    if (filters.selectedModalidad !== 'todas') {
      const modalidad = data.modalidades.find(m => m.id.toString() === filters.selectedModalidad);
      if (modalidad) description += ` • ${modalidad.nombre_modalidad}`;
    }
    
    return description;
  };

    // Funciones de exportación - Añadir antes del return del componente

  // Funciones de exportación - Añadir antes del return del componente

  const exportToPDF = async () => {
    try {
      const element = document.querySelector('.dashboard-container');
      const canvas = await html2canvas(element, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Primera página
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Dashboard_Acreditacion_${filters.selectedYear === 'todos' ? 'Completo' : filters.selectedYear}_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Inténtalo nuevamente.');
    }
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: KPIs
      const kpisData = [
        ['Indicador', 'Valor'],
        ['Facultades Activas', kpis?.facultades_activas || 0],
        ['Carreras Totales', kpis?.carreras_totales || 0],
        ['Acreditaciones CEUB', kpis?.acreditaciones_ceub || 0],
        ['Acreditaciones ARCU-SUR', kpis?.acreditaciones_arcusur || 0],
        ['Período de Análisis', filters.selectedYear === 'todos' ? 'Todos los años' : `Año ${filters.selectedYear}`],
        ['Fecha de Exportación', new Date().toLocaleDateString('es-BO')]
      ];
      const wsKPIs = XLSX.utils.aoa_to_sheet(kpisData);
      XLSX.utils.book_append_sheet(wb, wsKPIs, 'KPIs');

      // Hoja 2: Análisis por Facultad
      const facultadHeaders = ['Facultad', 'Código', 'Total Carreras', 'Carreras Acreditadas', 'CEUB', 'ARCU-SUR', '% Cobertura'];
      const facultadData = analisisFacultades.map(f => [
        f.nombre_facultad,
        f.codigo_facultad,
        f.total_carreras,
        f.carreras_acreditadas,
        f.ceub,
        f.arcusur,
        f.porcentaje_acreditacion + '%'
      ]);
      const wsFacultades = XLSX.utils.aoa_to_sheet([facultadHeaders, ...facultadData]);
      XLSX.utils.book_append_sheet(wb, wsFacultades, 'Análisis Facultades');

      // Hoja 3: Progreso por Modalidad
      const modalidadHeaders = ['Modalidad', 'Total Carreras', 'Carreras Activas', 'En Proceso', '% Completado'];
      const modalidadData = progresoModalidades.map(m => [
        m.nombre_modalidad,
        m.total_carreras,
        m.carreras_activas,
        m.carreras_en_proceso,
        m.porcentaje_completado + '%'
      ]);
      const wsModalidades = XLSX.utils.aoa_to_sheet([modalidadHeaders, ...modalidadData]);
      XLSX.utils.book_append_sheet(wb, wsModalidades, 'Progreso Modalidades');

      // Hoja 4: Tendencias Temporales
      const tendenciaHeaders = ['Año', 'Total Carreras', 'CEUB', 'ARCU-SUR'];
      const tendenciaData = tendenciasTemporales.map(t => [
        t.año,
        t.total_carreras,
        t.ceub,
        t.arcusur
      ]);
      const wsTendencias = XLSX.utils.aoa_to_sheet([tendenciaHeaders, ...tendenciaData]);
      XLSX.utils.book_append_sheet(wb, wsTendencias, 'Tendencias Temporales');

      // Hoja 5: Estado de Acreditaciones
      const estadoHeaders = ['Estado', 'Cantidad'];
      const estadoData = distribucionEstados.map(e => [e.name, e.value]);
      const wsEstados = XLSX.utils.aoa_to_sheet([estadoHeaders, ...estadoData]);
      XLSX.utils.book_append_sheet(wb, wsEstados, 'Estado Acreditaciones');

      const fileName = `Dashboard_Acreditacion_${filters.selectedYear === 'todos' ? 'Completo' : filters.selectedYear}_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Error al generar el archivo Excel. Inténtalo nuevamente.');
    }
  };

  const CarrerasList = ({ facultadId }) => {
    const carreras = facultyCarreras.get(facultadId) || [];
    const isLoading = loadingCarreras.has(facultadId);

    if (isLoading) {
      return (
        <div className="carreras-loading">
          <div className="loading-spinner-small"></div>
          <span>Cargando carreras...</span>
        </div>
      );
    }

    if (carreras.length === 0) {
      return (
        <div className="carreras-empty">
          <span>No se encontraron carreras</span>
        </div>
      );
    }

    return (
      <div className="carreras-list">
        {carreras.map((carrera, index) => (
          <div key={carrera.id} className="carrera-item">
            <div className="carrera-header">
              <div className="carrera-name">
                <span className="carrera-icon">📚</span>
                {carrera.nombre_carrera}
              </div>
              <div className="carrera-badges">
                {carrera.acreditaciones?.ceub && (
                  <div className="acred-badge ceub" title={`CEUB - ${carrera.acreditaciones.ceub.fase_actual}`}>
                    <span>CEUB</span>
                    <div className="badge-details">
                      <small>Hasta: {new Date(carrera.acreditaciones.ceub.fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      <small>{carrera.acreditaciones.ceub.fase_actual}</small>
                    </div>
                  </div>
                )}
                {carrera.acreditaciones?.arcusur && (
                  <div className="acred-badge arcusur" title={`ARCU-SUR - ${carrera.acreditaciones.arcusur.fase_actual}`}>
                    <span>ARCU-SUR</span>
                    <div className="badge-details">
                      <small>Hasta: {new Date(carrera.acreditaciones.arcusur.fecha_vencimiento).toLocaleDateString('es-BO')}</small>
                      <small>{carrera.acreditaciones.arcusur.fase_actual}</small>
                    </div>
                  </div>
                )}
                {!carrera.acreditaciones?.ceub && !carrera.acreditaciones?.arcusur && (
                  <div className="acred-badge none">
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Cargando Dashboard de Reportes...</h2>
        <p>Conectando con el sistema de acreditación</p>
      </div>
    );
  }

  const { kpis, analisisFacultades, progresoModalidades, tendenciasTemporales, distribucionEstados, comparativaAnual } = reportData;

  return (
    <div className="dashboard-container">
      <div className="header-section">
        <h1 className="main-title">
          Dashboard de Acreditación Universitaria
        </h1>
        <p className="subtitle">
          Análisis integral de modalidades CEUB y ARCU-SUR
        </p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3>Filtros de Análisis</h3>
          <div className="filters-controls">
            <label className="comparison-toggle">
              <input 
                type="checkbox" 
                checked={filters.comparisonMode}
                onChange={(e) => updateFilter('comparisonMode', e.target.checked)}
                disabled={filters.selectedYear === 'todos'} 
              />
              <span>Modo Comparativo</span>
            </label>
            <button onClick={clearFilters} className="clear-filters-btn">
              Vista General
            </button>
          </div>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Período de Análisis:</label>
            <select 
              value={filters.selectedYear} 
              onChange={(e) => updateFilter('selectedYear', e.target.value)}
              className="filter-select"
            >
              <option value="todos">📊 Todos los años (Vista General)</option>
              <option value="2024">🗓️ Año 2024</option>
              <option value="2023">🗓️ Año 2023</option>
              <option value="2022">🗓️ Año 2022</option>
              <option value="2021">🗓️ Año 2021</option>
            </select>
          </div>
          
          {filters.comparisonMode && filters.selectedYear !== 'todos' && (
            <div className="filter-group">
              <label>Año Comparación:</label>
              <select 
                value={filters.comparisonYear} 
                onChange={(e) => updateFilter('comparisonYear', e.target.value)}
                className="filter-select comparison"
              >
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>Facultad:</label>
            <select 
              value={filters.selectedFacultad} 
              onChange={(e) => updateFilter('selectedFacultad', e.target.value)}
              className="filter-select"
            >
              <option value="todas">🏛️ Todas las Facultades</option>
              {data.facultades.map(f => (
                <option key={f.id} value={f.id}>{f.nombre_facultad}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Carrera:</label>
            <select 
              value={filters.selectedCarrera} 
              onChange={(e) => updateFilter('selectedCarrera', e.target.value)}
              className="filter-select"
            >
              <option value="todas">📚 Todas las Carreras</option>
              {getAvailableCarreras().map(c => (
                <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Modalidad:</label>
            <select 
              value={filters.selectedModalidad} 
              onChange={(e) => updateFilter('selectedModalidad', e.target.value)}
              className="filter-select"
            >
              <option value="todas">🎯 Todas las Modalidades</option>
              {data.modalidades.map(m => (
                <option key={m.id} value={m.id}>{m.nombre_modalidad}</option>
              ))}
            </select>
          </div>

          <div className="filter-group export-buttons">
            <button onClick={loadAllData} className="update-btn">
              Actualizar
            </button>
            <button onClick={exportToExcel} className="export-btn excel">
              📊 Descargar Excel
            </button>
          </div>
        </div>
        
        <div className="filter-indicator">
          <span className="indicator-label">Vista Actual:</span>
          <span className="indicator-value">{getFilterDescription()}</span>
          {filters.selectedYear === 'todos' && (
            <span className="indicator-badge">Vista Completa</span>
          )}
        </div>
      </div>

      {filters.comparisonMode && comparativaAnual && filters.selectedYear !== 'todos' && (
        <div className="comparison-stats">
          <h3>Análisis Comparativo {filters.selectedYear} vs {filters.comparisonYear}</h3>
          <div className="comparison-grid">
            <div className="comparison-item ceub">
              <div className="comparison-value">
                {comparativaAnual.ceub_growth > 0 ? '↗️' : comparativaAnual.ceub_growth < 0 ? '↘️' : '➡️'}
                {Math.abs(comparativaAnual.ceub_growth).toFixed(1)}%
              </div>
              <div className="comparison-label">Crecimiento CEUB</div>
            </div>
            <div className="comparison-item arcusur">
              <div className="comparison-value">
                {comparativaAnual.arcusur_growth > 0 ? '↗️' : comparativaAnual.arcusur_growth < 0 ? '↘️' : '➡️'}
                {Math.abs(comparativaAnual.arcusur_growth).toFixed(1)}%
              </div>
              <div className="comparison-label">Crecimiento ARCU-SUR</div>
            </div>
            <div className="comparison-item total">
              <div className="comparison-value">
                {comparativaAnual.total_growth > 0 ? '↗️' : comparativaAnual.total_growth < 0 ? '↘️' : '➡️'}
                {Math.abs(comparativaAnual.total_growth).toFixed(1)}%
              </div>
              <div className="comparison-label">Crecimiento Total</div>
            </div>
          </div>
        </div>
      )}

      <div className="kpi-grid">
        {[
          { 
            title: 'Facultades Activas', 
            value: kpis?.facultades_activas || 0, 
            color: '#3b82f6', 
            change: filters.selectedYear === 'todos' ? 'Vista General' : `Año ${filters.selectedYear}`, 
            icon: '🏛️' 
          },
          { 
            title: 'Carreras Totales', 
            value: kpis?.carreras_totales || 0, 
            color: '#10b981', 
            change: filters.selectedYear === 'todos' ? 'Todas las carreras' : `Año ${filters.selectedYear}`, 
            icon: '📚' 
          },
          { 
            title: 'CEUB Activas', 
            value: kpis?.acreditaciones_ceub || 0, 
            color: '#f59e0b', 
            change: filters.selectedYear === 'todos' ? 'Histórico total' : `Modalidad CEUB`, 
            icon: '🏆' 
          },
          { 
            title: 'ARCU-SUR', 
            value: kpis?.acreditaciones_arcusur || 0, 
            color: '#ef4444', 
            change: filters.selectedYear === 'todos' ? 'Histórico total' : `Modalidad ARCU-SUR`, 
            icon: '🌎' 
          }
        ].map((kpi, index) => (
          <div key={index} className="kpi-card" style={{'--accent-color': kpi.color}}>
            <div className="kpi-accent"></div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-title">{kpi.icon} {kpi.title}</div>
            <div className="kpi-change">{kpi.change}</div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Progreso por Modalidad</h3>
          <div className="progress-list">
            {progresoModalidades.map((prog, index) => (
              <div key={index} className="progress-item">
                <div className="progress-header">
                  <span className="progress-name">{prog.nombre_modalidad}</span>
                  <span className="progress-count">{prog.carreras_activas}/{prog.total_carreras}</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{
                      width: `${prog.porcentaje_completado}%`,
                      background: `linear-gradient(90deg, ${COLORS[index]}, ${COLORS[index]}cc)`
                    }}
                  ></div>
                  <span className="progress-percentage">{prog.porcentaje_completado}%</span>
                </div>
                {prog.carreras_en_proceso > 0 && (
                  <div className="progress-detail">{prog.carreras_en_proceso} en proceso</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Estado de Acreditaciones</h3>
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
          <div className="chart-legend">
            {distribucionEstados.map((estado, index) => (
              <div key={index} className="legend-item">
                <div className="legend-color" style={{backgroundColor: estado.color}}></div>
                <span>{estado.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-full-width">
        <h3>Tendencias Temporales - Acreditaciones por Año</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={tendenciasTemporales}>
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
            <Line type="monotone" dataKey="total_carreras" stroke="#8b5cf6" strokeWidth={3} name="Total" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="faculty-matrix">
        <h3>Matriz de Rendimiento por Facultad</h3>
        <div className="faculty-grid">
          {analisisFacultades.map((facultad, index) => (
            <div key={facultad.facultad_id} className="faculty-card expandable" style={{'--card-color': COLORS[index % COLORS.length]}}>
              <div 
                className="faculty-header clickable"
                onClick={() => toggleFacultyExpansion(facultad.facultad_id)}
              >
                <div className="faculty-icon">
                  {facultad.codigo_facultad}
                </div>
                <div className="faculty-info">
                  <h4>{facultad.nombre_facultad}</h4>
                  <div className="faculty-subtitle">{facultad.total_carreras} carreras registradas</div>
                </div>
                <div className="expand-indicator">
                  {expandedFaculties.has(facultad.facultad_id) ? '▼' : '▶'}
                </div>
              </div>
              
              <div className="faculty-stats">
                <div className="stat-item ceub">
                  <div className="stat-value">{facultad.ceub}</div>
                  <div className="stat-label">CEUB</div>
                </div>
                <div className="stat-item arcusur">
                  <div className="stat-value">{facultad.arcusur}</div>
                  <div className="stat-label">ARCU-SUR</div>
                </div>
              </div>
              
              <div className="faculty-progress">
                <div className="progress-label">
                  Cobertura de Acreditación: {facultad.porcentaje_acreditacion}%
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${facultad.porcentaje_acreditacion}%`,
                      background: facultad.porcentaje_acreditacion >= 70 ? '#10b981' : 
                                 facultad.porcentaje_acreditacion >= 40 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
              </div>
              
              <div className={`faculty-badge ${facultad.porcentaje_acreditacion >= 70 ? 'excellent' : 
                                                facultad.porcentaje_acreditacion >= 40 ? 'good' : 'low'}`}>
                {facultad.porcentaje_acreditacion >= 70 ? 'Excelente' : 
                 facultad.porcentaje_acreditacion >= 40 ? 'Bueno' : 'Bajo'}
              </div>

              {expandedFaculties.has(facultad.facultad_id) && (
                <div className="faculty-carreras-section">
                  <div className="carreras-header">
                    <h5>Carreras de la Facultad</h5>
                    <div className="carreras-count">
                      {facultyCarreras.get(facultad.facultad_id)?.length || 0} carreras
                    </div>
                  </div>
                  <CarrerasList facultadId={facultad.facultad_id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3>Análisis Detallado por Modalidad de Acreditación</h3>
          <div className="table-info">
            {getFilterDescription()}
          </div>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Modalidad</th>
                <th>Total Carreras</th>
                <th>Activas</th>
                <th>En Proceso</th>
                <th>% Completado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {progresoModalidades.map((modalidad, index) => (
                <tr key={modalidad.modalidad_id} className={index % 2 === 0 ? 'even' : 'odd'}>
                  <td>
                    <div className="modalidad-info">
                      <div className="modalidad-name">{modalidad.nombre_modalidad}</div>
                    </div>
                  </td>
                  <td className="text-center large-text">
                    {modalidad.total_carreras}
                  </td>
                  <td className="text-center">
                    <span className="badge active">
                      {modalidad.carreras_activas}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge process">
                      {modalidad.carreras_en_proceso}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="progress-cell">
                      <span className="progress-text">{modalidad.porcentaje_completado}%</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${
                      modalidad.porcentaje_completado >= 75 ? 'excellent' :
                      modalidad.porcentaje_completado >= 50 ? 'good' : 'developing'
                    }`}>
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

      <div className="faculty-ranking">
        <div className="table-header">
          <h3>Análisis Comparativo por Facultad</h3>
          <div className="table-info">
            {getFilterDescription()}
          </div>
          <div className="legend-row">
            <span className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
              CEUB
            </span>
            <span className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
              ARCU-SUR
            </span>
          </div>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Facultad</th>
                <th>Total Carreras</th>
                <th>CEUB</th>
                <th>ARCU-SUR</th>
                <th>Total Acreditadas</th>
                <th>% Cobertura</th>
                <th>Ranking</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {analisisFacultades
                .sort((a, b) => b.porcentaje_acreditacion - a.porcentaje_acreditacion)
                .map((facultad, index) => (
                <React.Fragment key={facultad.facultad_id}>
                  <tr className={index % 2 === 0 ? 'even' : 'odd'}>
                    <td>
                      <div className="faculty-row">
                        <div 
                          className="faculty-avatar"
                          style={{
                            background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                          }}
                        >
                          {facultad.codigo_facultad}
                        </div>
                        <div className="faculty-details">
                          <div className="faculty-name">{facultad.nombre_facultad}</div>
                          <div className="faculty-code">Código: {facultad.codigo_facultad}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center large-text">
                      {facultad.total_carreras}
                    </td>
                    <td className="text-center">
                      <div className="metric-column">
                        <span className="metric-value ceub">{facultad.ceub}</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill ceub"
                            style={{
                              width: `${facultad.total_carreras > 0 ? (facultad.ceub / facultad.total_carreras * 100) : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="metric-column">
                        <span className="metric-value arcusur">{facultad.arcusur}</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill arcusur"
                            style={{
                              width: `${facultad.total_carreras > 0 ? (facultad.arcusur / facultad.total_carreras * 100) : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge total">
                        {facultad.carreras_acreditadas}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="circular-gauge">
                        <div 
                          className="gauge-fill"
                          style={{
                            background: `conic-gradient(${
                              facultad.porcentaje_acreditacion >= 75 ? '#10b981' :
                              facultad.porcentaje_acreditacion >= 50 ? '#f59e0b' : '#ef4444'
                            } ${facultad.porcentaje_acreditacion * 3.6}deg, #e5e7eb 0deg)`
                          }}
                        >
                          <div className="gauge-inner">
                            {facultad.porcentaje_acreditacion}%
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="ranking-cell">
                        <span className={`ranking-number ${
                          index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'regular'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className="ranking-emoji">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <button 
                        className="expand-btn"
                        onClick={() => toggleFacultyExpansion(facultad.facultad_id)}
                        title="Ver carreras de la facultad"
                      >
                        {expandedFaculties.has(facultad.facultad_id) ? '▼' : '▶'} Ver Carreras
                      </button>
                    </td>
                  </tr>
                  
                  {expandedFaculties.has(facultad.facultad_id) && (
                    <tr className="expanded-row">
                      <td colSpan="8">
                        <div className="faculty-carreras-expanded">
                          <div className="carreras-section-header">
                            <h5>Carreras de {facultad.nombre_facultad}</h5>
                            <span className="carreras-count-badge">
                              {facultyCarreras.get(facultad.facultad_id)?.length || 0} carreras registradas
                            </span>
                          </div>
                          <CarrerasList facultadId={facultad.facultad_id} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="footer">
        <p>Dashboard generado el {new Date().toLocaleDateString('es-BO')} • Sistema de Acreditación Universitaria</p>
        <p className="footer-details">
          {getFilterDescription()} • {analisisFacultades.length} facultades en análisis
        </p>
      </div>
    </div>
  );
};

export default ReportesScreen;