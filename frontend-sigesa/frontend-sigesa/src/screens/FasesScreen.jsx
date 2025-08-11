import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  getFasesByCarreraModalidad, 
  createFase, 
  updateFase, 
  deleteFase,
  getCarreraModalidades,
  getCarreraModalidadEspecifica,
  createCarreraModalidad,
  getModalidades
} from '../services/api';
import { 
  getSubfasesByFase,
  deleteSubfase
} from '../services/api'; 
import ModalAgregarFase from '../components/ModalAgregarFase';
import ModalConfirmacionFase from '../components/ModalConfirmacionFase'; 
import '../styles/FasesScreen.css';

const FasesScreen = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  
  const [fasesData, setFasesData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFase, setEditingFase] = useState(null);
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faseToDelete, setFaseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [subfases, setSubfases] = useState({});
  const [loadingSubfases, setLoadingSubfases] = useState({});

  const getModalidadId = async (modalidadNombre) => {
    try {
      console.log('🔍 Buscando modalidad para:', modalidadNombre);
      const modalidades = await getModalidades();
      console.log('📋 Modalidades disponibles:', modalidades);
      
      if (!modalidades || modalidades.length === 0) {
        console.error('❌ No se obtuvieron modalidades de la API');
        return null;
      }
 
      const modalidadMappings = {
        'arco-sur': ['arco sur', 'arco-sur', 'arcosur', 'arco_sur', 'arco'],
        'presencial': ['presencial'],
        'virtual': ['virtual', 'en línea', 'online'],
        'semipresencial': ['semipresencial', 'mixta', 'híbrida'],
      };
      
      const nombreNormalizado = modalidadNombre.toLowerCase().trim();
      
      const posiblesNombres = modalidadMappings[nombreNormalizado] || [nombreNormalizado];
      
      for (const posibleNombre of posiblesNombres) {
        const modalidadEncontrada = modalidades.find(m => {
          const nombreModalidad = m.nombre ? m.nombre.toLowerCase().trim() : '';
          const descripcionModalidad = m.descripcion ? m.descripcion.toLowerCase().trim() : '';
          
          return nombreModalidad.includes(posibleNombre) || 
                 posibleNombre.includes(nombreModalidad) ||
                 descripcionModalidad.includes(posibleNombre);
        });
        
        if (modalidadEncontrada) {
          console.log('✅ Modalidad encontrada:', modalidadEncontrada);
          return modalidadEncontrada.id;
        }
      }
      
      console.warn('⚠️ No se encontró modalidad, usando fallback');
      const fallbackIds = {
        'arco-sur': 1, 
        'presencial': 2,
        'virtual': 3,
        'semipresencial': 4
      };
      
      const fallbackId = fallbackIds[nombreNormalizado];
      if (fallbackId) {
        console.warn(`⚠️ Usando ID fallback para ${modalidadNombre}: ${fallbackId}`);
        return fallbackId;
      }
      
      console.warn('⚠️ No se encontró modalidad para:', modalidadNombre);
      console.log('📝 Modalidades disponibles:');
      modalidades.forEach(m => {
        console.log(`  - ID: ${m.id}, Nombre: "${m.nombre}", Descripción: "${m.descripcion || 'N/A'}"`);
      });
      
      return null;
    } catch (error) {
      console.error('💥 Error al obtener modalidadId:', error);
      return null;
    }
  };

  const debugModalidades = async () => {
    try {
      console.log('🔧 === DEBUG: Verificando modalidades ===');
      
      const modalidades = await getModalidades();
      console.log('📊 Total modalidades encontradas:', modalidades.length);
      
      if (modalidades.length === 0) {
        console.error('❌ No hay modalidades en la base de datos');
        return;
      }
      
      console.log('📋 Lista completa de modalidades:');
      modalidades.forEach((modalidad, index) => {
        console.log(`${index + 1}. ID: ${modalidad.id}, Nombre: "${modalidad.nombre}", Descripción: "${modalidad.descripcion || 'N/A'}"`);
      });
      
    } catch (error) {
      console.error('💥 Error en debug modalidades:', error);
    }
  };

  const loadSubfasesForFase = async (faseId) => {
    try {
      setLoadingSubfases(prev => ({ ...prev, [faseId]: true }));
      
      console.log('🔍 Cargando subfases para fase:', faseId);
      const subfasesData = await getSubfasesByFase(faseId);
      
      console.log('📊 Subfases obtenidas para fase', faseId, ':', subfasesData);
      
      const subfasesTransformadas = subfasesData.map(subfase => ({
        id: subfase.id,
        nombre: subfase.nombre_subfase,
        descripcion: subfase.descripcion_subfase,
        fechaInicio: subfase.fecha_inicio_subfase,
        fechaFin: subfase.fecha_fin_subfase,
        urlDrive: subfase.url_drive,
        faseId: subfase.fase_id,
        createdAt: subfase.created_at,
        updatedAt: subfase.updated_at,
        progreso: 0, 
        completada: false 
      }));
      
      setSubfases(prev => ({
        ...prev,
        [faseId]: subfasesTransformadas
      }));
      
      console.log('✅ Subfases transformadas para fase', faseId, ':', subfasesTransformadas);
      
    } catch (error) {
      console.error('❌ Error al cargar subfases para fase', faseId, ':', error);
      setSubfases(prev => ({
        ...prev,
        [faseId]: []
      }));
    } finally {
      setLoadingSubfases(prev => ({ ...prev, [faseId]: false }));
    }
  };

  useEffect(() => {
    const processLocationData = async () => {
      if (location.state) {
        const {
          modalidad,
          modalidadId,
          facultadId,
          carreraId,
          carreraModalidadId, 
          facultadNombre,
          carreraNombre,
          modalidadData
        } = location.state;
        
        console.log('Datos recibidos en FasesScreen (antes de procesar):', location.state);

        let resolvedModalidadId = modalidadId;
        if (!resolvedModalidadId && modalidad) {
          console.log('🔍 Obteniendo modalidadId para:', modalidad);
          resolvedModalidadId = await getModalidadId(modalidad);
          console.log('📋 modalidadId obtenido:', resolvedModalidadId);
          
          if (!resolvedModalidadId) {
            console.log('⚠️ No se pudo obtener modalidadId, ejecutando debug...');
            await debugModalidades();
          }
        }
        
  
        if (!carreraId || !resolvedModalidadId) {
          console.error('❌ Datos incompletos:', {
            carreraId,
            modalidadId: resolvedModalidadId
          });
          setError('Datos incompletos para cargar fases');
          return;
        }
        
        setFasesData({
          ...location.state,
          modalidadId: resolvedModalidadId,
          carreraModalidadId: null 
        });
        
        console.log('✅ Datos procesados para FasesScreen:', {
          ...location.state,
          modalidadId: resolvedModalidadId,
          carreraModalidadId: 'Se resolverá dinámicamente'
        });
      }
    };

    processLocationData();
  }, [location.state, params]);

  useEffect(() => {
    const loadFases = async () => {
      if (!fasesData?.carreraId || !fasesData?.modalidadId) {
        console.log('⏳ Esperando datos completos para cargar fases...');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 === INICIANDO CARGA DE FASES ===');
        console.log('  - carreraId:', fasesData.carreraId);
        console.log('  - modalidadId:', fasesData.modalidadId);
        
        let existeCarreraModalidad = null;
        
        try {
          existeCarreraModalidad = await getCarreraModalidadEspecifica(
            fasesData.carreraId, 
            fasesData.modalidadId
          );
          
          if (existeCarreraModalidad) {
            console.log('✅ Carrera-modalidad encontrada con ID:', existeCarreraModalidad.id);
          }
        } catch (error) {
          console.log('❌ Error al buscar carrera-modalidad específica:', error);
        }

        if (!existeCarreraModalidad) {
          console.log('🔍 Buscando en lista completa de carrera-modalidades...');
          
          try {
            const carreraModalidades = await getCarreraModalidades();
            
            existeCarreraModalidad = carreraModalidades.find(cm => 
              parseInt(cm.carrera_id) === parseInt(fasesData.carreraId) && 
              parseInt(cm.modalidad_id) === parseInt(fasesData.modalidadId)
            );
            
            if (existeCarreraModalidad) {
              console.log('✅ Carrera-modalidad encontrada en lista:', existeCarreraModalidad.id);
            }
          } catch (error) {
            console.log('❌ Error en búsqueda por lista completa:', error);
          }
        }
        
        let carreraModalidadIdFinal;
        
        if (existeCarreraModalidad) {
          carreraModalidadIdFinal = existeCarreraModalidad.id;
          
          console.log('🎯 === VALIDACIÓN DE CARRERA-MODALIDAD ===');
          console.log('  - carrera_id esperado:', fasesData.carreraId);
          console.log('  - modalidad_id esperado:', fasesData.modalidadId);
          console.log('  - carrera_id encontrado:', existeCarreraModalidad.carrera_id);
          console.log('  - modalidad_id encontrado:', existeCarreraModalidad.modalidad_id);
          console.log('  - carrera_modalidad_id final:', carreraModalidadIdFinal);
          
          const carreraCoincide = parseInt(existeCarreraModalidad.carrera_id) === parseInt(fasesData.carreraId);
          const modalidadCoincide = parseInt(existeCarreraModalidad.modalidad_id) === parseInt(fasesData.modalidadId);
          
          if (!carreraCoincide || !modalidadCoincide) {
            console.error('❌ ERROR CRÍTICO: Los IDs no coinciden exactamente');
            console.error('  Carrera coincide:', carreraCoincide);
            console.error('  Modalidad coincide:', modalidadCoincide);
            throw new Error('Inconsistencia en los IDs de carrera-modalidad');
          }
          
          console.log('✅ Validación de IDs exitosa');
          
          setFasesData(prev => ({
            ...prev,
            carreraModalidadId: carreraModalidadIdFinal
          }));
          
          console.log('📥 === CARGANDO FASES ===');
          console.log('  - Para carrera_modalidad_id:', carreraModalidadIdFinal);
          
          try {
            const fasesFromAPI = await getFasesByCarreraModalidad(carreraModalidadIdFinal);
            console.log('📊 Resultado de getFasesByCarreraModalidad:', fasesFromAPI);
            
            if (fasesFromAPI.length > 0) {
              const fasesInvalidas = fasesFromAPI.filter(fase => {
                const faseCarreraModalidadId = parseInt(fase.carrera_modalidad_id);
                const targetId = parseInt(carreraModalidadIdFinal);
                return faseCarreraModalidadId !== targetId;
              });
              
              if (fasesInvalidas.length > 0) {
                console.error('❌ ERROR CRÍTICO: Se encontraron fases que NO pertenecen a esta carrera-modalidad:');
                fasesInvalidas.forEach(fase => {
                  console.error(`  - Fase ${fase.id}: carrera_modalidad_id ${fase.carrera_modalidad_id} (esperado: ${carreraModalidadIdFinal})`);
                });
                
                const fasesValidas = fasesFromAPI.filter(fase => {
                  const faseCarreraModalidadId = parseInt(fase.carrera_modalidad_id);
                  const targetId = parseInt(carreraModalidadIdFinal);
                  return faseCarreraModalidadId === targetId;
                });
                
                console.warn(`⚠️ Se filtraron ${fasesInvalidas.length} fases inválidas. Quedaron ${fasesValidas.length} fases válidas.`);
                
                const fasesTransformadas = fasesValidas.map(fase => ({
                  id: fase.id,
                  nombre: fase.nombre_fase,
                  descripcion: fase.descripcion_fase,
                  fechaInicio: fase.fecha_inicio_fase,
                  fechaFin: fase.fecha_fin_fase,
                  progreso: 0,
                  completada: false,
                  expandida: false,
                  carreraModalidadId: fase.carrera_modalidad_id,
                  usuarioUpdated: fase.id_usuario_updated_fase,
                  createdAt: fase.created_at,
                  updatedAt: fase.updated_at
                }));
                
                setFases(fasesTransformadas);
                console.log('✅ Fases válidas transformadas y cargadas:', fasesTransformadas);
                
                fasesTransformadas.forEach(fase => {
                  loadSubfasesForFase(fase.id);
                });
                
              } else {
                console.log('✅ Todas las fases son válidas para esta carrera-modalidad');
                
                const fasesTransformadas = fasesFromAPI.map(fase => ({
                  id: fase.id,
                  nombre: fase.nombre_fase,
                  descripcion: fase.descripcion_fase,
                  fechaInicio: fase.fecha_inicio_fase,
                  fechaFin: fase.fecha_fin_fase,
                  progreso: 0,
                  completada: false,
                  expandida: false,
                  carreraModalidadId: fase.carrera_modalidad_id,
                  usuarioUpdated: fase.id_usuario_updated_fase,
                  createdAt: fase.created_at,
                  updatedAt: fase.updated_at
                }));
                
                setFases(fasesTransformadas);
                console.log('✅ Fases transformadas y cargadas:', fasesTransformadas);
                
                fasesTransformadas.forEach(fase => {
                  loadSubfasesForFase(fase.id);
                });
              }
            } else {
              console.log('ℹ️ No se encontraron fases para esta carrera-modalidad');
              setFases([]);
            }
            
          } catch (fasesError) {
            console.error('❌ Error al cargar fases:', fasesError);
            setError('Error al cargar las fases: ' + fasesError.message);
            setFases([]);
          }
          
        } else {
          console.log('⚠️ Carrera-modalidad no existe aún');
          console.log('💡 Se creará automáticamente cuando agregues la primera fase');
          setFases([]);
          
          setFasesData(prev => ({
            ...prev,
            carreraModalidadId: null
          }));
        }
        
      } catch (error) {
        console.error('❌ Error general al cargar fases:', error);
        setError('Error al cargar datos: ' + error.message);
        setFases([]);
      } finally {
        setLoading(false);
        console.log('🏁 === CARGA DE FASES FINALIZADA ===');
      }
    };

    loadFases();
  }, [fasesData?.carreraId, fasesData?.modalidadId, location.state?.subfaseActualizada]);

  const toggleFase = (faseId) => {
    setFases(fases.map(fase => 
      fase.id === faseId 
        ? { ...fase, expandida: !fase.expandida }
        : fase
    ));

    const fase = fases.find(f => f.id === faseId);
    if (fase && !fase.expandida && !subfases[faseId] && !loadingSubfases[faseId]) {
      loadSubfasesForFase(faseId);
    }
  };

  const handleAgregarFase = () => {
    setEditingFase(null);
    setShowModal(true); 
  };

  const handleEditarFase = (fase) => {
    setEditingFase(fase);
    setShowModal(true);
  };

  const handleEliminarFase = (fase) => {
    setFaseToDelete(fase);
    setShowDeleteModal(true);
  };

  const handleConfirmarEliminacion = async () => {
    if (!faseToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteFase(faseToDelete.id);
      setFases(prev => prev.filter(fase => fase.id !== faseToDelete.id));
      setSubfases(prev => {
        const newSubfases = { ...prev };
        delete newSubfases[faseToDelete.id];
        return newSubfases;
      });
      
      console.log('Fase eliminada correctamente:', faseToDelete.id);
      setShowDeleteModal(false);
      setFaseToDelete(null);
    } catch (error) {
      console.error('Error al eliminar fase:', error);
      alert('Error al eliminar la fase: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelarEliminacion = () => {
    setShowDeleteModal(false);
    setFaseToDelete(null);
  };

  const handleSaveFase = async (nuevaFase) => {
    try {
      console.log('fasesData completo:', fasesData);
      
      let carreraModalidadIdFinal = fasesData.carreraModalidadId;
  
      console.log('🔍 Método 1: Buscando carrera-modalidad específica...');
      let existeCarreraModalidad = null;
      
      try {
        existeCarreraModalidad = await getCarreraModalidadEspecifica(
          fasesData.carreraId, 
          fasesData.modalidadId
        );
        
        if (existeCarreraModalidad) {
          console.log('✅ Método 1 exitoso - Carrera-modalidad encontrada:', existeCarreraModalidad);
          carreraModalidadIdFinal = existeCarreraModalidad.id;
        }
      } catch (error) {
        console.log('❌ Método 1 falló:', error);
      }
      
      if (!existeCarreraModalidad) {
        console.log('🔍 Método 2: Buscando en lista completa...');
        
        try {
          const carreraModalidades = await getCarreraModalidades();
          console.log('📋 Lista obtenida:', carreraModalidades);
          
          existeCarreraModalidad = carreraModalidades.find(cm => 
            parseInt(cm.carrera_id) === parseInt(fasesData.carreraId) && 
            parseInt(cm.modalidad_id) === parseInt(fasesData.modalidadId)
          );
          
          if (existeCarreraModalidad) {
            console.log('✅ Método 2 exitoso - Carrera-modalidad encontrada:', existeCarreraModalidad);
            carreraModalidadIdFinal = existeCarreraModalidad.id;
          }
        } catch (error) {
          console.log('❌ Método 2 falló:', error);
        }
      }
      
      console.log('🔍 Resultado de búsqueda:');
      console.log('  carrera_id:', fasesData.carreraId);
      console.log('  modalidad_id:', fasesData.modalidadId);
      console.log('  existeCarreraModalidad:', existeCarreraModalidad);
      
      if (!existeCarreraModalidad) {
        console.log('🏗️ Carrera modalidad no existe, creando...');
        
        if (!fasesData.modalidadId) {
          throw new Error('No se pudo obtener el ID de la modalidad');
        }
        
        try {
          const nuevaCarreraModalidad = await createCarreraModalidad({
            carrera_id: parseInt(fasesData.carreraId),
            modalidad_id: parseInt(fasesData.modalidadId)
          });
          
          console.log('✅ Carrera modalidad creada:', nuevaCarreraModalidad);
          
          carreraModalidadIdFinal = nuevaCarreraModalidad.id;
          
          setFasesData(prev => ({
            ...prev,
            carreraModalidadId: nuevaCarreraModalidad.id
          }));
          
        } catch (createError) {
          console.error('💥 Error al crear carrera-modalidad:', createError);
          throw new Error('No se pudo crear la relación carrera-modalidad: ' + createError.message);
        }
        
      } else {
        carreraModalidadIdFinal = existeCarreraModalidad.id;
        console.log('✅ Usando carrera_modalidad existente con ID:', carreraModalidadIdFinal);
        
        setFasesData(prev => ({
          ...prev,
          carreraModalidadId: existeCarreraModalidad.id
        }));
      }
      
      console.log('🎯 Usando carrera_modalidad_id final:', carreraModalidadIdFinal);
      
      if (!carreraModalidadIdFinal) {
        throw new Error('No se pudo obtener o crear el ID de carrera_modalidad');
      }
      
      if (editingFase) {
        const faseActualizada = await updateFase(editingFase.id, {
          ...nuevaFase,
          carreraModalidadId: carreraModalidadIdFinal
        });
        
        setFases(prev => prev.map(fase => 
          fase.id === editingFase.id 
            ? {
                ...fase,
                nombre: faseActualizada.nombre_fase,
                descripcion: faseActualizada.descripcion_fase,
                fechaInicio: faseActualizada.fecha_inicio_fase,
                fechaFin: faseActualizada.fecha_fin_fase,
                updatedAt: faseActualizada.updated_at
              }
            : fase
        ));
        
        console.log('✅ Fase actualizada correctamente:', faseActualizada);
      } else {
        const nuevaFaseCreada = await createFase({
          ...nuevaFase,
          carreraModalidadId: carreraModalidadIdFinal
        });
        
        const nuevaFaseTransformada = {
          id: nuevaFaseCreada.id,
          nombre: nuevaFaseCreada.nombre_fase,
          descripcion: nuevaFaseCreada.descripcion_fase,
          fechaInicio: nuevaFaseCreada.fecha_inicio_fase,
          fechaFin: nuevaFaseCreada.fecha_fin_fase,
          progreso: 0,
          completada: false,
          expandida: false,
          carreraModalidadId: nuevaFaseCreada.carrera_modalidad_id,
          usuarioUpdated: nuevaFaseCreada.id_usuario_updated_fase,
          createdAt: nuevaFaseCreada.created_at,
          updatedAt: nuevaFaseCreada.updated_at
        };
        
        setFases(prev => [...prev, nuevaFaseTransformada]);
        
        setSubfases(prev => ({
          ...prev,
          [nuevaFaseCreada.id]: []
        }));
        
        console.log('✅ Fase creada correctamente:', nuevaFaseCreada);
      }
      
      setShowModal(false);
      setEditingFase(null);
      
    } catch (error) {
      console.error('💥 Error al guardar fase:', error);
      
      let errorMessage = 'Error al guardar la fase';
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.error && errorData.error.errores) {
          const errores = errorData.error.errores;
          const mensajesError = Object.values(errores).flat();
          errorMessage = mensajesError.join(', ');
        } else if (errorData.mensaje) {
          errorMessage = errorData.mensaje;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error al guardar la fase: ' + errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFase(null);
  };

  const handleFinalizarAcreditacion = () => {
    console.log('Finalizar acreditación para:', fasesData);
  };

  const handleAgregarSubfase = (faseId) => {
    const fase = fases.find(f => f.id === faseId);
    
    navigate('/subfase', {
      state: {
        faseId: faseId,
        faseNombre: fase.nombre,
        carreraId: fasesData.carreraId,
        modalidadId: fasesData.modalidadId,
        facultadId: fasesData.facultadId,
        carreraNombre: fasesData.carreraNombre,
        facultadNombre: fasesData.facultadNombre,
        modalidad: fasesData.modalidad
      }
    });
  };

  const handleEditarSubfase = (subfase, faseId) => {
    const fase = fases.find(f => f.id === faseId);
    
    navigate('/subfase', {
      state: {
        subfase: subfase, 
        faseId: faseId,
        faseNombre: fase.nombre,
        carreraId: fasesData.carreraId,
        modalidadId: fasesData.modalidadId,
        facultadId: fasesData.facultadId,
        carreraNombre: fasesData.carreraNombre,
        facultadNombre: fasesData.facultadNombre,
        modalidad: fasesData.modalidad
      }
    });
  };

  const handleEliminarSubfase = async (subfase, faseId) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la subfase "${subfase.nombre}"?`)) {
      try {
        console.log('🗑️ Eliminando subfase:', subfase.id);
        
        const result = await deleteSubfase(subfase.id);
        
        if (result.success) {
          setSubfases(prev => ({
            ...prev,
            [faseId]: prev[faseId].filter(s => s.id !== subfase.id)
          }));
          
          console.log('✅ Subfase eliminada correctamente');
          alert('Subfase eliminada exitosamente');
        } else {
          throw new Error(result.error || 'Error al eliminar la subfase');
        }
        
      } catch (error) {
        console.error('❌ Error al eliminar subfase:', error);
        alert('Error al eliminar la subfase: ' + error.message);
      }
    }
  };

  const reloadSubfasesForFase = (faseId) => {
    loadSubfasesForFase(faseId);
  };

  const getStatusIcon = (completada, progreso) => {
    if (completada || progreso === 100) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="status-icon completed">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (progreso > 0) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="status-icon in-progress">
          <path d="M12 2V12L17 7M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="status-icon pending">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 7V13L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  const getSubfaseStatusIcon = (completada) => {
    if (completada) {
      return (
        <div className="subfase-status completed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    } else {
      return (
        <div className="subfase-status pending">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="fases-container">
        <div className="loading">Cargando fases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fases-container">
        <div className="loading" style={{ color: 'red' }}>
          Error al cargar fases: {error}
        </div>
      </div>
    );
  }

  if (!fasesData) {
    return (
      <div className="fases-container">
        <div className="loading">Cargando datos de fases...</div>
      </div>
    );
  }

  return (
    <div className="fases-container">
      <div className="breadcrumb">
        <span>Técnico DUEA</span>
        <span className="separator">&gt;&gt;</span>
        <span>Modalidades</span>
        <span className="separator">&gt;&gt;</span>
        <span>{fasesData.modalidad?.toUpperCase()}</span>
        <span className="separator">&gt;&gt;</span>
        <span className="current">{fasesData.carreraNombre}</span>
      </div>

      <div className="action-buttons-header">
        <button className="btn-agregar-fase" onClick={handleAgregarFase}>
          Agregar Fase
        </button>
        <button className="btn-finalizar" onClick={handleFinalizarAcreditacion}>
          Finalizar Acreditación
        </button>
      </div>

      <div className="fases-list">
        {fases.length === 0 ? (
          <div className="no-fases">
            <p>No hay fases creadas para esta carrera y modalidad.</p>
            <button className="btn-agregar-fase" onClick={handleAgregarFase}>
              Crear primera fase
            </button>
          </div>
        ) : (
          fases.map((fase) => (
            <div key={fase.id} className="fase-item">
              <div 
                className="fase-header"
                onClick={() => toggleFase(fase.id)}
              >
                <div className="fase-info">
                  <h3 className="fase-nombre">{fase.nombre}</h3>
                  {fase.fechaInicio && fase.fechaFin && (
                    <div className="fase-fechas">
                      Inicio {fase.fechaInicio} - Fin {fase.fechaFin}
                    </div>
                  )}
                  {fase.descripcion && (
                    <div className="fase-descripcion">
                      <span className="descripcion-link">{fase.descripcion}</span>
                    </div>
                  )}
                </div>
                
                <div className="fase-controls">
                  <div className="fase-actions">
                    <button 
                      className="action-icon add" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAgregarSubfase(fase.id);
                      }}
                      title="Agregar subfase"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-icon edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditarFase(fase);
                      }}
                      title="Editar fase"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.50023C18.8978 2.1024 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1215 3.43762 22.1215 4.00023C22.1215 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-icon delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarFase(fase);
                      }}
                      title="Eliminar fase"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="fase-progress">
                    <span className="progress-text">{fase.progreso}%</span>
                    {getStatusIcon(fase.completada, fase.progreso)}
                  </div>
                  
                  <div className={`expand-icon ${fase.expandida ? 'expanded' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {fase.expandida && (
                <div className="subfases-container">
                  {loadingSubfases[fase.id] ? (
                    <div className="loading-subfases">
                      <div className="spinner"></div>
                      <span>Cargando subfases...</span>
                    </div>
                  ) : subfases[fase.id] && subfases[fase.id].length > 0 ? (
                    <div className="subfases-list">
                      <div className="subfases-header">
                        <h4>Subfases</h4>
                      </div>
                      {subfases[fase.id].map((subfase, index) => (
                        <div key={subfase.id} className="subfase-item">
                          <div className="subfase-numero">{index + 1}.</div>
                          <div className="subfase-content">
                            <div className="subfase-info">
                              <span className="subfase-nombre">{subfase.nombre}</span>
                              <span className="subfase-descripcion">{subfase.descripcion}</span>
                              <span className="subfase-fechas">
                                {subfase.fechaInicio} - {subfase.fechaFin}
                              </span>
                              {subfase.urlDrive && (
                                <div className="subfase-drive">
                                  <a 
                                    href={subfase.urlDrive} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="drive-link"
                                    title="Ver en Google Drive"
                                  >
                                    🔗 Drive
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            <div className="subfase-controls">
                              <button 
                                className="action-icon edit"
                                onClick={() => handleEditarSubfase(subfase, fase.id)}
                                title="Editar subfase"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.50023C18.8978 2.1024 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1215 3.43762 22.1215 4.00023C22.1215 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button 
                                className="action-icon delete"
                                onClick={() => handleEliminarSubfase(subfase, fase.id)}
                                title="Eliminar subfase"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              
                              {getSubfaseStatusIcon(subfase.completada)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-subfases">
                      <p>No hay subfases en esta fase.</p>
                      <button 
                        className="link-button"
                        onClick={() => handleAgregarSubfase(fase.id)}
                      >
                        Agregar primera subfase
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ModalAgregarFase
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveFase}
        fase={editingFase}
      />

      <ModalConfirmacionFase
        isOpen={showDeleteModal}
        onClose={handleCancelarEliminacion}
        onConfirm={handleConfirmarEliminacion}
        faseNombre={faseToDelete ? faseToDelete.nombre : ''}
        loading={deleteLoading}
      />
    </div>
  );
};

export default FasesScreen;