import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Edit3 } from 'lucide-react';
import DateProcessModal from '../components/DateProcessModal';
import useToast from '../hooks/useToast';
import { 
  createFase, 
  updateFase, 
  deleteFase,
  getCarreraModalidadEspecifica,
  getCarreraModalidadActiva,
  getCarreraModalidadPorId,
  createCarreraModalidad,
  finalizarAcreditacion,
  updateCarreraModalidadFechas,
  getModalidades,
  getDocumentos,
  createDocumento,
  asociarDocumentoAFase,
  asociarDocumentoASubfase,
  getDocumentosByFase,
  getDocumentosBySubfase,
  getProcesoCompleto
} from '../services/api';
import { 
  deleteSubfase
} from '../services/api'; 
import ModalAgregarFase from '../components/ModalAgregarFase';
import ModalConfirmacionFase from '../components/ModalConfirmacionFase'; 
import ModalEscogerDocumento from '../components/ModalEscogerDocumento';
import ModalDetallesFase from '../components/ModalDetallesFase';
import FinalizarAcreditacionModal from '../components/FinalizarAcreditacionModal';
import FodaModal from '../components/FodaModal';
import PlameModal from '../components/PlameModal';
import '../styles/FasesScreen.css';

// Componente para el formulario de edición de fechas del proceso
const EditDateProcessForm = ({ fasesData, onClose, onSuccess }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (fasesData) {
      // Función para formatear fecha de datetime a yyyy-MM-dd
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        // Si ya está en formato yyyy-MM-dd, devolverlo tal como está
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        
        // Si es un formato datetime, extraer solo la fecha
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.warn('Fecha inválida:', dateString);
            return '';
          }
          
          // Formatear como yyyy-MM-dd
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          
          return `${year}-${month}-${day}`;
        } catch (error) {
          console.error('Error al formatear fecha:', dateString, error);
          return '';
        }
      };
      
      // Usar los nombres correctos de las propiedades del proceso con formateo
      setFechaInicio(formatDateForInput(fasesData.fecha_ini_proceso));
      setFechaFin(formatDateForInput(fasesData.fecha_fin_proceso));
    }
  }, [fasesData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fechaInicio || !fechaFin) {
      setError('Ambas fechas son obligatorias');
      return;
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Preparar los datos para la API
      const fechasData = {
        fecha_ini_proceso: fechaInicio,
        fecha_fin_proceso: fechaFin
      };

      console.log('Actualizando fechas del proceso:', fechasData);
      console.log('ID de carrera-modalidad:', fasesData.carreraModalidadId || fasesData.id);

      // Llamar a la API para actualizar las fechas
      const resultado = await updateCarreraModalidadFechas(
        fasesData.carreraModalidadId || fasesData.id, 
        fechasData
      );

      toast.updated('Fechas actualizadas exitosamente');
      onSuccess();
      
    } catch (error) {
      console.error('Error al actualizar fechas:', error);
      toast.error('Error al actualizar las fechas: ' + (error.message || 'Error desconocido'));
      setError('Error al actualizar las fechas: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-dates-form">
      <div className="modal-body">
        <div className="form-group">
          <label htmlFor="fechaInicio">Fecha de Inicio del Proceso</label>
          <input
            type="date"
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fechaFin">Fecha de Fin del Proceso</label>
          <input
            type="date"
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="current-dates-info">
          <h4>Información del Proceso:</h4>
          <p><strong>Carrera:</strong> {fasesData?.carreraNombre}</p>
          <p><strong>Modalidad:</strong> {fasesData?.modalidadData?.nombre_modalidad || fasesData?.modalidad}</p>
          <p><strong>Fecha actual de inicio:</strong> {
            fasesData?.fecha_ini_proceso ? 
            new Date(fasesData.fecha_ini_proceso).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }) : 'No definida'
          }</p>
          <p><strong>Fecha actual de fin:</strong> {
            fasesData?.fecha_fin_proceso ? 
            new Date(fasesData.fecha_fin_proceso).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }) : 'No definida'
          }</p>
        </div>
      </div>

      <div className="modal-footer">
        <button 
          type="button" 
          className="btn-cancel" 
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-save" 
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Fechas'}
        </button>
      </div>
    </form>
  );
};
//Fases screen
const FasesScreen = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [fasesData, setFasesData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFase, setEditingFase] = useState(null);
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faseToDelete, setFaseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Estados para documentos
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentoTarget, setDocumentoTarget] = useState({ type: null, id: null }); // 'fase' o 'subfase'
  const [documentos, setDocumentos] = useState([]);
  
  // Estados para el modal de fechas del proceso
  const [showDateProcessModal, setShowDateProcessModal] = useState(false);
  const [pendingCarreraModalidadData, setPendingCarreraModalidadData] = useState(null);
  const [dateProcessLoading, setDateProcessLoading] = useState(false);
  
  // Estado para controlar si el botón "Finalizar Acreditación" está habilitado
  const [botonFinalizarHabilitado, setBotonFinalizarHabilitado] = useState(false);
  const [verificandoEstadoProceso, setVerificandoEstadoProceso] = useState(false);
  
  // Estado para el modal de finalizar acreditación
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  
  const [subfases, setSubfases] = useState({});
  // loadingSubfases removido - ya no es necesario con endpoint consolidado

  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [detallesData, setDetallesData] = useState({
    tipo: null, // 'fase' o 'subfase'
    data: null,
    documentos: []
  });

  // ✅ OPTIMIZACIÓN: Referencias para evitar ejecuciones innecesarias
  const ultimaVerificacionRef = useRef(null);
  const verificandoEnProcesoRef = useRef(false);

  // Estados para modales FODA y PLAME
  const [showFodaModal, setShowFodaModal] = useState(false);
  const [showPlameModal, setShowPlameModal] = useState(false);
  const [subfaseSeleccionada, setSubfaseSeleccionada] = useState(null);

  // Estado para el modal de edición de fechas de proceso
  const [showEditDateModal, setShowEditDateModal] = useState(false);

  // Función para verificar si el usuario puede editar/eliminar
  const puedeRealizarAcciones = () => {
    if (!user || !user.roles || !user.roles[0]) return false;
    const rol = user.roles[0].name;
    return rol === 'Admin' || rol === 'Tecnico';
  };

  const getModalidadId = async (modalidadNombre) => {
    try {
      console.log('Buscando modalidad para:', modalidadNombre);
      const modalidades = await getModalidades();
      console.log(' Modalidades disponibles:', modalidades);
      
      if (!modalidades || modalidades.length === 0) {
        console.error('No se obtuvieron modalidades de la API');
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
          console.log('Modalidad encontrada:', modalidadEncontrada);
          return modalidadEncontrada.id;
        }
      }
      
      console.warn('No se encontró modalidad, usando fallback');
      const fallbackIds = {
        'arco-sur': 1, 
        'presencial': 2,
        'virtual': 3,
        'semipresencial': 4
      };
      
      const fallbackId = fallbackIds[nombreNormalizado];
      if (fallbackId) {
        console.warn(`Usando ID fallback para ${modalidadNombre}: ${fallbackId}`);
        return fallbackId;
      }
      
      console.warn('No se encontró modalidad para:', modalidadNombre);
      modalidades.forEach(m => {
        console.log(`  - ID: ${m.id}, Nombre: "${m.nombre}", Descripción: "${m.descripcion || 'N/A'}"`);
      });
      
      return null;
    } catch (error) {
      console.error('Error al obtener modalidadId:', error);
      return null;
    }
  };

  // Función optimizada con endpoint consolidado - SIN FALLBACKS
  const continuarCargaFases = useCallback(async (carreraModalidadIdFinal) => {
    try {
      
      // Una sola llamada para obtener carrera-modalidad, fases y subfases
      const procesoCompleto = await getProcesoCompleto(carreraModalidadIdFinal);
      console.log('✅ Proceso completo obtenido:', procesoCompleto);
      
      // OPTIMIZACIÓN: Actualizar fasesData con datos completos del endpoint
      if (procesoCompleto.carrera_modalidad) {
        const carreraModalidad = procesoCompleto.carrera_modalidad;
        setFasesData(prev => ({
          ...prev,
          carreraModalidadId: carreraModalidad.id,
          fecha_ini_proceso: carreraModalidad.fecha_ini_proceso,
          fecha_fin_proceso: carreraModalidad.fecha_fin_proceso,
          fecha_ini_aprobacion: carreraModalidad.fecha_ini_aprobacion,
          fecha_fin_aprobacion: carreraModalidad.fecha_fin_aprobacion,
          estado_modalidad: carreraModalidad.estado_modalidad,
          estado_acreditacion: carreraModalidad.estado_acreditacion,
          puntaje_acreditacion: carreraModalidad.puntaje_acreditacion,
          // Actualizar también la información de carrera y modalidad si viene completa
          carreraNombre: carreraModalidad.carrera?.nombre_carrera || prev.carreraNombre,
          carreraId: carreraModalidad.carrera_id || prev.carreraId,
          modalidadId: carreraModalidad.modalidad_id || prev.modalidadId,
          updated_at: carreraModalidad.updated_at
        }));
        console.log('📋 fasesData actualizado con datos del endpoint consolidado');
      }
      
      if (procesoCompleto.fases && procesoCompleto.fases.length > 0) {
        // Transformar fases del formato del backend al formato del frontend
        const fasesTransformadas = procesoCompleto.fases.map(fase => ({
          id: fase.id,
          nombre: fase.nombre_fase,
          descripcion: fase.descripcion_fase,
          fechaInicio: fase.fecha_inicio_fase,
          fechaFin: fase.fecha_fin_fase,
          urlFase: fase.url_fase,
          urlFaseRespuesta: fase.url_fase_respuesta,
          observacionFase: fase.observacion_fase,
          estadoFase: fase.estado_fase,
          progreso: 0,
          completada: false,
          expandida: false,
          carreraModalidadId: fase.carrera_modalidad_id,
          usuarioUpdated: fase.id_usuario_updated_user,
          createdAt: fase.created_at,
          updatedAt: fase.updated_at
        }));

        console.log(`📈 Cargadas ${fasesTransformadas.length} fases en una sola llamada`);
        setFases(fasesTransformadas);

        // Cargar subfases desde los datos ya obtenidos
        const subfasesMap = {};
        procesoCompleto.fases.forEach(fase => {
          if (fase.subfases && fase.subfases.length > 0) {
            const subfasesTransformadas = fase.subfases.map(subfase => ({
              id: subfase.id,
              nombre: subfase.nombre_subfase,
              descripcion: subfase.descripcion_subfase,
              fechaInicio: subfase.fecha_inicio_subfase,
              fechaFin: subfase.fecha_fin_subfase,
              url_subfase: subfase.url_subfase,
              url_subfase_respuesta: subfase.url_subfase_respuesta,
              observacionSubfase: subfase.observacion_subfase,
              urlDrive: subfase.url_subfase,
              estadoSubfase: subfase.estado_subfase,
              faseId: subfase.fase_id,
              tiene_foda: subfase.tiene_foda || false,
              tiene_plame: subfase.tiene_plame || false,
              createdAt: subfase.created_at,
              updatedAt: subfase.updated_at,
              progreso: 0, 
              completada: false 
            }));

            subfasesMap[fase.id] = subfasesTransformadas;
            console.log(`📈 Cargadas ${subfasesTransformadas.length} subfases para fase ${fase.id}`);
          } else {
            subfasesMap[fase.id] = [];
          }
        });

        setSubfases(subfasesMap);

        console.log(`🎉 CARGA COMPLETA:`, {
          total_fases: procesoCompleto.total_fases || fasesTransformadas.length,
          total_subfases: procesoCompleto.total_subfases || Object.values(subfasesMap).flat().length
        });

      } else {
        console.log('No se encontraron fases para esta carrera-modalidad');
        setFases([]);
        setSubfases({});
      }
      
    } catch (error) {
      console.error('💥 Error al cargar proceso completo:', error);
      setError('Error al cargar las fases: ' + error.message);
      setFases([]);
      setSubfases({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Función independiente para verificar el estado del proceso
  const verificarEstadoProceso = useCallback(async () => {
    
    // ✅ OPTIMIZACIÓN: Evitar ejecuciones innecesarias
    const claveVerificacion = `${fasesData?.carreraId}-${fasesData?.modalidadId}-${fasesData?.fromCarrerasModalidadesAdmin}`;
    if (ultimaVerificacionRef.current === claveVerificacion && verificandoEnProcesoRef.current) {
      console.log('⏭️ Omitiendo verificación - ya en proceso para la misma clave:', claveVerificacion);
      return;
    }
    
    if (!fasesData?.carreraId || !fasesData?.modalidadId) {
      console.log('⏳ Datos incompletos para verificar estado del proceso');
      setBotonFinalizarHabilitado(false);
      return;
    }

    // ✅ OPTIMIZACIÓN: Marcar como en proceso
    verificandoEnProcesoRef.current = true;
    ultimaVerificacionRef.current = claveVerificacion;

    try {
      setVerificandoEstadoProceso(true);
      console.log('🔄 Iniciando verificación...');

      let procesoActivo = false;
      let carreraModalidadInfo = null;

      // Si viene desde CarrerasModalidadesAdmin, usar las fechas específicas del registro seleccionado
      if (fasesData.fromCarrerasModalidadesAdmin) {
        // Primero verificar si ya está finalizada (estado_modalidad = true)
        if (fasesData.estado_modalidad === true) {
          console.log('🚫 Proceso ya finalizado - estado_modalidad es true');
          procesoActivo = false;
        } else if (fasesData.fecha_ini_proceso && fasesData.fecha_fin_proceso) {
          // Usar las fechas específicas del registro seleccionado
          const fechaActual = new Date();
          const fechaInicio = new Date(fasesData.fecha_ini_proceso);
          const fechaFin = new Date(fasesData.fecha_fin_proceso);
          
          // Normalizamos las fechas para comparar solo la fecha sin la hora
          const fechaActualSoloFecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
          const fechaInicioSoloFecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
          const fechaFinSoloFecha = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
          
          procesoActivo = fechaActualSoloFecha >= fechaInicioSoloFecha && fechaActualSoloFecha <= fechaFinSoloFecha;
          
        } else if (fasesData.carreraModalidadId) {
          // Si no tenemos fechas pero sí el ID, consultar la carrera-modalidad específica por ID
          console.log('🔍 Consultando carrera-modalidad específica por ID:', fasesData.carreraModalidadId);
          try {
            const registroEspecifico = await getCarreraModalidadPorId(fasesData.carreraModalidadId);
            carreraModalidadInfo = registroEspecifico;
            
            if (registroEspecifico) {
              // Verificar si ya está finalizada
              if (registroEspecifico.estado_modalidad === true) {
                console.log('🚫 Proceso ya finalizado - estado_modalidad es true');
                procesoActivo = false;
              } else if (registroEspecifico.fecha_ini_proceso && registroEspecifico.fecha_fin_proceso) {
                const fechaActual = new Date();
                const fechaInicio = new Date(registroEspecifico.fecha_ini_proceso);
                const fechaFin = new Date(registroEspecifico.fecha_fin_proceso);
                
                const fechaActualSoloFecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
                const fechaInicioSoloFecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
                const fechaFinSoloFecha = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
                
                procesoActivo = fechaActualSoloFecha >= fechaInicioSoloFecha && fechaActualSoloFecha <= fechaFinSoloFecha;
              } else {
                console.log('No tiene fechas válidas');
                procesoActivo = false;
              }
            } else {
              console.log('No se pudo obtener el registro específico por ID');
              procesoActivo = false;
            }
          } catch (error) {
            console.error('❌ Error al consultar carrera-modalidad específica por ID:', error);
            procesoActivo = false;
          }
        } else {
          procesoActivo = false;
        }
      } else {
        // ✅ SIMPLIFICADO: Si viene desde ModalidadesScreen, usar SOLO datos existentes
        console.log('📋 Verificando desde ModalidadesScreen usando datos del endpoint consolidado');
        
        // El endpoint consolidado YA debe haber cargado todos los datos necesarios
        carreraModalidadInfo = {
          id: fasesData.carreraModalidadId,
          estado_modalidad: fasesData.estado_modalidad,
          fecha_ini_proceso: fasesData.fecha_ini_proceso,
          fecha_fin_proceso: fasesData.fecha_fin_proceso
        };
        
        // Verificar si ya está finalizada
        if (fasesData.estado_modalidad === true) {
          console.log('🚫 Proceso ya finalizado - estado_modalidad es true');
          procesoActivo = false;
        } else {
          // Verificar si está dentro del rango de fechas activo
          const fechaActual = new Date();
          const fechaInicio = new Date(fasesData.fecha_ini_proceso);
          const fechaFin = new Date(fasesData.fecha_fin_proceso);
          
          const fechaActualSoloFecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
          const fechaInicioSoloFecha = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
          const fechaFinSoloFecha = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
          
          procesoActivo = fechaActualSoloFecha >= fechaInicioSoloFecha && fechaActualSoloFecha <= fechaFinSoloFecha;
        }
        
        console.log('✅ Verificación completada usando SOLO datos existentes');
        console.log('  - ¿Proceso activo?:', procesoActivo);
      }

      // Log adicional para debugging
      if (carreraModalidadInfo) {
        console.log('📋 Información de carrera-modalidad:', {
          id: carreraModalidadInfo.id,
          estado_modalidad: carreraModalidadInfo.estado_modalidad,
          fecha_ini_proceso: carreraModalidadInfo.fecha_ini_proceso,
          fecha_fin_proceso: carreraModalidadInfo.fecha_fin_proceso
        });
      }

      setBotonFinalizarHabilitado(procesoActivo);
      console.log('🔧 Estado del proceso verificado:', procesoActivo ? 'ACTIVO' : 'INACTIVO');
      console.log('🔧 botonFinalizarHabilitado establecido a:', procesoActivo);

    } catch (error) {
      console.error('❌ Error al verificar estado del proceso:', error);
      setBotonFinalizarHabilitado(false);
    } finally {
      setVerificandoEstadoProceso(false);
      // ✅ OPTIMIZACIÓN: Limpiar referencia de proceso en curso
      verificandoEnProcesoRef.current = false;
      console.log('✅ Verificación completada');
    }
  }, [fasesData?.carreraId, fasesData?.modalidadId, fasesData?.carreraModalidadId, fasesData?.fromCarrerasModalidadesAdmin, fasesData?.fecha_ini_proceso, fasesData?.fecha_fin_proceso]);

  useEffect(() => {
    const processLocationData = async () => {
      // Primero, intentar obtener datos de location.state
      if (location.state) {
        const {
          modalidad,
          modalidadId,
          carreraId,
          carreraModalidadId
        } = location.state;
        
        console.log('Datos recibidos en FasesScreen (location.state):', location.state);

        let resolvedModalidadId = modalidadId;
        if (!resolvedModalidadId && modalidad) {
          console.log('Obteniendo modalidadId para:', modalidad);
          resolvedModalidadId = await getModalidadId(modalidad);
          console.log('modalidadId obtenido:', resolvedModalidadId);
        }
        
  
        if (!carreraId || !resolvedModalidadId) {
          console.error('Datos incompletos:', {
            carreraId,
            modalidadId: resolvedModalidadId
          });
          setError('Datos incompletos para cargar fases');
          return;
        }
        
        setFasesData({
          ...location.state,
          modalidadId: resolvedModalidadId,
          carreraModalidadId: carreraModalidadId || null // Conservar el ID si viene desde CarrerasModalidadesAdmin
        });
        
      } else {
        // Si no hay location.state, intentar obtener de parámetros query
        const searchParams = new URLSearchParams(location.search);
        const carreraId = searchParams.get('carrera');
        const modalidadId = searchParams.get('modalidad');
        const carreraModalidadId = searchParams.get('carreraModalidadId');
        
        if (!carreraId || !modalidadId) {
          console.error('Faltan parámetros query necesarios:', { carreraId, modalidadId });
          setError('Parámetros insuficientes para cargar fases');
          return;
        }
        
        // Configurar datos básicos desde query params
        setFasesData({
          carreraId: parseInt(carreraId),
          modalidadId: parseInt(modalidadId),
          carreraModalidadId: carreraModalidadId ? parseInt(carreraModalidadId) : null,
          facultadId: null,
          facultadNombre: 'Cargando...',
          carreraNombre: 'Cargando...',
          modalidadData: null
        });
        
        console.log('Datos configurados desde query params');
    
      }
    };

    processLocationData();
  }, [location.state, location.search, params]);

  useEffect(() => {
    const loadFases = async () => {
      if (!fasesData?.carreraId || !fasesData?.modalidadId) {
        console.log('Esperando datos completos para cargar fases...');
        return;
      }
      
      // ✅ OPTIMIZACIÓN FINAL: Evitar ejecución si los datos ya están cargados
      if (fases.length > 0 && fasesData.carreraModalidadId && fasesData.fecha_ini_proceso) {
        console.log('🚫 DATOS YA CARGADOS - omitiendo ejecución duplicada:', {
          fases_count: fases.length,
          carreraModalidadId: fasesData.carreraModalidadId,
          fecha_ini_proceso: fasesData.fecha_ini_proceso
        });
        return;
      }
      
      // Evitar bucle infinito si ya se está mostrando el modal de fechas
      if (showDateProcessModal) {
        console.log('Modal de fechas abierto, omitiendo carga de fases...');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        let existeCarreraModalidad = null;
        let carreraModalidadIdFinal;
        
        // Si viene desde CarrerasModalidadesAdmin, usar directamente el ID proporcionado
        if (fasesData.fromCarrerasModalidadesAdmin && fasesData.carreraModalidadId) {
          console.log('Navegación desde CarrerasModalidadesAdmin - usando ID existente:', fasesData.carreraModalidadId);
          carreraModalidadIdFinal = fasesData.carreraModalidadId;
          
          // Simular que encontramos una carrera-modalidad para evitar mostrar el modal
          existeCarreraModalidad = { id: fasesData.carreraModalidadId };
          
          // Para CarrerasModalidadesAdmin, las fechas se verificarán en verificarEstadoProceso()
          console.log('Navegación desde CarrerasModalidadesAdmin - ID configurado');
        } else {
          console.log('✅ SIMPLIFICADO: Navegación desde ModalidadesScreen - usando endpoint consolidado directamente');
        
          // ✅ OPTIMIZACIÓN: En lugar de validar primero, usar directamente el endpoint consolidado
          try {
            // Buscar carrera-modalidad activa SOLO para obtener el ID
            const carreraModalidadActiva = await getCarreraModalidadActiva(
              fasesData.carreraId, 
              fasesData.modalidadId
            );
            
            if (carreraModalidadActiva) {
              existeCarreraModalidad = carreraModalidadActiva;
              console.log('🎯 Carrera-modalidad encontrada - procediendo con endpoint consolidado');
            } else {
              console.log('❌ No se encontró carrera-modalidad activa - mostrando modal de fechas');
              existeCarreraModalidad = null;
            }
          } catch (error) {
            console.log('Error al buscar carrera-modalidad:', error);
            existeCarreraModalidad = null;
          }
        } // Cierre del else

        // Nota: Si llegamos aquí con existeCarreraModalidad = null, 
        // significa que debemos crear una nueva (ya sea porque no existe ninguna
        // o porque la existente está fuera del rango de fechas)
        
        // let carreraModalidadIdFinal; // Ya se declaró arriba
        
        if (existeCarreraModalidad) {
          carreraModalidadIdFinal = existeCarreraModalidad.id;
          
          // Solo validar IDs si NO viene desde CarrerasModalidadesAdmin
          if (!fasesData.fromCarrerasModalidadesAdmin) {
            
            const carreraCoincide = parseInt(existeCarreraModalidad.carrera_id) === parseInt(fasesData.carreraId);
            const modalidadCoincide = parseInt(existeCarreraModalidad.modalidad_id) === parseInt(fasesData.modalidadId);
            
            if (!carreraCoincide || !modalidadCoincide) {
              console.error('ERROR CRÍTICO: Los IDs no coinciden exactamente');
              console.error('  Carrera coincide:', carreraCoincide);
              console.error('  Modalidad coincide:', modalidadCoincide);
              throw new Error('Inconsistencia en los IDs de carrera-modalidad');
            }
            
          } else {
            console.log('Navegación desde CarrerasModalidadesAdmin - omitiendo validación de IDs');
          }
          
          // No actualizar fasesData aquí para evitar bucle infinito
          // El carreraModalidadIdFinal ya se almacena en variable local
          
          console.log('  - Para carrera_modalidad_id:', carreraModalidadIdFinal);
          
          await continuarCargaFases(carreraModalidadIdFinal);
          
        } else {
          console.log('Carrera-modalidad no existe, mostrando modal para configurar fechas...');
          setFases([]);
          
          // Las fechas se verificarán en verificarEstadoProceso() cuando se configure
          
          // Preparar los datos para cuando se confirme en el modal
          setPendingCarreraModalidadData({
            carrera_id: parseInt(fasesData.carreraId),
            modalidad_id: parseInt(fasesData.modalidadId),
            fasesData: {
              carreraId: fasesData.carreraId,
              modalidadId: fasesData.modalidadId,
              facultadId: fasesData.facultadId,
              facultadNombre: fasesData.facultadNombre,
              carreraNombre: fasesData.carreraNombre,
              modalidadData: fasesData.modalidadData,
              fromCarrerasModalidadesAdmin: fasesData.fromCarrerasModalidadesAdmin
            }
          });
          
          // Mostrar el modal para configurar fechas
          setShowDateProcessModal(true);
        }
        
      } catch (error) {
        console.error('Error general al cargar fases:', error);
        setError('Error al cargar datos: ' + error.message);
        setFases([]);
      } finally {
        setLoading(false);
        console.log(' === CARGA DE FASES FINALIZADA ===');
      }
    };

    loadFases();
    }, [
      fasesData?.carreraId,
      fasesData?.modalidadId,
      fasesData?.fromCarrerasModalidadesAdmin,
      fasesData?.carreraModalidadId,
      fasesData?.facultadId,
      fasesData?.facultadNombre,
      fasesData?.carreraNombre,
      fasesData?.modalidadData,
      location.state?.subfaseActualizada,
      // loadSubfasesForFase removido - ya no es necesario con endpoint consolidado
      showDateProcessModal,
      continuarCargaFases
    ]);

  // ✅ OPTIMIZACIÓN: useEffect optimizado para verificar el estado del proceso
  useEffect(() => {
    console.log('🔄 useEffect verificarEstadoProceso triggered');
    console.log('  - fasesData?.carreraId:', fasesData?.carreraId);
    console.log('  - fasesData?.modalidadId:', fasesData?.modalidadId);
    console.log('  - fasesData?.fromCarrerasModalidadesAdmin:', fasesData?.fromCarrerasModalidadesAdmin);
    console.log('  - fasesData?.fecha_ini_proceso:', fasesData?.fecha_ini_proceso);
    console.log('  - fasesData?.fecha_fin_proceso:', fasesData?.fecha_fin_proceso);
    console.log('  - botonFinalizarHabilitado actual:', botonFinalizarHabilitado);
    
    if (fasesData?.carreraId && fasesData?.modalidadId) {
      console.log('✅ Ejecutando verificarEstadoProceso...');
      verificarEstadoProceso();
    } else {
      console.log('❌ No se ejecuta verificarEstadoProceso - datos incompletos');
    }
  }, [
    // ✅ OPTIMIZACIÓN: Solo las dependencias críticas para evitar bucles
    verificarEstadoProceso, 
    fasesData?.carreraId, 
    fasesData?.modalidadId, 
    fasesData?.fromCarrerasModalidadesAdmin
    // ❌ REMOVIDO: fasesData?.fecha_ini_proceso, fasesData?.fecha_fin_proceso
    // Estas dependencias causaban múltiples re-renderizados innecesarios
  ]);

  const toggleFase = (faseId) => {
    setFases(fases.map(fase => 
      fase.id === faseId 
        ? { ...fase, expandida: !fase.expandida }
        : fase
    ));

    // OPTIMIZACIÓN: Ya no necesitamos cargar subfases dinámicamente
    // porque el endpoint consolidado ya las carga todas
    // La lógica anterior de loadSubfasesForFase ya no es necesaria
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
      setShowDeleteModal(false);
      setFaseToDelete(null);

      // Toast de éxito para eliminación
      toast.deleted('Fase eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar fase:', error);
      
      // Toast de error
      toast.error('Error al eliminar la fase: ' + error.message);
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
      let existeCarreraModalidad = null;
  
      // Si viene desde CarrerasModalidadesAdmin, usar directamente el ID proporcionado
      if (fasesData.fromCarrerasModalidadesAdmin && fasesData.carreraModalidadId) {
        carreraModalidadIdFinal = fasesData.carreraModalidadId;
        
        // Simular que existe para continuar con la creación
        existeCarreraModalidad = { id: fasesData.carreraModalidadId };
      } else {
      
        try {
          // PRIMERO buscar carrera-modalidad activa (dentro del rango de fechas)
          existeCarreraModalidad = await getCarreraModalidadActiva(
            fasesData.carreraId, 
            fasesData.modalidadId
          );
          
          if (existeCarreraModalidad) {
            carreraModalidadIdFinal = existeCarreraModalidad.id;
          } else {
            
            // Solo como respaldo, buscar cualquier carrera-modalidad existente
            console.log('🔍 RESPALDO: Buscando cualquier carrera-modalidad específica...');
            existeCarreraModalidad = await getCarreraModalidadEspecifica(
              fasesData.carreraId, 
              fasesData.modalidadId
            );
            
            if (existeCarreraModalidad) {
              console.log('RESPALDO exitoso - Carrera-modalidad encontrada (posiblemente fuera de fechas):', existeCarreraModalidad);
              carreraModalidadIdFinal = existeCarreraModalidad.id;
            }
          }
        } catch (error) {
          console.log('Error en búsqueda de carrera-modalidad:', error);
        }
      } // Cierre del else
      
      // Continuar con la lógica común para ambos casos
      if (fasesData.fromCarrerasModalidadesAdmin) {
        existeCarreraModalidad = { id: carreraModalidadIdFinal };
      } else {
        // La variable ya se asignó en el bloque anterior
      }
      
      if (!existeCarreraModalidad) {
        console.log('Buscando carrera-modalidad activa para creación de fase...');
        
        try {
          existeCarreraModalidad = await getCarreraModalidadActiva(
            fasesData.carreraId, 
            fasesData.modalidadId
          );
          
          if (existeCarreraModalidad) {
            console.log('✅ Carrera-modalidad activa encontrada para fase:', existeCarreraModalidad);
            carreraModalidadIdFinal = existeCarreraModalidad.id;
          } else {
            console.log('No hay carrera-modalidad activa para las fechas actuales');
            console.log('Se procederá a crear una nueva carrera-modalidad');
          }
        } catch (error) {
          console.log('Error en búsqueda de carrera-modalidad activa:', error);
        }
      }
      
      if (!existeCarreraModalidad) {
        console.log('🏗️ Carrera modalidad no existe, mostrando modal para configurar fechas...');
        
        if (!fasesData.modalidadId) {
          throw new Error('No se pudo obtener el ID de la modalidad');
        }
        
        // Preparar los datos para cuando se confirme en el modal
        setPendingCarreraModalidadData({
          carrera_id: parseInt(fasesData.carreraId),
          modalidad_id: parseInt(fasesData.modalidadId),
          fasesData: {
            carreraId: fasesData.carreraId,
            modalidadId: fasesData.modalidadId,
            facultadId: fasesData.facultadId,
            facultadNombre: fasesData.facultadNombre,
            carreraNombre: fasesData.carreraNombre,
            modalidadData: fasesData.modalidadData,
            fromCarrerasModalidadesAdmin: fasesData.fromCarrerasModalidadesAdmin
          }
        });
        
        // Mostrar el modal para configurar fechas
        setShowDateProcessModal(true);
        setLoading(false); // Detener el loading porque esperaremos la respuesta del modal
        return; // Salir de la función, continuará cuando se confirme el modal
        
      } else {
        carreraModalidadIdFinal = existeCarreraModalidad.id;
        
        setFasesData(prev => ({
          ...prev,
          carreraModalidadId: existeCarreraModalidad.id
        }));
      }
      
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

        // Toast de éxito para actualización
        toast.updated('Fase actualizada exitosamente');
        
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
          usuarioUpdated: nuevaFaseCreada.id_usuario_updated_user,
          createdAt: nuevaFaseCreada.created_at,
          updatedAt: nuevaFaseCreada.updated_at
        };
        
        setFases(prev => [...prev, nuevaFaseTransformada]);
        
        setSubfases(prev => ({
          ...prev,
          [nuevaFaseCreada.id]: []
        }));

        // Toast de éxito para creación
        toast.created('Fase creada exitosamente');
        
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
      
      // Toast de error
      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFase(null);
  };

  const handleFinalizarAcreditacion = () => {
    console.log('🚀 BOTÓN FINALIZAR PRESIONADO');
    console.log('  - botonFinalizarHabilitado:', botonFinalizarHabilitado);
    console.log('  - verificandoEstadoProceso:', verificandoEstadoProceso);
    console.log('  - fasesData:', fasesData);
    console.log('  - showFinalizarModal antes:', showFinalizarModal);
    
    if (!botonFinalizarHabilitado) {
      console.log('❌ Botón bloqueado - proceso no activo');
      alert('El proceso de acreditación no está activo en este momento. Verifique las fechas del proceso.');
      return;
    }
    
    console.log('✅ Abriendo modal de finalización');
    setShowFinalizarModal(true);
    console.log('📝 setShowFinalizarModal(true) ejecutado');
    
    // Verificar después de un pequeño delay
    setTimeout(() => {
      console.log('🔍 showFinalizarModal después del setState:', showFinalizarModal);
    }, 100);
  };

  const handleEditarFechasProceso = () => {
    console.log('📅 EDITAR FECHAS DE PROCESO');
    
    if (!fasesData) {
      toast.error('No se encontraron datos del proceso de acreditación.');
      return;
    }
    
    setShowEditDateModal(true);
  };

  const handleEditDateSuccess = async () => {
    console.log('✅ Fechas actualizadas exitosamente');
    setShowEditDateModal(false);
    
    // Actualizar los datos del proceso para reflejar los cambios
    try {
      if (fasesData.carreraModalidadId || fasesData.id) {
        console.log('🔄 Recargando datos del proceso...');
        const datosActualizados = await getCarreraModalidadPorId(fasesData.carreraModalidadId || fasesData.id);
        
        if (datosActualizados) {
          setFasesData(prev => ({
            ...prev,
            fecha_ini_proceso: datosActualizados.fecha_ini_proceso,
            fecha_fin_proceso: datosActualizados.fecha_fin_proceso,
            updated_at: datosActualizados.updated_at
          }));
          console.log('✅ Datos del proceso actualizados en el estado');
          
        }
      }
    } catch (error) {
      console.warn('❌ No se pudieron recargar los datos del proceso:', error);
      // Continuar sin error crítico, las fechas se actualizaron correctamente
    }
    
    // También re-verificar el estado del proceso
    verificarEstadoProceso();
  };

  const handleSubmitFinalizacion = async (formData) => {
    try {
      console.log('Iniciando finalización de acreditación...');
      console.log('Datos de finalización recibidos:', {
        fecha_ini_aprobacion: formData.get('fecha_ini_aprobacion'),
        fecha_fin_aprobacion: formData.get('fecha_fin_aprobacion'),
        certificado: formData.get('certificado')?.name || 'Sin archivo'
      });
      
      console.log('🔍 Verificando ID para finalización:');
      console.log('  - fasesData?.id:', fasesData?.id);
      console.log('  - fasesData?.carreraModalidadId:', fasesData?.carreraModalidadId);
      console.log('  - fasesData.modalidadId:', fasesData?.modalidadId);
      console.log('  - fasesData.carreraId:', fasesData?.carreraId);
      console.log('  - fasesData completo:', JSON.stringify(fasesData, null, 2));
      
      // Usar carreraModalidadId como primera opción, luego id como fallback
      let idParaFinalizar = fasesData?.carreraModalidadId || fasesData?.id;
      
      console.log('🎯 ID directo encontrado:', idParaFinalizar);
      
      // Si no tenemos ID directo, intentar buscar la carrera-modalidad activa
      if (!idParaFinalizar) {
        console.log('❓ No hay ID directo, buscando carrera-modalidad activa...');
        
        // Convertir IDs a números para asegurar compatibilidad
        const carreraIdNumero = parseInt(fasesData.carreraId);
        const modalidadIdNumero = parseInt(fasesData.modalidadId);
        
        console.log('🔄 Buscando con IDs convertidos:', { carreraId: carreraIdNumero, modalidadId: modalidadIdNumero });
        
        try {
          const carreraModalidadActiva = await getCarreraModalidadActiva(
            carreraIdNumero, 
            modalidadIdNumero
          );
          
          if (carreraModalidadActiva) {
            idParaFinalizar = carreraModalidadActiva.id;
            console.log('✅ ID encontrado desde carrera-modalidad activa:', idParaFinalizar);
          } else {
            // Si no hay activa, buscar cualquier carrera-modalidad específica
            console.log('🔍 No hay activa, buscando carrera-modalidad específica...');
            const carreraModalidadEspecifica = await getCarreraModalidadEspecifica(
              carreraIdNumero, 
              modalidadIdNumero
            );
            
            if (carreraModalidadEspecifica) {
              idParaFinalizar = carreraModalidadEspecifica.id;
              console.log('✅ ID encontrado desde carrera-modalidad específica:', idParaFinalizar);
            }
          }
        } catch (searchError) {
          console.error('❌ Error al buscar carrera-modalidad:', searchError);
        }
      }
      
      if (!idParaFinalizar) {
        console.error('❌ No se encontró el ID de la carrera-modalidad');
        throw new Error('No se encontró el ID de la carrera-modalidad');
      }
      
      console.log('✅ Usando ID para finalización:', idParaFinalizar);
      
      // Llamar a la API para finalizar la acreditación
      const resultado = await finalizarAcreditacion(idParaFinalizar, formData);
      
      console.log('✅ Acreditación finalizada exitosamente:', resultado);
      
      // Cerrar el modal
      setShowFinalizarModal(false);
      
      // Mostrar mensaje de éxito
      toast.success('🎉 Acreditación finalizada exitosamente. Se han guardado las fechas de aprobación y el certificado.');

      // Redirigir a CarrerasModalidadesAdmin
      navigate('/carrera-modalidades-admin');
      
    } catch (error) {
      console.error('❌ Error al finalizar acreditación:', error);
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
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
        console.log('Eliminando subfase:', subfase.id);
        
        const result = await deleteSubfase(subfase.id);
        
        if (result.success) {
          setSubfases(prev => ({
            ...prev,
            [faseId]: prev[faseId].filter(s => s.id !== subfase.id)
          }));

          toast.success('Subfase eliminada exitosamente');
        } else {
          throw new Error(result.error || 'Error al eliminar la subfase');
        }
        
      } catch (error) {
        console.error('Error al eliminar subfase:', error);
        toast.error('Error al eliminar la subfase: ' + error.message);
      }
    }
  };

  // ===== FUNCIONES DE DOCUMENTOS =====

  const loadDocumentos = async () => {
    try {
      const response = await getDocumentos();
      console.log('Response from getDocumentos:', response);
      
      // Asegurar que siempre sea un array
      let documentosData = [];
      
      // La respuesta del backend SIGESA tiene estructura: {exito, estado, mensaje, datos, error}
      if (response && response.datos && Array.isArray(response.datos)) {
        documentosData = response.datos;
      } else if (response && response.data && Array.isArray(response.data)) {
        documentosData = response.data;
      } else if (response && Array.isArray(response)) {
        documentosData = response;
      }
      
      console.log('Setting documentos to:', documentosData);
      setDocumentos(documentosData);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setDocumentos([]); // Asegurar que siempre sea un array en caso de error
      toast.error('Error al cargar documentos: ' + error.message);
    }
  };

  const handleAbrirModalDocumento = async (type, id) => {
    setDocumentoTarget({ type, id });
    await loadDocumentos();
    setShowDocumentModal(true);
  };

  const handleCerrarModalDocumento = () => {
    setShowDocumentModal(false);
    setDocumentoTarget({ type: null, id: null });
  };

  const handleCloseDateProcessModal = () => {
    setShowDateProcessModal(false);
    setPendingCarreraModalidadData(null);
    setDateProcessLoading(false);
  };

  const handleConfirmDateProcess = async (fechasData) => {
    if (!pendingCarreraModalidadData) return;
    
    try {
      setDateProcessLoading(true);
      
      const carreraModalidadData = {
        ...pendingCarreraModalidadData,
        fecha_ini_proceso: fechasData.fecha_ini_proceso,
        fecha_fin_proceso: fechasData.fecha_fin_proceso
      };
      
      const nuevaCarreraModalidad = await createCarreraModalidad(carreraModalidadData);
      
      // Actualizar el estado con la nueva carrera-modalidad
      setFasesData(prev => ({
        ...prev,
        carreraModalidadId: nuevaCarreraModalidad.id
      }));
      
      // Las fechas se verificarán en verificarEstadoProceso() después de crear la carrera-modalidad
      
      // Cerrar el modal
      handleCloseDateProcessModal();
      
      // Continuar cargando las fases ahora que tenemos la carrera-modalidad
      setLoading(true);
      
      // Reactivar la carga de fases con el nuevo ID
      const carreraModalidadIdFinal = nuevaCarreraModalidad.id;
      
      // Continuar con la lógica de carga de fases...
      await continuarCargaFases(carreraModalidadIdFinal);
      
    } catch (error) {
      console.error('💥 Error al crear carrera-modalidad con fechas:', error);
      setError('No se pudo crear la relación carrera-modalidad: ' + error.message);
      setDateProcessLoading(false);
    }
  };

  const handleSeleccionarDocumento = async (documento) => {
    try {
      console.log('Asociando documento:', documento.id, 'a', documentoTarget.type, documentoTarget.id);
      
      if (documentoTarget.type === 'fase') {
        await asociarDocumentoAFase(documentoTarget.id, documento.id);
        toast.success('Documento asociado a la fase exitosamente');
      } else if (documentoTarget.type === 'subfase') {
        await asociarDocumentoASubfase(documentoTarget.id, documento.id);
        toast.success('Documento asociado a la subfase exitosamente');
      }
      
      // No necesitamos recargar documentos aquí porque no se creó uno nuevo
      handleCerrarModalDocumento();
    } catch (error) {
      console.error('Error al asociar documento:', error);
      toast.error('Error al asociar documento: ' + error.message);
    }
  };

  const handleSubirDocumento = async (documentoData) => {
    try {
      console.log('Subiendo nuevo documento:', documentoData);
      
      // Crear el documento
      const response = await createDocumento(documentoData);
      console.log('Response de createDocumento:', response);
      
      // La respuesta del backend tiene estructura: {exito, estado, mensaje, datos, error}
      const nuevoDocumento = response.datos || response.data || response;
      console.log('Nuevo documento creado:', nuevoDocumento);
      console.log('ID del nuevo documento:', nuevoDocumento.id);
      
      if (!nuevoDocumento.id) {
        throw new Error('No se pudo obtener el ID del documento creado');
      }
      
      // Asociar inmediatamente al target
      if (documentoTarget.type === 'fase') {
        console.log('Asociando a fase:', documentoTarget.id, 'documento:', nuevoDocumento.id);
        await asociarDocumentoAFase(documentoTarget.id, nuevoDocumento.id);
        toast.success('Documento subido y asociado a la fase exitosamente');
      } else if (documentoTarget.type === 'subfase') {
        console.log('Asociando a subfase:', documentoTarget.id, 'documento:', nuevoDocumento.id);
        await asociarDocumentoASubfase(documentoTarget.id, nuevoDocumento.id);
        toast.success('Documento subido y asociado a la subfase exitosamente');
      }
      
      handleCerrarModalDocumento();
      
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir documento: ' + error.message);
      throw error; // Re-lanzar para que el modal maneje el estado de loading
    }
  };

  const handleMostrarDetallesFase = async (fase) => {
    try {
      setShowDetallesModal(true);
      
      console.log('🔍 Cargando documentos para la fase:', fase.id, fase.nombre_fase);
      
      // Obtener documentos asociados a la fase
      const response = await getDocumentosByFase(fase.id);
      console.log('📄 Respuesta completa de getDocumentosByFase:', response);
      
      // Extraer los documentos del formato de respuesta de SIGESA
      const documentos = response?.datos || response || [];
      console.log('📋 Documentos extraídos:', documentos);
      
      setDetallesData({
        tipo: 'fase',
        data: fase,
        documentos: documentos
      });
    } catch (error) {
      console.error('❌ Error al cargar detalles de la fase:', error);
      setDetallesData({
        tipo: 'fase',
        data: fase,
        documentos: []
      });
    }
  };

  const handleMostrarDetallesSubfase = async (subfase, faseId) => {
    try {
      setShowDetallesModal(true);
      
      console.log('🔍 Cargando documentos para la subfase:', subfase.id, subfase.nombre_subfase);
      
      // Obtener documentos asociados a la subfase
      const response = await getDocumentosBySubfase(subfase.id);
      console.log('📄 Respuesta completa de getDocumentosBySubfase:', response);
      
      // Extraer los documentos del formato de respuesta de SIGESA
      const documentos = response?.datos || response || [];
      console.log('📋 Documentos extraídos:', documentos);
      
      setDetallesData({
        tipo: 'subfase',
        data: subfase,
        documentos: documentos
      });
    } catch (error) {
      console.error('❌ Error al cargar detalles de la subfase:', error);
      setDetallesData({
        tipo: 'subfase',
        data: subfase,
        documentos: []
      });
    }
  };

  const handleCerrarDetallesModal = () => {
    setShowDetallesModal(false);
    setDetallesData({
      tipo: null,
      data: null,
      documentos: []
    });
  };

  // Funciones para manejar modales FODA y PLAME
  const handleAbrirFoda = (subfase) => {
    setSubfaseSeleccionada(subfase);
    setShowFodaModal(true);
  };

  const handleCerrarFoda = () => {
    setShowFodaModal(false);
    setSubfaseSeleccionada(null);
  };

  const handleAbrirPlame = (subfase) => {
    setSubfaseSeleccionada(subfase);
    setShowPlameModal(true);
  };

  const handleCerrarPlame = () => {
    setShowPlameModal(false);
    setSubfaseSeleccionada(null);
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
        <span>{fasesData.modalidad?.replace('-', ' ').replace('arco', 'arcu').toUpperCase()}</span>
        <span className="separator">&gt;&gt;</span>
        <span className="current">{fasesData.carreraNombre}</span>
      </div>

      {fases.length > 0 && (
        <div className="action-buttons-header">
          {puedeRealizarAcciones() && (
            <button className="btn-agregar-fase" onClick={handleAgregarFase}>
              Agregar Fase
            </button>
          )}
          {puedeRealizarAcciones() && (
            <button 
              className={`btn-finalizar ${verificandoEstadoProceso ? 'loading' : ''} ${!botonFinalizarHabilitado ? 'disabled' : ''}`}
              onClick={
                (verificandoEstadoProceso || !botonFinalizarHabilitado)
                  ? undefined
                  : handleFinalizarAcreditacion
              }
              disabled={verificandoEstadoProceso || !botonFinalizarHabilitado}
              title={
                verificandoEstadoProceso 
                  ? 'Verificando estado del proceso...' 
                  : !botonFinalizarHabilitado 
                    ? 'El proceso de acreditación no está activo en este momento'
                    : 'Finalizar proceso de acreditación'
              }
            >
              {verificandoEstadoProceso ? (
                <>
                  <span className="loading-spinner"></span>
                  Verificando...
                </>
              ) : (
                <>
                  Finalizar Acreditación
                </>
              )}
            </button>
          )}
          {puedeRealizarAcciones() && (
            <button 
              className="btn-editar-fechas"
              onClick={handleEditarFechasProceso}
              title="Editar fechas de inicio y fin del proceso de acreditación"
            >
              <Calendar size={16} />
              Editar Fechas
            </button>
          )}
        </div>
      )}

      <div className="fases-list">
        {fases.length === 0 ? (
          <div className="no-fases">
            <div className="empty-state">
              <div className="empty-icon">
                📋
              </div>
              <h3>No hay fases creadas</h3>
              <p>
                 Para <strong>{fasesData.carreraNombre}</strong> - {fasesData.modalidad?.replace('-', ' ').replace('arco', 'arcu').toUpperCase()}
              </p>
              {puedeRealizarAcciones() && (
                <button className="btn-crear-primera-fase" onClick={handleAgregarFase}>
                  + Crear primera fase
                </button>
              )}
            </div>
          </div>
        ) : (
          fases.map((fase) => (
            <div key={fase.id} className="fase-item">
              <div 
                className="fase-header"
                onClick={() => toggleFase(fase.id)}
              >
                <div className="fase-info">
                  <h3 
                    className="fase-nombre clickeable" 
                    onClick={() => handleMostrarDetallesFase(fase)}
                    title="Ver detalles de la fase"
                  >
                    {fase.nombre}
                  </h3>
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
                    {puedeRealizarAcciones() && (
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
                    )}
                    <button 
                      className="action-icon document"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAbrirModalDocumento('fase', fase.id);
                      }}
                      title="Agregar documento"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {puedeRealizarAcciones() && (
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
                    )}
                    {puedeRealizarAcciones() && (
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
                    )}
                  </div>                  <div className="fase-progress">
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
                  {subfases[fase.id] && subfases[fase.id].length > 0 ? (
                    <div className="subfases-list">
                      <div className="subfases-header">
                        <h4>Subfases</h4>
                      </div>
                      {subfases[fase.id].map((subfase, index) => (
                        <div key={subfase.id} className="subfase-item">
                          <div className="subfase-numero">{index + 1}.</div>
                          <div className="subfase-content">
                            <div className="subfase-info">
                              <div className="subfase-nombre-container">
                                <span 
                                  className="subfase-nombre clickeable"
                                  onClick={() => handleMostrarDetallesSubfase(subfase, fase.id)}
                                  title="Ver detalles de la subfase"
                                >
                                  {subfase.nombre}
                                </span>
                                <div className="subfase-badges">
                                  {subfase.tiene_foda && (
                                    <span className="analysis-badge foda-badge" title="Análisis FODA habilitado">
                                      FODA
                                    </span>
                                  )}
                                  {subfase.tiene_plame && (
                                    <span className="analysis-badge plame-badge" title="Matriz PLAME habilitada">
                                      PLAME
                                    </span>
                                  )}
                                </div>
                              </div>
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
                              {subfase.tiene_foda && (
                                <button 
                                  className="action-icon foda"
                                  onClick={() => handleAbrirFoda(subfase)}
                                  title="Análisis FODA"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 12L9 18L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              
                              {subfase.tiene_plame && (
                                <button 
                                  className="action-icon plame"
                                  onClick={() => handleAbrirPlame(subfase)}
                                  title="Matriz PLAME"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 3V21M15 3V21M3 9H21M3 15H21" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              
                              <button 
                                className="action-icon document"
                                onClick={() => handleAbrirModalDocumento('subfase', subfase.id)}
                                title="Agregar documento"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              {puedeRealizarAcciones() && (
                                <button 
                                  className="action-icon edit"
                                  onClick={() => handleEditarSubfase(subfase, fase.id)}
                                  title="Editar subfase"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.50023C18.8978 2.1024 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1215 3.43762 22.1215 4.00023C22.1215 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              {puedeRealizarAcciones() && (
                                <button 
                                  className="action-icon delete"
                                  onClick={() => handleEliminarSubfase(subfase, fase.id)}
                                  title="Eliminar subfase"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              
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

      <ModalEscogerDocumento
        isOpen={showDocumentModal}
        onClose={handleCerrarModalDocumento}
        onSelect={handleSeleccionarDocumento}
        onUpload={handleSubirDocumento}
        existingDocuments={documentos}
      />

      <ModalDetallesFase
        isOpen={showDetallesModal}
        onClose={handleCerrarDetallesModal}
        fase={detallesData.tipo === 'fase' ? detallesData.data : null}
        subfase={detallesData.tipo === 'subfase' ? detallesData.data : null}
        tipo={detallesData.tipo}
        documentosAsociados={detallesData.documentos}
      />

      <DateProcessModal
        isOpen={showDateProcessModal}
        onClose={handleCloseDateProcessModal}
        onConfirm={handleConfirmDateProcess}
        carreraNombre={fasesData?.carreraNombre || 'Carrera no especificada'}
        modalidadNombre={fasesData?.modalidadData?.nombre_modalidad || 'Modalidad no especificada'}
        loading={dateProcessLoading}
      />

      <FinalizarAcreditacionModal
        show={showFinalizarModal}
        onClose={() => setShowFinalizarModal(false)}
        onConfirm={handleSubmitFinalizacion}
        carreraModalidadData={fasesData}
      />

      <FodaModal
        isOpen={showFodaModal}
        onClose={handleCerrarFoda}
        subfase={subfaseSeleccionada}
      />

      <PlameModal
        isOpen={showPlameModal}
        onClose={handleCerrarPlame}
        subfase={subfaseSeleccionada}
      />

      {/* Modal de edición de fechas del proceso */}
      {showEditDateModal && (
        <div className="modal-overlay" onClick={() => setShowEditDateModal(false)}>
          <div className="modal-content edit-dates-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Calendar size={20} />
                Editar Fechas del Proceso
              </h3>
              <button className="close-button" onClick={() => setShowEditDateModal(false)}>
                ×
              </button>
            </div>
            
            <EditDateProcessForm 
              fasesData={fasesData}
              onClose={() => setShowEditDateModal(false)}
              onSuccess={handleEditDateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FasesScreen;
