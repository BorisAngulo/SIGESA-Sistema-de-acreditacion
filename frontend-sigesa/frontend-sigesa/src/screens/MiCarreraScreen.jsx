import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCarreraModalidadActiva } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './MiCarreraScreen.css';

const MiCarreraScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [carreraModalidad, setCarreraModalidad] = useState(null);
  const [error, setError] = useState(null);
  const [carreraInfo, setCarreraInfo] = useState(null);

  useEffect(() => {
    const verificarCarreraModalidad = async () => {
      if (!user || !user.id_carrera_usuario) {
        setError('No se encontró información de carrera para este usuario');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Buscando carrera-modalidad activa para carrera:', user.id_carrera_usuario);
        
        // Buscar carrera-modalidad activa para ambas modalidades
        const modalidades = [1, 2]; // ARCU SUR y CEUB
        let carreraModalidadEncontrada = null;
        
        for (const modalidadId of modalidades) {
          try {
            console.log(`🔍 Buscando carrera-modalidad activa para carrera ${user.id_carrera_usuario} y modalidad ${modalidadId}`);
            const resultado = await getCarreraModalidadActiva(user.id_carrera_usuario, modalidadId);
            if (resultado) {
              carreraModalidadEncontrada = resultado;
              console.log('✅ Carrera-modalidad activa encontrada:', resultado);
              break;
            } else {
              console.log(`❌ No se encontró carrera-modalidad activa para modalidad ${modalidadId}`);
            }
          } catch (err) {
            console.log(`ℹ️ Error al buscar modalidad ${modalidadId}:`, err);
          }
        }

        if (carreraModalidadEncontrada) {
          setCarreraModalidad(carreraModalidadEncontrada);
          
          console.log('🔍 Debug - carreraModalidadEncontrada:', carreraModalidadEncontrada);
          console.log('🔍 Debug - user.carrera:', user.carrera);
          
          // Obtener información de carrera del usuario directamente
          const nombreCarrera = user.carrera?.nombre_carrera || 
                               carreraModalidadEncontrada.carrera?.nombre_carrera || 
                               'Carrera no disponible';
          
          // Determinar modalidad basada en modalidad_id
          let nombreModalidad = 'Modalidad no disponible';
          if (carreraModalidadEncontrada.modalidad_id === 1) {
            nombreModalidad = 'ARCU SUR';
          } else if (carreraModalidadEncontrada.modalidad_id === 2) {
            nombreModalidad = 'CEUB';
          } else if (carreraModalidadEncontrada.modalidad?.nombre_modalidad) {
            nombreModalidad = carreraModalidadEncontrada.modalidad.nombre_modalidad;
          }
          
          setCarreraInfo({
            nombre: nombreCarrera,
            modalidad: nombreModalidad,
            fecha_inicio: carreraModalidadEncontrada.fecha_ini_proceso,
            fecha_fin: carreraModalidadEncontrada.fecha_fin_proceso
          });
          
          console.log('📋 Información configurada:', {
            nombre: nombreCarrera,
            modalidad: nombreModalidad,
            fecha_inicio: carreraModalidadEncontrada.fecha_ini_proceso,
            fecha_fin: carreraModalidadEncontrada.fecha_fin_proceso
          });
        } else {
          setError('no_proceso_activo');
        }
      } catch (err) {
        console.error('❌ Error al verificar carrera-modalidad:', err);
        setError('Error al verificar el proceso de acreditación');
      } finally {
        setLoading(false);
      }
    };

    verificarCarreraModalidad();
  }, [user]);

  const handleVerFases = () => {
    if (carreraModalidad) {
      // Navegar a las fases con los parámetros necesarios
      navigate(`/fases?carrera=${user.id_carrera_usuario}&modalidad=${carreraModalidad.modalidad_id}&carreraModalidadId=${carreraModalidad.id}`);
    }
  };

  if (loading) {
    return (
      <div className="mi-carrera-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Verificando proceso de acreditación...</p>
        </div>
      </div>
    );
  }

  if (error === 'no_proceso_activo') {
    return (
      <div className="mi-carrera-container">
        <div className="no-proceso-container">
          <div className="no-proceso-icon">📋</div>
          <h2>No hay proceso de acreditación activo</h2>
          <p className="no-proceso-message">
            Actualmente no existe un proceso de acreditación activo para tu carrera.
          </p>
          <p className="no-proceso-submessage">
            El proceso de acreditación aún no ha sido creado o las fechas del proceso no están vigentes.
            Contacta con el administrador para más información.
          </p>
          <div className="no-proceso-info">
            <p><strong>Carrera:</strong> {user.carrera?.nombre_carrera || 'No especificada'}</p>
            <p><strong>Usuario:</strong> {user.name} {user.lastName}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mi-carrera-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mi-carrera-container">
      <div className="mi-carrera-header">
        <h1>Mi Carrera - Proceso de Acreditación</h1>
        <div className="carrera-info-card">
          <div className="carrera-info-item">
            <span className="info-label">Carrera:</span>
            <span className="info-value">{carreraInfo?.nombre}</span>
          </div>
          <div className="carrera-info-item">
            <span className="info-label">Modalidad:</span>
            <span className="info-value">{carreraInfo?.modalidad}</span>
          </div>
          <div className="carrera-info-item">
            <span className="info-label">Periodo del proceso:</span>
            <span className="info-value">
              {carreraInfo?.fecha_inicio ? 
                `${new Date(carreraInfo.fecha_inicio).toLocaleDateString()} - ${
                  carreraInfo.fecha_fin ? 
                  new Date(carreraInfo.fecha_fin).toLocaleDateString() : 
                  'Sin fecha límite'
                }` : 
                'Sin fechas definidas'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="proceso-activo-container">
        <div className="proceso-activo-icon">✅</div>
        <h2>Proceso de Acreditación Activo</h2>
        <p className="proceso-activo-message">
          Tu carrera tiene un proceso de acreditación activo y vigente.
        </p>
        <button 
          className="ver-fases-button"
          onClick={handleVerFases}
        >
          Ver Fases del Proceso
        </button>
      </div>
    </div>
  );
};

export default MiCarreraScreen;
